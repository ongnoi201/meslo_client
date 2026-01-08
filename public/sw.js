self.addEventListener('push', function (event) {
    if (event.data) {
        const payload = event.data.json();
        const options = {
            body: payload.body,
            icon: '/vite.svg', // Đảm bảo bạn có file này trong thư mục public
            badge: '/vite.svg',
            vibrate: [100, 50, 100],
            data: {
                url: payload.data?.url || '/messages'
            }
        };

        event.waitUntil(
            self.registration.showNotification(payload.title, options)
        );
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});