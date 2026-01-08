import { useEffect } from 'react';
import { socket } from './socket';

export const useFriendSocket = ({
    onNewRequest,
    onAcceptFriend,
    onCancelRequest
}) => {
    useEffect(() => {
        const handleNotification = (data) => {
            if (data.type === 'friend_request') {
                onNewRequest?.(data);
            }

            if (data.type === 'accept_friend') {
                onAcceptFriend?.();
            }
        };

        const handleCancel = (data) => {
            onCancelRequest?.();
        };

        socket.on('get_notification', handleNotification);
        socket.on('friend_request_cancelled', handleCancel);

        return () => {
            socket.off('get_notification', handleNotification);
            socket.off('friend_request_cancelled', handleCancel);
        };
    }, [onNewRequest, onAcceptFriend, onCancelRequest]);

};
