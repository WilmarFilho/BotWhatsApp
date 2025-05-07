import startWhatsApp from '../services/whatsappService.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let activeInstances = {};

function setupIANamespace(iaNamespace) {
  iaNamespace.on('connection', async (socket) => {
    console.log('Cliente conectado ao /connectIA', socket.id);

    socket.on('set-user', async (userId) => {
      try {
        const dbConnection = await prisma.whatsappConnection.findUnique({
          where: { userId_type_unique: { userId, type: 'ia' } }
        });

        if (activeInstances[userId]) {
          console.log(`Instância ativa encontrada para ${userId}`);
          syncState(socket, activeInstances[userId]);
          activeInstances[userId].socketId = socket.id; // Atualiza socketId
          return;
        }

        if (dbConnection?.isConnected) {
          console.log(`Reconectando instância para ${userId}`);
          await initializeWhatsAppInstance(socket, userId);
          return;
        }

        console.log(`Iniciando nova instância para ${userId}`);
        await initializeWhatsAppInstance(socket, userId);
      } catch (error) {
        console.error(`Erro ao configurar usuário ${userId}:`, error);
        socket.emit('error', { message: 'Erro ao configurar conexão' });
      }
    });

    socket.on('get-qr', async () => {
      try {
        const userId = Object.keys(activeInstances).find(
          key => activeInstances[key].socketId === socket.id
        );
        if (userId) {
          console.log(`Forçando novo QR code para ${userId}`);
          activeInstances[userId].isRestarting = true;
          await initializeWhatsAppInstance(socket, userId);
        } else {
          console.warn(`Nenhuma instância encontrada para socket ${socket.id}`);
          socket.emit('error', { message: 'Nenhuma instância ativa encontrada' });
        }
      } catch (error) {
        console.error('Erro ao gerar novo QR code:', error);
        socket.emit('error', { message: 'Erro ao gerar novo QR code' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket ${socket.id} desconectado`);
    });
  });
}

function syncState(socket, instance) {
  if (instance.isConnected) {
    socket.emit('connected', { 
      phoneNumber: instance.phoneNumber,
      lastConnection: instance.lastConnection
    });
  } else if (instance.lastQr) {
    socket.emit('qr', instance.lastQr);
  }
}

async function initializeWhatsAppInstance(socket, userId) {
  const instanceId = `ia-${userId}`;
  
  if (!activeInstances[userId]) {
    activeInstances[userId] = {
      isConnected: false,
      lastQr: null,
      phoneNumber: null,
      lastConnection: new Date(),
      socketId: socket.id,
      isRestarting: false
    };
  } else {
    activeInstances[userId].socketId = socket.id;
    activeInstances[userId].isRestarting = false;
  }

  console.log(`Inicializando WhatsApp para userId: ${userId}, instanceId: ${instanceId}, socketId: ${socket.id}`);

  startWhatsApp(
    {
      emitQR: (qr) => {
        if (!activeInstances[userId]) {
          console.warn(`Instância para ${userId} não encontrada ao emitir QR`);
          activeInstances[userId] = {
            isConnected: false,
            lastQr: qr,
            phoneNumber: null,
            lastConnection: new Date(),
            socketId: socket.id,
            isRestarting: false
          };
        }
        activeInstances[userId].lastQr = qr;
        socket.emit('qr', qr);
        console.log(`QR code emitido para ${userId}, socketId: ${socket.id}`);
      },
      onConnected: (phoneNumber) => {
        if (!activeInstances[userId]) {
          console.warn(`Instância para ${userId} não encontrada ao conectar`);
          activeInstances[userId] = {
            isConnected: true,
            lastQr: null,
            phoneNumber: phoneNumber || null,
            lastConnection: new Date(),
            socketId: socket.id,
            isRestarting: false
          };
        }
        activeInstances[userId].isConnected = true;
        activeInstances[userId].phoneNumber = phoneNumber || null;
        activeInstances[userId].lastConnection = new Date();
        socket.emit('connected', { phoneNumber: phoneNumber || null });
        console.log(`Conexão estabelecida para ${userId}, phoneNumber: ${phoneNumber}, socketId: ${socket.id}`);
        
        prisma.whatsappConnection.upsert({
          where: { userId_type_unique: { userId, type: 'ia' } },
          update: { isConnected: true, phoneNumber: phoneNumber || null },
          create: { userId, type: 'ia', phoneNumber: phoneNumber || null, isConnected: true }
        }).catch(err => {
          console.error(`Erro ao atualizar conexão para ${userId}:`, err);
        });
      },
      onDisconnected: ({ code, message }) => {
        if (!activeInstances[userId]) {
          console.warn(`Instância para ${userId} não encontrada ao desconectar`);
          return;
        }
        activeInstances[userId].isConnected = false;
        activeInstances[userId].phoneNumber = null;
        socket.emit('disconnected', { code, message });
        console.log(`Desconexão notificada para ${userId}, code: ${code}, socketId: ${socket.id}`);
        
        prisma.whatsappConnection.updateMany({
          where: { userId, type: 'ia' },
          data: { isConnected: false, phoneNumber: null }
        }).catch(err => {
          console.error(`Erro ao atualizar desconexão para ${userId}:`, err);
        });
        
        if (!activeInstances[userId].isRestarting) {
          console.log(`Removendo instância para ${userId}`);
          delete activeInstances[userId];
        }
      }
    },
    instanceId,
    userId
  );
}

export default setupIANamespace;