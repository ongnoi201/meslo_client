import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'https://zq33c53q-5000.asse.devtunnels.ms/api', // Thay bằng URL server của bạn
});

// Tự động thêm Token vào Header mỗi khi gửi request
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Xử lý lỗi tập trung (Ví dụ: Token hết hạn thì logout)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Logic logout hoặc chuyển hướng login nếu cần
            console.error("Phiên làm việc hết hạn");
        }
        return Promise.reject(error.response?.data?.message || "Có lỗi xảy ra");
    }
);

export default apiClient;