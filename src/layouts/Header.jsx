import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, X } from 'lucide-react';
import { toast } from 'react-toastify';
import UserCard from '@/components/Friend/UserCard';
import { getNotificationsApi } from '@/services/notificationService';
import { searchUsers } from '@/services/userService';
import { acceptFriendRequest, cancelFriendRequest, rejectFriendRequest, sendFriendRequest, unfriend } from '@/services/friendService';
import { socket } from '@/utils/socket';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const [isSearching, setIsSearching] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchInitialNotifications = async () => {
            try {
                const data = await getNotificationsApi();
                const unread = data.filter(n => !n.isRead).length;
                setUnreadCount(unread);
            } catch (err) {
                console.error("Lỗi lấy thông báo:", err);
            }
        };

        if (currentUser) {
            fetchInitialNotifications();
            socket.connect();
            socket.emit('user_online', currentUser._id);
            socket.on('get_notification', (data) => {
                setUnreadCount(prev => prev + 1);
            });

            socket.on('friend_request_cancelled', () => {
                setUnreadCount(prev => Math.max(0, prev - 1));
            });
        }

        return () => {
            socket.off('get_notification');
            socket.off('friend_request_cancelled');
        };
    }, [currentUser?._id]);


    useEffect(() => {
        const fetchResults = async () => {
            if (query.trim().length > 1) {
                setLoading(true);
                try {
                    const response = await searchUsers(query);
                    setResults(response.data.users || response.data);
                } catch (err) {
                    setResults([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
            }
        };

        const timer = setTimeout(fetchResults, 500);
        return () => clearTimeout(timer);
    }, [query]);


    const updateUserStatus = (userId, newStatus) => {
        setResults(prevResults =>
            prevResults.map(user =>
                user._id === userId ? { ...user, status: newStatus } : user
            )
        );
    };

    const handleAction = async (type, userId) => {
        try {
            let response;
            switch (type) {
                case 'add':
                    response = await sendFriendRequest(userId);
                    updateUserStatus(userId, 'sent');
                    socket.emit('send_notification', {
                        receiverId: userId,
                        senderName: currentUser?.fname || 'Ai đó',
                        type: 'friend_request',
                        content: 'đã gửi lời mời kết bạn'
                    });
                    break;
                case 'cancel':
                    response = await cancelFriendRequest(userId);
                    updateUserStatus(userId, 'none');
                    socket.emit('cancel_request', { receiverId: userId, senderId: currentUser._id });
                    break;
                case 'accept':
                    response = await acceptFriendRequest(userId);
                    updateUserStatus(userId, 'friend');
                    break;
                case 'reject':
                    response = await rejectFriendRequest(userId);
                    updateUserStatus(userId, 'none');
                    break;
                case 'unfriend':
                    response = await unfriend(userId);
                    updateUserStatus(userId, 'none');
                    toast.success('Hủy kết bạn thành công');
                    break;
                case 'message':
                    navigate(`/messages/${userId}`);
                    setIsSearching(false);
                    setQuery('');
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.log(error);
            toast.error("Thao tác thất bại");
        }
    };

    const getTitle = (path) => {
        if (path.startsWith('/messages/')) return 'Hội thoại';
        switch (path) {
            case '/': return 'Trang Chủ';
            case '/messages': return 'Tin Nhắn';
            case '/friend': return 'Bạn Bè';
            case '/notify': return 'Thông Báo';
            case '/feed': return 'Bảng Tin';
            case '/setting': return 'Cài Đặt';
            default: return 'Ứng dụng';
        }
    };

    return (
        <header className="bg-white sticky top-0 z-50 px-6 py-4 shadow-sm">
            <div className="flex justify-between items-center max-w-4xl mx-auto relative">

                {!isSearching ? (
                    <>
                        <h1 className="text-xl font-bold text-gray-800 animate-in slide-in-from-left duration-300">
                            {getTitle(location.pathname)}
                        </h1>
                        <div className="flex gap-4 text-gray-500 items-center">
                            <Search
                                size={22}
                                className="cursor-pointer hover:text-blue-500 transition-colors"
                                onClick={() => setIsSearching(true)}
                            />

                            <div className="relative cursor-pointer" onClick={() => {
                                navigate('/notify');
                                setUnreadCount(0);
                            }}>
                                <Bell
                                    size={22}
                                    className={`transition-colors ${unreadCount > 0 ? 'text-blue-500' : 'hover:text-blue-500'}`}
                                />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative flex justify-center items-center rounded-full h-4 w-4 bg-red-500 text-[10px] text-white font-bold border border-white">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-2 w-full animate-in fade-in zoom-in-95 duration-200">
                        <div className="relative flex-1">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Tìm kiếm người dùng..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full bg-gray-100 border-none rounded-full py-2 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                            {query && (
                                <X
                                    size={18}
                                    className="absolute right-3 top-2.5 text-gray-400 cursor-pointer hover:text-gray-600"
                                    onClick={() => { setQuery(''); setResults([]); }}
                                />
                            )}
                        </div>
                        <button
                            onClick={() => { setIsSearching(false); setQuery(''); setResults([]); }}
                            className="text-blue-500 font-medium text-sm px-2 hover:text-blue-700"
                        >
                            Hủy
                        </button>
                    </div>
                )}

                {isSearching && query.trim().length > 0 && (
                    <div className="absolute top-14 left-0 right-0 bg-white shadow-2xl rounded-2xl border border-gray-100 max-h-[450px] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                        {loading ? (
                            <div className="p-8 text-center text-gray-400 flex flex-col items-center gap-2">
                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm">Đang tìm kiếm...</span>
                            </div>
                        ) : results.length > 0 ? (
                            <div className="py-2">
                                {results.map(user => (
                                    <UserCard
                                        key={user._id}
                                        user={user}
                                        onAction={handleAction}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <p className="text-gray-500 font-medium">Không tìm thấy "{query}"</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;