import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } from 'baileys';
import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();

async function startWhatsApp(handlers, instanceId, userId) { // Recebe userId agora
  try {
    const authFolder = path.resolve(`./sessions/${instanceId}`);
    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({ version, auth: state });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async ({ qr, connection, lastDisconnect }) => {
      if (qr) handlers.emitQR(qr);

      if (connection === 'open') {

        const phoneNumber = sock.user?.id.split(':')[0] || 'N/A';

        // Use cleanUserId em TODAS as chamadas do Prisma:
        await prisma.whatsappConnection.upsert({
          where: {
            userId_type_unique: {
              userId: userId, // Usa o ID limpo
              type: 'ia'
            }
          },
          update: { isConnected: true, phoneNumber },
          create: {
            userId: userId,
            type: 'ia',
            phoneNumber,
            isConnected: true
          }
        });

        handlers.onConnected();
      }

      if (connection === 'close') {
        try {
          // 1. Atualiza o BD para "desconectado"
          await prisma.whatsappConnection.updateMany({
            where: {
              userId: userId, // Use o cleanUserId corrigido
              type: 'ia'
            },
            data: {
              isConnected: false,
              phoneNumber: '00' // Opcional: limpa o número
            },
          });

          // 2. Limpa as credenciais de sessão local
          const authFolder = path.resolve(`./sessions/${instanceId}`);
          try {
            fs.rmSync(authFolder, { recursive: true, force: true });
            console.log(`Credenciais da instância ${instanceId} removidas`);
          } catch (fsError) {
            console.error('Erro ao limpar credenciais:', fsError);
          }

          // 3. Notifica o frontend
          if (handlers.onDisconnected) {
            handlers.onDisconnected({
              code: lastDisconnect?.error?.output?.statusCode || 0,
              message: "Desconectado do WhatsApp"
            });
          }

          // 4. Reconexão automática (se não for erro de autenticação)
          const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
          if (shouldReconnect) {
            console.log('Reconectando em 5 segundos...');
            setTimeout(() => startWhatsApp(handlers, instanceId, userId), 5000);
          } else {
            console.log('Erro de autenticação - Requer novo QR Code');
          }

        } catch (dbError) {
          console.error('Erro durante desconexão:', dbError);
          // Garante que o frontend seja notificado mesmo em caso de erro
          if (handlers.onDisconnected) handlers.onDisconnected({
            code: 500,
            message: "Erro interno durante desconexão"
          });
        }
      }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
      const msg = messages[0];
      if (!msg.message || msg.key.fromMe) return;

      const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
      if (!text?.toLowerCase().includes('suporte')) return;

      try {
        const response = await fetch('http://localhost:5000/api/crewai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });

        const data = await response.json();
        if (data?.response) {
          await sock.sendMessage(msg.key.remoteJid, { text: data.response });

          handlers.onIAResponse({
            remetente: msg.key.remoteJid,
            pergunta: text,
            resposta: data.response
          });
        }
      } catch (err) {
        console.error('Erro ao chamar IA:', err);
      }
    });

  } catch (error) {
    console.error(`Erro na instância ${instanceId}:`, error);
  }
}

export default startWhatsApp;