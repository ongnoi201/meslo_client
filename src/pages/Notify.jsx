import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageCircle, Heart, UserPlus, Trash2, Send, UserCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getNotificationsApi, markAsReadApi, deleteNotificationApi } from '@/services/notificationService';
import HeaderPage from '@/components/More/HeaderPage';
import { toast } from 'react-toastify';
import LoadingOverlay from '@/components/More/LoadingOverlay';
import { checkAvatarPrivacy } from '@/utils/tools';

const Notifications = () => {
    const navigate = useNavigate();
    const [notifs, setNotifs] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const currentUserId = JSON.parse(localStorage.getItem("user"))?.id;

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await getNotificationsApi();
            setNotifs(data);
        } catch (error) {
            console.error("Lỗi khi tải thông báo:", error);
            toast.error("Lỗi khi tải thông báo.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleAction = async (notif) => {
        try {
            if (!notif.isRead) {
                await markAsReadApi(notif._id);
                setNotifs(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
            }
            if (notif.link) navigate(notif.link);
        } catch (error) {
            toast.error("Lỗi điều hướng.");
            console.error("Lỗi điều hướng:", error);
        }
    };

    const deleteNotif = async (e, id) => {
        e.stopPropagation();
        try {
            await deleteNotificationApi(id);
            setNotifs(prev => prev.filter(n => n._id !== id));
        } catch (error) {
            toast.error("Lỗi khi xóa thông báo.");
            console.error("Lỗi khi xóa:", error);
        }
    };

    const filteredNotifs = filter === 'all' ? notifs : notifs.filter(n => !n.isRead);
    const getIcon = (type) => {
        const iconSize = 14;
        switch (type) {
            case 'post_like': return <Heart size={iconSize} className="fill-red-500 text-red-500" />;
            case 'post_comment': return <MessageCircle size={iconSize} className="text-blue-500" />;
            case 'friend_request': return <UserPlus size={iconSize} className="text-green-500" />;
            case 'accept_friend': return <UserCheck size={iconSize} className="text-indigo-500" />;
            case 'new_post': return <Send size={iconSize} className="text-orange-500" />;
            case 'receive_message': return <MessageCircle size={iconSize} className="text-teal-500" />;
            default: return <Bell size={iconSize} className="text-gray-400" />;
        }
    };

    return (
        <div className="max-w-2xl mx-auto min-h-screen bg-white shadow-sm border-x border-gray-100">
            <HeaderPage title={`Thông báo (${notifs.filter(n => !n.isRead).length})`} />
            <div className="flex px-2 bg-gray-50/50 border-b">
                {['all', 'unread'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setFilter(t)}
                        className={`flex-1 py-3 text-sm font-bold transition-relative ${filter === t ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {t === 'all' ? 'Tất cả' : 'Chưa đọc'}
                    </button>
                ))}
            </div>

            <div className="divide-y divide-gray-50">
                {loading ? (
                    <LoadingOverlay message='Đang tải thông báo' />
                ) : filteredNotifs.length > 0 ? (
                    filteredNotifs.map((n) => {
                        return (
                            <div
                                key={n._id}
                                onClick={() => handleAction(n)}
                                className={`flex items-start gap-3 p-4 hover:bg-gray-50/80 cursor-pointer transition-all relative group ${!n.isRead ? "bg-blue-50/30" : ""}`}
                            >
                                <div className="relative shrink-0">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 shadow-sm bg-gray-100">
                                        <img
                                            src={checkAvatarPrivacy(n.sender)}
                                            alt="avatar"
                                            className="w-full h-full object-cover"
                                            onError={(e) =>
                                            (e.target.src =
                                                "https://api.dicebear.com/7.x/initials/svg?seed=User")
                                            }
                                        />
                                    </div>

                                    <div className="absolute -right-1 -bottom-1 bg-white p-1 rounded-full shadow-md border border-gray-50">
                                        {getIcon(n.type)}
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0 pt-0.5">
                                    <p className="text-[14.5px] text-gray-800 leading-snug">
                                        <span className="font-bold text-gray-900 mr-1">
                                            {n.sender?.fname || "Thành viên"}
                                        </span>
                                        {n.content}
                                    </p>

                                    <p className="text-[12px] text-gray-500 mt-1 flex items-center gap-1.5">
                                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                        {formatDistanceToNow(new Date(n.createdAt), {
                                            addSuffix: true,
                                            locale: vi,
                                        })}
                                    </p>
                                </div>

                                <div className="flex flex-col items-end justify-between self-stretch shrink-0 ml-2">
                                    {!n.isRead && (
                                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                                    )}

                                    <button
                                        onClick={(e) => deleteNotif(e, n._id)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all group-hover:scale-110"
                                        title="Xóa thông báo"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })) : (
                    <div className="py-24 flex flex-col items-center text-gray-400">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Bell size={40} className="text-gray-200" />
                        </div>
                        <p className="text-sm font-medium">Hộp thư thông báo trống</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;