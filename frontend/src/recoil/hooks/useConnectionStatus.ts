import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

type ConnectionStatus = {
    isConnected: boolean;
    phoneNumber: string | null;
    isLoading: boolean;
    error?: string;
    qrCode?: string | null;
};

export const useConnectionStatus = (userId: string | null): ConnectionStatus => {
    const [status, setStatus] = useState<ConnectionStatus>({
        isConnected: false,
        phoneNumber: null,
        isLoading: true,
        qrCode: null,
    });

    const socket = useRef<Socket | null>(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    useEffect(() => {
        if (!userId || userId === '000') {
            setStatus(prev => ({
                ...prev,
                isLoading: false,
                error: 'ID de usuário inválido'
            }));
            return;
        }

        const fetchInitialState = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/ia/status/${userId}`);
                const data = await response.json();

                setStatus({
                    isConnected: data.isConnected,
                    phoneNumber: data.phoneNumber || null,
                    isLoading: false,
                    qrCode: null,
                });

                setupWebSocket(userId);
            } catch (error) {
                console.error('Failed to fetch initial state:', error);
                setStatus(prev => ({ ...prev, isLoading: false, error: 'Falha ao carregar estado inicial' }));
            }
        };

        const setupWebSocket = (userId: string) => {
            if (socket.current) return;

            const cleanUserId = userId.replace(/"/g, '');
            socket.current = io('http://localhost:3001/connectIA', {
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: maxReconnectAttempts,
                reconnectionDelay: 1000,
            });

            socket.current.on('connect', () => {
                console.log(`WebSocket conectado para userId: ${cleanUserId}, socketId: ${socket.current?.id}`);
                reconnectAttempts.current = 0;
                socket.current?.emit('set-user', cleanUserId);
            });

            socket.current.on('connect_error', (error) => {
                console.error(`Erro de conexão WebSocket para ${cleanUserId}:`, error);
                if (reconnectAttempts.current >= maxReconnectAttempts) {
                    setStatus(prev => ({
                        ...prev,
                        isLoading: false,
                        error: 'Falha ao conectar ao servidor após várias tentativas'
                    }));
                }
                reconnectAttempts.current += 1;
            });

            socket.current.on('connected', async ({ phoneNumber }) => {
                console.log(`Evento connected recebido para ${cleanUserId}, phoneNumber: ${phoneNumber}`);
                setStatus({
                    isConnected: true,
                    phoneNumber: phoneNumber || null,
                    qrCode: null,
                    isLoading: false,
                });

                if (!phoneNumber) {
                    try {
                        const response = await fetch(`http://localhost:3001/api/ia/status/${cleanUserId}`);
                        const data = await response.json();
                        setStatus(prev => ({
                            ...prev,
                            phoneNumber: data.phoneNumber || null,
                        }));
                    } catch (error) {
                        console.error('Failed to fetch phoneNumber:', error);
                    }
                }
            });

            socket.current.on('disconnected', ({ code, message }) => {
                console.log(`Evento disconnected recebido para ${cleanUserId}, code: ${code}, message: ${message}`);
                setStatus({
                    isConnected: false,
                    phoneNumber: null,
                    isLoading: false,
                    qrCode: null,
                });

                socket.current?.emit('get-qr');
                console.log(`Evento get-qr emitido para ${cleanUserId}`);
            });

            socket.current.on('qr', (qr) => {
                console.log(`QR code recebido para ${cleanUserId}: ${qr}`);
                setStatus({
                    isConnected: false,
                    phoneNumber: null,
                    isLoading: false,
                    qrCode: qr,
                });
            });

            socket.current.on('error', ({ message }) => {
                console.log(`Erro recebido para ${cleanUserId}: ${message}`);
                setStatus(prev => ({
                    ...prev,
                    isLoading: false,
                    error: message,
                }));
            });

            socket.current.on('disconnect', (reason) => {
                console.log(`WebSocket desconectado para ${cleanUserId}, motivo: ${reason}`);
            });

            return () => {
                socket.current?.disconnect();
                socket.current = null;
            };
        };

        fetchInitialState();

        return () => {
            socket.current?.disconnect();
            socket.current = null;
        };
    }, [userId]);

    return status;
};