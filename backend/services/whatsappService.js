import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } from 'baileys';

// Gerenciador de instâncias do WhatsApp
const whatsappInstances = {};  // Armazena as instâncias criadas

// Função para criar e conectar a instância do WhatsApp
export async function createWhatsappInstance(mode, io) {
  if (whatsappInstances[mode]) {
    return whatsappInstances[mode];  // Retorna instância existente, se houver
  }

  const { state, saveCreds } = await useMultiFileAuthState(`auth_info_${mode}`);
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version,
    auth: state,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { qr, connection, lastDisconnect } = update;
  
    if (qr) {
      io.emit(`${mode}_qr`, qr);
    }
  
    if (connection === 'open') {
      io.emit(`${mode}_connected`);
    } else if (connection === 'close') {
      const reason = lastDisconnect?.error?.message || 'desconhecido';
      io.emit(`${mode}_disconnected`, reason);
      console.error(`Conexão encerrada (${mode}):`, reason);
    }
  });
  // Salva a instância no gerenciador
  whatsappInstances[mode] = sock;

  return sock;
}

// Função para obter uma instância do WhatsApp (caso já esteja criada)
export function getWhatsappInstance(mode) {
  return whatsappInstances[mode];
}
