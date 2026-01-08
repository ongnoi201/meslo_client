import { useState, useEffect } from 'react';
import { UserX, Search, MessageSquare } from 'lucide-react';
import MessageItem from '@/components/Messages/MessageItem';
import { useNavigate } from 'react-router-dom';
import OnlineFriendsScroll from '@/components/Friend/OnlineFriendsScroll';
import LoadingOverlay from '@/components/More/LoadingOverlay';
import { getUnreadMap, setUnreadMap } from '@/utils/unreadStorage';
import { getUser, getFriends } from '@/services/userService';
import { getConversations, onReceiveMessage, connectSocket, deleteChat} from '@/services/messageService';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/More/ConfirmModal';

const Messages = ({ onlineUsers }) => {
    const [conversations, setConversations] = useState([]);
    const [userData, setUserData] = useState(null);
    const [friendsList, setFriendsList] = useState([]);
    const [friendsPrivacyMsg, setFriendsPrivacyMsg] = useState("");
    const [loading, setLoading] = useState(true);
    const [confirmChat, setConfirmChat] = useState(false);
    const [cvId, setCvId] = useState('');

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const myId = (user?.id || user?._id || '').toString();

    useEffect(() => {
        const fetchAllData = async () => {
            if (!myId) return;
            setLoading(true);
            try {
                connectSocket(myId);
                const [userRes, friendsRes, convData] = await Promise.all([
                    getUser(myId),
                    getFriends(myId).catch(() => ({ status: 201, data: { message: "Danh sách bạn bè đang ẩn" } })),
                    getConversations()
                ]);

                setUserData(userRes.data);
                const unreadMap = getUnreadMap();

                const processedConvs = (convData || []).map(conv => {
                    const partner = conv.participants?.find(p => {
                        const pId = (p._id || p).toString();
                        return pId !== myId;
                    });

                    return {
                        ...conv,
                        partner: typeof partner === 'object'
                            ? partner
                            : { _id: partner, fname: "Người dùng" },
                        unread: !!unreadMap[conv._id] 
                    };
                });

                setConversations(processedConvs);
                if (friendsRes.status === 201) {
                    setFriendsPrivacyMsg(friendsRes.data.message);
                } else {
                    setFriendsList(friendsRes.data || []);
                }
            } catch (err) {
                console.error("Lỗi fetch dữ liệu:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [myId]);

    useEffect(() => {
        if (!myId) return;
        onReceiveMessage((newMessage) => {
            const activeConvId = localStorage.getItem('activeConversationId');

            setConversations(prev => {
                const index = prev.findIndex(
                    c => c._id === newMessage.conversationId
                );
                if (index === -1) return prev;

                const isIncoming = newMessage.senderId?.toString() !== myId;
                const isActive = activeConvId === newMessage.conversationId;

                const updatedConv = {
                    ...prev[index],
                    lastMessage: newMessage,
                    updatedAt: new Date().toISOString(),
                    unread: isIncoming && !isActive 
                };

                const newList = [...prev];
                newList.splice(index, 1);
                return [updatedConv, ...newList];
            });
        });

    }, [myId]);


    const handleOpenChat = (convId) => {
        const unreadMap = getUnreadMap();
        delete unreadMap[convId];  
        setUnreadMap(unreadMap);

        setConversations(prev =>
            prev.map(c =>
                c._id === convId ? { ...c, unread: false } : c
            )
        );
        navigate(`/messages/${convId}`);
    };

    const handleDelete = async (covId) => {
        try {
            await deleteChat(covId);
            setConversations(prev => prev.filter(c => c._id !== covId));
            localStorage.removeItem('activeConversationId');
            toast.success("Đã xóa cuộc trò chuyện.");
            navigate('/messages', { replace: true });
        } catch (err) {
            console.error("Lỗi xóa cuộc trò chuyện:", err);
            toast.error("Lỗi khi xóa cuộc trò chuyện.");
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-4 p-4 pb-20">
            {loading && <LoadingOverlay message="Đang tải tin nhắn..." />}
            {confirmChat && (<ConfirmModal 
                    isOpen={confirmChat}
                    onClose={()=>setConfirmChat(false)}
                    onConfirm={()=>handleDelete(cvId)}
                    message={"Bạn muốn xóa cuộc trò chuyện này?"} />)}

            {!friendsPrivacyMsg && friendsList.length > 0 && (
                <OnlineFriendsScroll
                    type='message'
                    friends={friendsList}
                    name={userData?.fname}
                    id={userData?._id}
                    onlineUsers={onlineUsers}
                />
            )}

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="font-black text-gray-800 text-sm uppercase tracking-widest">Tin nhắn</h3>
                    <Search size={18} className="text-gray-400" />
                </div>

                <div className="divide-y divide-gray-50">
                    {conversations.length > 0 ? (
                        conversations.map((conv) => (
                            <MessageItem
                                key={conv._id}
                                item={conv}
                                onlineUsers={onlineUsers}
                                onDelete={() => {setConfirmChat(true); setCvId(conv._id)}}
                                onOpen={() => handleOpenChat(conv._id)}
                            />

                        ))
                    ) : (
                        <div className="p-14 text-center text-gray-400">
                            <MessageSquare size={24} className="mx-auto mb-2 opacity-20" />
                            <p className="text-sm">Chưa có tin nhắn nào.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;