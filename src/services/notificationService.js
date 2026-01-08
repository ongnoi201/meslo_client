import apiClient from "@/utils/apiClient";

// Hàm lấy danh sách
export const getNotificationsApi = async (type) => {
    const params = type ? { type } : {};
    const response = await apiClient.get('/notifications', { params });
    return response.data;
};

// Hàm đánh dấu đã đọc (từng cái)
export const markAsReadApi = async (notificationId) => {
    const response = await apiClient.put('/notifications/read', { notificationId });
    return response.data;
};

// Hàm đánh dấu đọc tất cả
export const markAllAsReadApi = async () => {
    const response = await apiClient.put('/notifications/read'); // Không gửi ID = hiểu là tất cả
    return response.data;
};

// Hàm xóa
export const deleteNotificationApi = async (id) => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
};