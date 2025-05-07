import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } from 'baileys';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { saveMessage } from './ChatsService.js';

const prisma = new PrismaClient();

async function startWhatsApp(handlers, instanceId, userId) {
  try {
    const authFolder = path.resolve(`./sessions/${instanceId}`);
    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({ version, auth: state });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async ({ qr, connection, lastDisconnect }) => {
      if (qr) {
        console.log(`Novo QR code gerado para ${userId}`);
        handlers.emitQR(qr);
      }

      if (connection === 'open') {
        let phoneNumber = null;
        for (let i = 0; i < 5; i++) {
          if (sock.user?.id) {
            phoneNumber = sock.user.id.split(':')[0] || null;
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log(`Conexão aberta para ${userId}, phoneNumber: ${phoneNumber}`);

        await prisma.whatsappConnection.upsert({
          where: {
            userId_type_unique: {
              userId,
              type: 'ia'
            }
          },
          update: { isConnected: true, phoneNumber },
          create: {
            userId,
            type: 'ia',
            phoneNumber,
            isConnected: true
          }
        });

        handlers.onConnected(phoneNumber);
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode || 0;
        const isAuthError = statusCode === 401;

        try {
          await prisma.whatsappConnection.updateMany({
            where: { userId, type: 'ia' },
            data: { isConnected: false, phoneNumber: null },
          });

          if (isAuthError) {
            handlers.onDisconnected({
              code: statusCode,
              message: 'Erro de autenticação - Requer novo QR Code'
            });
            
            fs.rmSync(authFolder, { recursive: true, force: true });
            console.log(`Credenciais da instância ${instanceId} removidas`);
            
            console.log(`Reiniciando instância para ${userId} devido a erro 401`);
            startWhatsApp(handlers, instanceId, userId);
          } 
        } catch (err) {
          console.error(`Erro durante desconexão para ${userId}:`, err);
          handlers.onDisconnected({
            code: 500,
            message: 'Erro interno durante desconexão'
          });
        }
      }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
      const msg = messages[0];
      if (!msg.message || msg.key.fromMe) return;

      const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
      if (!text?.toLowerCase().includes('suporte')) return;

      const leadNumber = msg.key.remoteJid.split('@')[0];
      const type = 'ia';

      const connectionId = await prisma.whatsappConnection.findFirst({
        where: {
          userId,
          type
        },
        select: {
          id: true
        }
      });

      await saveMessage({
        connectionId: connectionId.id,
        leadNumber,
        senderType: 'lead',
        messageText: text
      });

      try {
        const response = await fetch('http://localhost:5000/api/crewai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });

        const data = await response.json();
        if (data?.response) {
          await sock.sendMessage(msg.key.remoteJid, { text: data.response });
        }
      } catch (err) {
        console.error('Erro ao chamar IA:', err);
      }
    });

  } catch (error) {
    console.error(`Erro na instância ${instanceId}:`, error);
    handlers.onDisconnected({
      code: 500,
      message: 'Erro interno ao iniciar WhatsApp'
    });
    if (activeInstances[userId]) {
      delete activeInstances[userId];
    }
  }
}

export default startWhatsApp;