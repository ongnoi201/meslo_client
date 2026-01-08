import apiClient from "@/utils/apiClient";

export const updateProfile = (formData) => {
  return apiClient.put('/users/update', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getUser = (id = '') => {
  const url = id ? `/users/${id}` : '/users/';
  return apiClient.get(url);
};

export const getFriends = (id = '') => {
  const url = id ? `/users/friends/${id}` : '/users/friends';
  return apiClient.get(url);
};

export const getSuggestions = () => {
  return apiClient.get('/users/suggestions');
};

export const searchUsers = (query, page = 1, limit = 10) => {
  return apiClient.get(`/users/search`, {
    params: {
      query: query,
      page: page,
      limit: limit
    }
  });
};

export const deleteAccount = () => {
  return apiClient.delete('/users/delete-me');
};

export const registerPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn("Trình duyệt không hỗ trợ Push.");
        return;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const reg = await navigator.serviceWorker.ready;

        // Kiểm tra xem đã có subscription nào tồn tại chưa
        let subscription = await reg.pushManager.getSubscription();

        if (!subscription) {
            const urlBase64ToUint8Array = (base64String) => {
                const padding = '='.repeat((4 - base64String.length % 4) % 4);
                const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
                const rawData = window.atob(base64);
                return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
            };

            const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC;
            
            subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });
        }

        // Gửi subscription lên Backend
        return apiClient.post('/users/push-subscription', subscription);
    } catch (error) {
        // Nếu vẫn lỗi AbortError, hãy thử reset Service Worker
        console.error("Lỗi đăng ký Push:", error);
    }
};
