import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getConnectionStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: "ID de usuário é obrigatório" });
    }

    const connection = await prisma.whatsappConnection.findFirst({
      where: { 
        userId: userId.replace(/"/g, ''),
        type: 'ia'
      },
      select: {
        isConnected: true,
        phoneNumber: true,
        createdAt: true  // Use createdAt em vez de updatedAt
      }
    });

    res.json({
      isConnected: connection?.isConnected || false,
      phoneNumber: connection?.phoneNumber || null,
      lastUpdated: connection?.createdAt || null  // Retorna createdAt como lastUpdated
    });

  } catch (error) {
    console.error('Erro ao verificar status:', error);
    res.status(500).json({ 
      error: "Erro interno",
      details: error.message 
    });
  }
};