import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

type ConnectionStatus = {
    isConnected: boolean;
    phoneNumber: string | null;
    isLoading: boolean;
    error?: string;
};

export const useConnectionStatus = (userId: string | null): ConnectionStatus => {
    const [status, setStatus] = useState<ConnectionStatus>({
        isConnected: false,
        phoneNumber: null,
        isLoading: true
    });

    useEffect(() => {
        if (!userId) {
            setStatus({
                isConnected: false,
                phoneNumber: null,
                isLoading: false,
                error: 'User ID is required'
            });
            return;
        }

        const checkStatus = async () => {
            try {
                const cleanUserId = userId.replace(/"/g, '');
                const response = await fetch(
                    `http://localhost:3001/api/ia/status/${encodeURIComponent(cleanUserId)}`
                );

                if (!response.ok) {
                    throw new Error(`Failed to fetch: ${response.status}`);
                }

                const data = await response.json();

                setStatus({
                    isConnected: data.isConnected,
                    phoneNumber: data.phoneNumber,
                    isLoading: false
                });

                // Configura listeners do socket apenas se conectado
                if (data.isConnected) {
                    const socket: Socket = io('http://localhost:3001/connectIA');

                    socket.on('connected', () => {
                        setStatus(prev => ({ ...prev, isConnected: true }));
                    });

                    socket.on('disconnected', () => {
                        setStatus(prev => ({ ...prev, isConnected: false }));
                    });

                    return () => {
                        socket.disconnect();
                    };
                }
            } catch (error) {
                console.error('Connection status check failed:', error);
                setStatus({
                    isConnected: false,
                    phoneNumber: null,
                    isLoading: false,
                    error: error instanceof Error ? error.message : 'Connection check failed'
                });
            }
        };

        checkStatus();

        return () => {
            // Cleanup
        };
    }, [userId]);

    return status;
};