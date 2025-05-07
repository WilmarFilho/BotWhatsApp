import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { QRCode } from 'react-qrcode-logo';
import { useConnectionStatus } from '../../recoil/hooks/useConnectionStatus';


const socket: Socket = io('http://localhost:3001/connectIA');

const ChatIA = () => {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [responseFromPython, setResponseFromPython] = useState<string | null>(null);
    const userId = localStorage.getItem('userId');
    const { isConnected: persistedConnection, phoneNumber, isLoading } = useConnectionStatus(userId);
    const [realTimeConnected, setRealTimeConnected] = useState<boolean>(false);

    // Estado combinado: prioriza conexão em tempo real, fallback para o estado persistido
    const connected = realTimeConnected || persistedConnection;

    useEffect(() => {
        if (!userId || isLoading) return;

        const cleanUserId = userId.replace(/"/g, '');
        socket.emit('set-user', cleanUserId);

        socket.on('qr', (qr: string) => {
            setQrCode(qr);
            setRealTimeConnected(false); // Reset ao receber novo QR
        });

        socket.on('connected', () => {
            setRealTimeConnected(true);
        });

        socket.on('ia-response', (data: { remetente: string, pergunta: string, resposta: string }) => {
            console.log('Resposta da IA:', data);
            setResponseFromPython(data.resposta);
        });

        socket.on('disconnected', () => {
            setRealTimeConnected(false);
        });

        return () => {
            socket.off('qr');
            socket.off('connected');
            socket.off('disconnected');
            socket.off('ia-response');
        };
    }, [userId, isLoading]);

    if (isLoading) {
        return <div style={{ textAlign: 'center', marginTop: 50 }}>Verificando estado da conexão...</div>;
    }

    return (
        <div style={{ textAlign: 'center', marginTop: 50 }}>
            {connected ? (
                <>
                    <h2>✅ Conectado ao WhatsApp{phoneNumber ? ` como ${phoneNumber}` : ''}!</h2>
                    {!realTimeConnected && (
                        <p style={{ color: 'orange' }}>Conexão persistida (recarregue a página para sincronizar em tempo real)</p>
                    )}
                </>
            ) : qrCode ? (
                <>
                    <h2>📱 Escaneie o QR Code para conectar</h2>
                    <QRCode value={qrCode} size={256} />
                </>
            ) : (
                <h2>Aguardando QR Code...</h2>
            )}

            {responseFromPython && (
                <div style={{ marginTop: 20 }}>
                    <h3>Resposta do Backend Python:</h3>
                    <p>{responseFromPython}</p>
                </div>
            )}

            
        </div>
    );
};

export default ChatIA;