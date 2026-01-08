import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { socket } from './socket';

export const useSocketEvents = () => {
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        const handleOnlineSnapshot = (users) => {
            if (!Array.isArray(users)) return;
            setOnlineUsers(users.map(u => String(u.userId || u._id || u)));
        };

        const handleFriendOnline = ({ userId }) => {
            const id = String(userId);
            setOnlineUsers(prev => [...new Set([...prev.map(String), id])]);
        };

        const handleFriendOffline = ({ userId }) => {
            const id = String(userId);
            setOnlineUsers(prev => prev.filter(u => String(u) !== id));
        };

        const handleNotification = (data) => {
            if (!data?.sender?.username) return;
            toast.info(`${data.sender.username} ${data.content}`);
        };

        socket.on('online_users_snapshot', handleOnlineSnapshot);
        socket.on('friend_online', handleFriendOnline);
        socket.on('friend_offline', handleFriendOffline);
        socket.on('get_notification', handleNotification);

        return () => {
            socket.off('online_users_snapshot', handleOnlineSnapshot);
            socket.off('friend_online', handleFriendOnline);
            socket.off('friend_offline', handleFriendOffline);
            socket.off('get_notification', handleNotification);
        };
    }, []);

    return { onlineUsers };
};
