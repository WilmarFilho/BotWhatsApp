import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { createWhatsappInstance } from './services/whatsappService.js';

// Carrega variáveis do .env
dotenv.config();

// Inicializa o app Express
const app = express();
app.use(cors());
app.use(express.json()); // Para permitir o envio de JSON no corpo das requisições

// Configura o servidor HTTP e Socket.io
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
app.set('io', io);  // Torna o 'io' acessível nas rotas

// Importa as rotas
import authRoutes from './routes/authRoutes.js';
import iaRoutes from './routes/iaRoutes.js';
import multiAttendantRoutes from './routes/multiAttendantRoutes.js';

// Usa as rotas
app.use('/api/auth', authRoutes);
app.use('/api/ia', iaRoutes);
app.use('/api/multiattendant', multiAttendantRoutes);

// Inicia o servidor
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
