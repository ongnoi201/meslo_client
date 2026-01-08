import apiClient from "@/utils/apiClient";

export const register = (userData) => {
    return apiClient.post('/auth/register', userData);
};

export const login = (credentials) => {
    return apiClient.post('/auth/login', credentials);
};

export const changePassword = (passwords) => {
    return apiClient.put('/auth/change-password', passwords);
};