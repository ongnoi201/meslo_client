import apiClient from "@/utils/apiClient";
import { socket } from "@/utils/socket";

export const sendFriendRequest = (receiverId) =>
    apiClient.post('/friends/request', { receiverId });

export const acceptFriendRequest = (userId) =>
    apiClient.post('/friends/accept', { userId });

export const rejectFriendRequest = (userId) =>
    apiClient.post('/friends/reject', { userId });

export const cancelFriendRequest = (receiverId) =>
    apiClient.post('/friends/cancel', { receiverId });

export const unfriend = (targetId) =>
    apiClient.post('/friends/unfriend', { targetId });

export const blockUser = (targetId) =>
    apiClient.post('/friends/block', { targetId });

export const getFriendRequests = () =>
    apiClient.get('/friends/requests');

export const listenFriendSocket = ({
    onNewRequest,
    onAcceptFriend,
    onCancelRequest
}) => {
    const handleNotification = (data) => {        
        if (data.type === 'friend_request') {
            onNewRequest?.(data);
        }

        if (data.type === 'accept_friend') {
            onAcceptFriend?.(data);
        }
    };

    const handleCancel = (data) => {
        onCancelRequest?.(data);
    };

    socket.on('get_notification', handleNotification);
    socket.on('friend_request_cancelled', handleCancel);

    return () => {
        socket.off('get_notification', handleNotification);
        socket.off('friend_request_cancelled', handleCancel);
    };
};
