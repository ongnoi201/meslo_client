export const getUnreadMap = () =>
    JSON.parse(localStorage.getItem('unreadMap') || '{}');

export const setUnreadMap = (map) => {
    localStorage.setItem('unreadMap', JSON.stringify(map));

    // 🔥 bắn event realtime
    window.dispatchEvent(new Event('unread-change'));
};
