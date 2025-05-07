import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const saveMessage = async (params) => {
  const { connectionId, leadNumber } = params;

  return await prisma.$transaction(async (tx) => {
    // 1. Verifique se a conexão existe
    const connection = await tx.whatsappConnection.findUnique({
      where: { id: connectionId }
    });

    if (!connection) {
      throw new Error(`Conexão WhatsApp não encontrada: ${connectionId}`);
    }

    // 2. Upsert do Chat
    const chat = await prisma.chat.upsert({
      where: {
        whatsappConnectionId_leadNumber: {
          whatsappConnectionId: connectionId,
          leadNumber: leadNumber
        }
      },
      create: {
        whatsappConnection: {
          connect: { id: connectionId }
        },
        leadNumber: leadNumber,
        lastMessageAt: new Date(),
        isActive: true,
        createdAt: new Date()
      },
      update: {
        lastMessageAt: new Date(),
        isActive: true
      }
    });

    // 3. Crie a mensagem
    return await tx.message.create({
      data: {
        chat: { connect: { id: chat.id } },
        senderType: params.senderType,
        senderId: params.senderId,
        message: params.messageText,
        timestamp: new Date()
      }
    });
  });
};

export const getMessages = async ({ connectionId }) => {
  try {
    // 1. Buscar todos os chats dessa conexão
    const chats = await prisma.chat.findMany({
      where: {
        whatsappConnectionId: connectionId
      },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' }, // Ordem cronológica
          include: {
            attendant: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    // 2. Formatar resultado
    const formattedChats = chats.map(chat => ({
      chatId: chat.id,
      leadNumber: chat.leadNumber,
      messages: chat.messages
    }));

    return {
      chats: formattedChats,
      totalChats: chats.length
    };

  } catch (error) {
    console.error('Erro ao buscar chats e mensagens:', {
      connectionId,
      error: error.message
    });
    throw error;
  }
};
