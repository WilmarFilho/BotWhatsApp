import startWhatsApp from '../services/whatsappService.js';

let lastQr = null;

/**
 * Configura o namespace do Socket.IO para o /connectIA
 * @param {SocketIO.Namespace} iaNamespace Instância do namespace
 */
function setupIANamespace(iaNamespace) {
  iaNamespace.on('connection', (socket) => {
    console.log('Cliente conectado ao /connectIA');

    // Recebe o userId do frontend (localStorage)
    socket.on('set-user', async (userId) => {
      console.log(`Usuário ${userId} vinculado à sessão IA`);

      // Inicia o WhatsApp com instanceId único (ex: 'ia-' + socket.id)
      const instanceId = `ia-${socket.id}`;
      startWhatsApp(
        {
          emitQR: (qr) => socket.emit('qr', qr),
          onConnected: () => socket.emit('connected'),
          onDisconnected: () => socket.emit('disconnected'),
          onIAResponse: (data) => socket.emit('ia-response', data),
        },
        instanceId,
        userId // Passa o userId para o serviço
      );
    });
  });
}

export default setupIANamespace;






