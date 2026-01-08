import apiClient from "@/utils/apiClient";

export const createPost = async (formData) => {
    const response = await apiClient.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const getNewsfeed = async (page = 1, limit = 10) => {
    const response = await apiClient.get('/posts/allpost', {
        params: { page, limit }
    });
    return response.data;
};

export const getUserPosts = async (userId, page = 1, limit = 10) => {
    const response = await apiClient.get(`/posts/user/${userId}`, {
        params: { page, limit }
    });
    return response.data;
};

export const likePost = async (postId) => {
    const response = await apiClient.post(`/posts/${postId}/like`);
    return response.data;
};

export const commentPost = async (postId, text) => {
    const response = await apiClient.post(`/posts/${postId}/comment`, { text });
    return response.data;
};

export const sharePost = async (postId, shareData) => {
    const response = await apiClient.post(`/posts/${postId}/share`, shareData);
    return response.data;
};

export const deletePost = async (postId) => {
    const response = await apiClient.delete(`/posts/${postId}`);
    return response.data;
};

export const getPostById = async (postId) => {
    const response = await apiClient.get(`/posts/${postId}`);
    return response.data;
};