import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, UserCheck, Clock, Loader2, ChevronLeft, ShieldAlert } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import FriendRequestCard from '@/components/Friend/FriendRequestCard';
import FriendCard from '@/components/Friend/FriendCard';
import { getFriendRequests, acceptFriendRequest, rejectFriendRequest, unfriend } from '@/services/friendService';
import { toast } from 'react-toastify';
import { getFriends } from '@/services/userService';
import { useSocketEvents } from '@/utils/useSocketEvents';
import { listenFriendSocket } from '@/services/friendService';
import LoadingOverlay from '@/components/More/LoadingOverlay';
import HeaderPage from '@/components/More/HeaderPage';
import ConfirmModal from '@/components/More/ConfirmModal';

const FriendsPage = () => {
    const { onlineUsers } = useSocketEvents();
    const { id } = useParams();
    const myId = JSON.parse(localStorage.getItem('user'))?.id;
    const isOwnPage = !id || id === myId;
    const navigate = useNavigate();
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [privacyMessage, setPrivacyMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState("");
    const [confirmFriend, setConfirmFriend] = useState(false);
    const [friendIdDelete, setFriendIdDelete] = useState("");

    const fetchData = useCallback(async () => {
        setLoading(true);
        setPrivacyMessage('');
        try {
            const friendsRes = await getFriends(id || myId);

            if (friendsRes.status === 201) {
                setPrivacyMessage(friendsRes.data.message);
                setFriends([]);
            } else {
                setFriends(friendsRes.data || []);
            }

            if (isOwnPage) {
                const requestsRes = await getFriendRequests();
                setRequests(requestsRes.data || []);
            }
        } catch (error) {
            toast.error("Không thể tải danh sách bạn bè");
        } finally {
            setLoading(false);
        }
    }, [id, myId, isOwnPage]);


    useEffect(() => {
        fetchData();
    }, [fetchData]);


    useEffect(() => {
        const cleanup = listenFriendSocket({
            onNewRequest: (data) => {
                if (!data?.sender?._id) return;
                setRequests(prev => {
                    if (prev.find(r => r?.sender?._id === data?.sender?._id)) return prev;
                    return [{
                        _id: data._id,
                        sender: data.sender,
                        createdAt: new Date().toISOString()
                    }, ...prev];
                });
            },

            onAcceptFriend: () => {
                fetchData();
            },

            onCancelRequest: () => {
                fetchData();
            }
        });

        return cleanup;
    }, [fetchData]);

    const handleAccept = async (senderId) => {
        try {
            await acceptFriendRequest(senderId);
            toast.success("Đã trở thành bạn bè!");
            fetchData();
        } catch (error) { toast.error("Thao tác thất bại"); }
    };

    const handleDecline = async (senderId) => {
        try {
            await rejectFriendRequest(senderId);
            setRequests(prev => prev.filter(req => req.sender._id !== senderId));
        } catch (error) { toast.error("Thao tác thất bại"); }
    };

    const handleUnfriend = async (targetId) => {
        try {
            await unfriend(targetId);
            setFriends(prev => prev.filter(f => (f._id || f.id) !== targetId));
            toast.success("Đã hủy kết bạn");
        } catch (error) { toast.error("Thao tác thất bại"); }
    };

    // 5. TỐI ƯU: Lọc và Sắp xếp danh sách (Online lên đầu)
    const displayFriends = useMemo(() => {
        let filtered = friends.filter(friend => {
            const name = friend?.fname || friend?.username || "";
            return name.toLowerCase().includes(searchTerm.toLowerCase());
        });

        return filtered.sort((a, b) => {
            const aOn = onlineUsers?.includes(a._id);
            const bOn = onlineUsers?.includes(b._id);
            return bOn - aOn;
        });
    }, [friends, searchTerm, onlineUsers]);

    if (privacyMessage) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-gray-50">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm border border-gray-100">
                    <ShieldAlert size={64} className="text-amber-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-800">Danh sách riêng tư</h2>
                    <p className="text-gray-500 mt-2 text-sm">{privacyMessage}</p>
                    <button onClick={() => navigate(-1)} className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Quay lại</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <div className="max-w-6xl mx-auto space-y-10">
                {loading && (<LoadingOverlay message='Đang tải...' />)}
                <HeaderPage title={isOwnPage ? "Bạn bè của tôi" : "Danh sách bạn bè"} />
                {confirmFriend && (<ConfirmModal 
                    isOpen={confirmFriend}
                    onClose={()=>setConfirmFriend(false)}
                    onConfirm={()=>handleUnfriend(friendIdDelete)}
                    message={"Hủy kết bạn?"}
                />)}

                {/* Search Bar & Stats */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4">
                    <p className="text-gray-400 text-xs font-black uppercase tracking-widest">
                        Tổng cộng <span className="text-indigo-600">({friends.length})</span>
                    </p>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm kiếm trong danh sách..."
                            className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl outline-none shadow-sm text-sm font-medium border border-transparent focus:border-indigo-300 transition-all"
                        />
                    </div>
                </div>

                {/* Lời mời kết bạn (Chỉ hiện ở trang cá nhân) */}
                {isOwnPage && requests.length > 0 && (
                    <section className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 p-4">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Clock size={14} className="text-orange-400" /> Lời mời mới ({requests.length})
                        </h3>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                            {requests.map(req => (
                                <div key={req._id} className="snap-start min-w-[280px]">
                                    <FriendRequestCard
                                        request={{
                                            id: req.sender._id || req.sender.id,
                                            name: req.sender.fname,
                                            username: req.sender.username,
                                            avatar: (req.sender.privacy?.showAvatar !== false) ? req.sender.profile?.avatar : null,
                                        }}
                                        onAccept={() => handleAccept(req.sender._id)}
                                        onDecline={() => handleDecline(req.sender._id)}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Danh sách bạn bè chính */}
                <section className="space-y-6 p-4">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <UserCheck size={14} className="text-indigo-500" />
                        {isOwnPage ? "Tất cả bạn bè" : "Bạn bè công khai"}
                    </h3>

                    {displayFriends.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {displayFriends.map(friend => {
                                const friendId = friend._id || friend.id;
                                const isOnline = onlineUsers.some(id => String(id) === String(friendId));
                                return (
                                    <FriendCard
                                        key={friendId}
                                        friend={{
                                            id: friendId,
                                            name: friend.fname,
                                            username: friend.username,
                                            avatar: friend.profile?.avatar,
                                            privacy: friend.privacy,
                                            status: isOnline ? 'online' : 'offline',
                                        }}
                                        onUnfriend={isOwnPage ? (id) => {setConfirmFriend(true);setFriendIdDelete(id);} : null}
                                        onMessage={isOwnPage ? (id) => navigate(`/messages/${id}`) : null}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400 italic">
                            {searchTerm ? "Không tìm thấy kết quả phù hợp." : "Danh sách đang trống."}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default FriendsPage;