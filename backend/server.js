import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';

// Carrega variáveis do .env
dotenv.config();

// Inicializa o app Express
const app = express();
app.use(cors());
app.use(express.json());

// Configura o servidor HTTP e Socket.io
const server = http.createServer(app);

// Importa as rotas
import authRoutes from './routes/AuthRoutes.js';
import iaRoutes from './routes/ConnectionIARoutes.js';
import ChatRoutes from './routes/ChatsRoutes.js';

// Usa as rotas
app.use('/api/auth', authRoutes);
app.use('/api/ia', iaRoutes);  // Prefixo para rotas de IA
app.use('/api/chats', ChatRoutes);



//Socket para Chat com IA
import { Server } from 'socket.io';
import setupIANamespace from './sockets/ia.namespace.js';
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
const iaNamespace = io.of('/connectIA');
setupIANamespace(iaNamespace);





// Inicia o servidor
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
