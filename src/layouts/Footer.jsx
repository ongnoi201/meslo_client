import { React, useEffect, useState } from 'react';
import { getUnreadMap } from '@/utils/unreadStorage';
import { NavLink } from 'react-router-dom';
import { Home, MessageCircle, LayoutGrid, Settings } from 'lucide-react';
import { hasNewPost } from '@/utils/newPostStorage';

const Footer = () => {
    const navItems = [
        { to: "/", icon: <Home size={24} />, label: "Trang chủ" },
        { to: "/messages", icon: <MessageCircle size={24} />, label: "Tin nhắn" },
        { to: "/feed", icon: <LayoutGrid size={24} />, label: "Bảng tin" },
        { to: "/setting", icon: <Settings size={24} />, label: "Cài đặt" },
    ];
    const [unreadCount, setUnreadCount] = useState(0);
    const [hasNewPostDot, setHasNewPostDot] = useState(false);

    useEffect(() => {
        const updateUnreadCount = () => {
            const unreadMap = getUnreadMap();
            setUnreadCount(Object.keys(unreadMap).length);
        };

        updateUnreadCount();

        window.addEventListener('unread-change', updateUnreadCount);
        return () =>
            window.removeEventListener('unread-change', updateUnreadCount);
    }, []);

    useEffect(() => {
        const updateNewPostDot = () => {
            setHasNewPostDot(hasNewPost());
        };

        updateNewPostDot();

        window.addEventListener('new-post', updateNewPostDot);
        return () => window.removeEventListener('new-post', updateNewPostDot);
    }, []);


    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white py-2 flex justify-around items-center shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            {navItems.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `relative flex flex-col items-center transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400'}`}
                >

                    <div className="relative">
                        {item.icon}

                        {item.to === '/messages' && unreadCount > 0 && (
                            <span className="
                                absolute -top-1 -right-2
                                min-w-[18px] h-[18px]
                                px-1
                                bg-red-500 text-white
                                text-[10px] font-bold
                                rounded-full
                                flex items-center justify-center
                            ">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}

                        {item.to === '/feed' && hasNewPostDot && (
                            <span className="
                                absolute -top-1 -right-2
                                w-2.5 h-2.5
                                bg-red-500
                                rounded-full
                            " />
                        )}
                    </div>

                    <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                </NavLink>
            ))}
        </footer>
    );
};

export default Footer;