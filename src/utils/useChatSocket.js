import { useEffect, useState } from 'react';
import { connectSocket } from '@/services/messageService';
import { socket } from './socket';

export const useChatSocket = ({
    myId,
    conversationId,
    onNewMessage
}) => {
    const [isPartnerTyping, setIsPartnerTyping] = useState(false);

    useEffect(() => {
        if (!myId) return;

        // 1. connect socket
        connectSocket(myId);

        // 2. receive message
        const handleReceiveMessage = (msg) => {
            onNewMessage?.(msg);

            if (
                document.hidden &&
                Notification.permission === 'granted'
            ) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification('Tin nhắn mới', {
                        body: 'Bạn có tin nhắn mới',
                        icon: '/logo.png',
                        data: {
                            url: `/messages/${msg.conversationId}`
                        }
                    });
                });
            }
        };


        // 3. typing
        const handleTyping = (data) => {
            if (
                data.senderId !== myId &&
                data.conversationId?.toString() === conversationId?.toString()
            ) {
                setIsPartnerTyping(data.isTyping);
            }
        };

        socket.on('receive_message', handleReceiveMessage);
        socket.on('new_message', handleReceiveMessage);
        socket.on('display_typing', handleTyping);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
            socket.off('new_message', handleReceiveMessage);
            socket.off('display_typing', handleTyping);
        };
    }, [myId, conversationId]);

    return {
        isPartnerTyping
    };
};
