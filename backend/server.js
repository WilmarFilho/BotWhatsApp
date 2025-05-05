// backend/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@adiwajshing/baileys');
const { CrewAI } = require('crewai');
require('dotenv').config();

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = 3001;

// Configuração CrewAI (exemplo simples)
const crew = new CrewAI({
  agents: [
    {
      name: 'Atendente IA',
      instructions: 'Responda de forma educada dúvidas comuns dos clientes.',
      tools: [], // você pode conectar APIs aqui depois
    }
  ]
});

async function startWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { qr, connection } = update;

    if (qr) {
      console.log('Enviando QR para frontend...');
      io.emit('qr', qr);
    }

    if (connection === 'open') {
      console.log('Conectado ao WhatsApp!');
      io.emit('connected');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

    console.log(`Mensagem recebida: ${text}`);

    if (text) {
      // Envia para o agente IA do Crew
      const result = await crew.run(text);
      const resposta = result.output;

      // Envia a resposta para o usuário no WhatsApp
      await sock.sendMessage(msg.key.remoteJid, { text: resposta });
    }
  });
}

io.on('connection', () => {
  console.log('Frontend conectado via socket.');
});

startWhatsApp();

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
