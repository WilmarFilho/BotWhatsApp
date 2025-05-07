import { QRCode } from 'react-qrcode-logo';
import { useConnectionStatus } from '../../recoil/hooks/useConnectionStatus';

const ChatIA = () => {
    const userId = localStorage.getItem('userId') || null;
    const { isConnected, phoneNumber, isLoading, qrCode, error } = useConnectionStatus(userId);

    if (!userId) {
        return (
            <div style={{ textAlign: 'center', marginTop: 50 }}>
                <h2>Erro: ID de usuário não encontrado</h2>
                <p>Por favor, faça login novamente.</p>
            </div>
        );
    }

    if (isLoading) {
        return <div style={{ textAlign: 'center', marginTop: 50 }}>Verificando estado da conexão...</div>;
    }

    if (error) {
        return <h2>ERRO DE CONEXÃO COM O BACKEND</h2>;
    }

    return (
        <div style={{ textAlign: 'center', marginTop: 50 }}>
            {isConnected ? (
                <>
                    <h2>✅ Conectado ao WhatsApp{phoneNumber ? ` como ${phoneNumber}` : ''}!</h2>
                </>
            ) : qrCode ? (
                <>
                    <h2>📱 Escaneie o QR Code para conectar</h2>
                    <QRCode value={qrCode} size={256} />
                </>
            ) : (
                <h2>Aguardando QR Code...</h2>
            )}
        </div>
    );
};

export default ChatIA;