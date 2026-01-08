import apiClient from "@/utils/apiClient";
import { socket } from "@/utils/socket";
import { getUnreadMap, setUnreadMap } from '@/utils/unreadStorage';

export const sendMessage = async (data) => {
    try {
        if (data.file) {
            const formData = new FormData();
            formData.append('file', data.file);
            formData.append('receiverId', data.receiverId);
            if (data.conversationId) formData.append('conversationId', data.conversationId);
            if (data.type) formData.append('type', data.type);
            
            const response = await apiClient.post('/messages/send', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } 
        
        const response = await apiClient.post('/messages/send', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getConversations = async () => {
    const response = await apiClient.get('/messages/inbox');
    return response.data;
};

export const getMessages = async (conversationId) => {
    const response = await apiClient.get(`/messages/${conversationId}`);
    return response.data;
};

export const setBackground = async (conversationId, file) => {
    const formData = new FormData();
    formData.append('conversationId', conversationId);
    formData.append('file', file); // 'file' phải khớp với uploadCloud.single('file') ở backend

    const response = await apiClient.put('/messages/background', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const clearChatHistory = async (conversationId) => {
    const response = await apiClient.delete(`/messages/clear/${conversationId}`);
    return response.data;
};

export const deleteChat = async (conversationId) => {
    const response = await apiClient.delete(`/messages/delete/${conversationId}`);
    return response.data;
};

export const getConversationDetail = async (conversationId) => {
    const response = await apiClient.get(`/messages/detail/${conversationId}`);
    return response.data;
};

export const callActive = async () => {
    const response = await apiClient.get(`/messages/calls/active`);
    return response.data;
};



let hasEmittedOnline = false;
export const connectSocket = (userId) => {
    if (!socket.connected) {
        socket.connect();
    }

    if (!hasEmittedOnline) {
        socket.emit('user_online', userId);
        hasEmittedOnline = true;
    }
};

export const onReceiveMessage = (cb) => {
    socket.on('new_message', cb);
};

export const sendTypingStatus = (receiverId, isTyping, conversationId) => {
    socket.emit('typing', { receiverId, isTyping, conversationId });
};

export const unsubscribeMessages = () => {
    socket.off('display_typing');
};

let globalReceiveAttached = false;

export const initGlobalMessageListener = () => {
    if (globalReceiveAttached) return;
    globalReceiveAttached = true;

    socket.on('new_message', (msg) => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const myId = (user?._id || user?.id || '').toString();

        // Push message realtime cho UI
        window.dispatchEvent(
            new CustomEvent('force_new_message', { detail: msg })
        );

        // Không set unread cho tin của mình
        if (msg.sender?.toString() === myId) return;

        const activeConvId = localStorage.getItem('activeConversationId');

        // Nếu đang mở conversation đó thì không set unread
        if (activeConvId === msg.conversationId?.toString()) return;

        const unreadMap = getUnreadMap();
        unreadMap[msg.conversationId] = true;
        setUnreadMap(unreadMap);
    });
};



