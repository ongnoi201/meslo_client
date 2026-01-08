import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, Image as ImageIcon, Phone, Video, MoreVertical, Trash2, ImagePlus, Mic, StopCircle } from 'lucide-react';
import { clearChatHistory, deleteChat, getConversationDetail, getMessages, sendMessage, sendTypingStatus, setBackground } from '../services/messageService';
import { useChatSocket } from '@/utils/useChatSocket';
import ImageOverlayViewer from '@/components/Image/ImageOverlayViewer';
import ImageCropperModal from '@/components/Image/ImageCropperModal';
import CallMessage from '@/components/Messages/CallMessage';
import ConfirmModal from '@/components/More/ConfirmModal';
import { toast } from 'react-toastify';

const upsertMessage = (prev, msg) => {
    const index = prev.findIndex(m => m._id === msg._id);
    if (index !== -1) {
        const updated = [...prev];
        updated[index] = msg;
        return updated;
    }
    return [...prev, msg];
};


const ChatDetail = ({onlineUsers}) => {
    const { id: conversationId } = useParams();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const myId = (user?._id || user?.id || '').toString();
    const navigate = useNavigate();
    const [text, setText] = useState("");
    const [messages, setMessages] = useState([]);
    const [partner, setPartner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [loadingSetBg, setLoadingSetBg] = useState(false);
    const [showMore, setShowMore] = useState(false);
    const [chatBg, setChatBg] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [showImageViewer, setShowImageViewer] = useState(false);
    const [viewerImages, setViewerImages] = useState([]);
    const [cropImage, setCropImage] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [confirmHistory, setConfirmHistory] = useState(false);
    const [confirmChat, setConfirmChat] = useState(false);
    const isFirstLoadRef = useRef(true);
    const scrollRef = useRef(null);
    const fileInputRef = useRef(null);
    const sendImageInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const initiateCall = (type) => {
        if (!partner) return;
        const event = new CustomEvent('start_global_call', {
            detail: {
                to: partner._id || partner,
                name: partner?.fname || partner?.username || 'Người dùng',
                type: type,
                isReceiving: false
            }
        });
        window.dispatchEvent(event);
    };

    const checkIsOnline = (id) => {
        return onlineUsers.includes(id);
    };

    useEffect(() => {
        const handler = (e) => {
            setMessages(prev => upsertMessage(prev, e.detail));
        };
        window.addEventListener('force_new_message', handler);
        return () => window.removeEventListener('force_new_message', handler);
    }, []);


    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                await handleSend(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Không thể ghi âm', err);
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    };

    useEffect(() => {
        localStorage.setItem('activeConversationId', conversationId);
        return () => {
            localStorage.removeItem('activeConversationId');
        };
    }, [conversationId]);

    useEffect(() => {
        const loadInitialData = async () => {
            if (!conversationId || !myId) return;
            setLoading(true);
            try {
                const conv = await getConversationDetail(conversationId);
                setChatBg(conv.myBackground);
                const otherUser = conv.participants.find(p => (p._id || p).toString() !== myId);
                setPartner(otherUser);
                if (!conv.isNew) {
                    const msgData = await getMessages(conversationId);
                    setMessages(msgData || []);
                }
            } catch (err) {
                console.error("Lỗi tải dữ liệu:", err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [conversationId, myId]);

    const { isPartnerTyping } = useChatSocket({
        myId,
        conversationId,
        onNewMessage: (newMsg) => {
            setMessages(prev => upsertMessage(prev, newMsg));
        }
    });

    useEffect(() => {
        if (!scrollRef.current) return;
        if (isFirstLoadRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "auto" });
            isFirstLoadRef.current = false;
        } else {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isPartnerTyping]);

    const handleTextChange = (e) => {
        const value = e.target.value;
        setText(value);
        if (partner) {
            const receiverId = partner._id || partner;
            sendTypingStatus(receiverId, value.length > 0, conversationId);
        }
    };

    const handleSend = async (file = null) => {
        if (!file && !text.trim()) return;
        if (!partner || isSending) return;
        const receiverId = partner._id || partner;
        setIsSending(true);
        const tempText = text;
        if (!file) setText("");
        sendTypingStatus(receiverId, false, conversationId);
        try {
            const isNewChat = messages.length === 0;
            const savedMsg = await sendMessage({
                conversationId: isNewChat ? null : conversationId,
                receiverId: receiverId,
                content: file ? null : tempText,
                file: file,
                type: file ? (file.type.startsWith('image/') ? 'image' : 'audio') : 'text'
            });
            setMessages(prev => {
                const exists = prev.find(m => m._id === savedMsg._id);
                if (exists) return prev;
                return [...prev, savedMsg];
            });
            if (isNewChat && savedMsg.conversationId) {
                navigate(`/messages/${savedMsg.conversationId}`, { replace: true });
            }
        } catch (err) {
            console.error("Lỗi gửi:", err);
            if (!file) setText(tempText);
        } finally {
            setIsSending(false);
        }
    };

    const handleClearHistory = async () => {
        try {
            await clearChatHistory(conversationId);
            setMessages([]);
            setShowMore(false);
            toast.success('Đã xóa lịch sử trò chuyện.');
        } catch (err) {
            toast.error("Xóa thất bại!");
            console.error("Lỗi xóa lịch sử:", err);
        }
    };

    // 2. Xóa cuộc trò chuyện (Xóa hoàn toàn nếu người kia cũng xóa)
    const handleDeleteConversation = async () => {
        try {
            await deleteChat(conversationId);
            // Quan trọng: Phải xóa ID khỏi localStorage để tránh lỗi logic unread sau này
            localStorage.removeItem('activeConversationId');
            toast.success("Đã xóa cuộc trò chuyện.");
            navigate('/messages', { replace: true });
        } catch (err) {
            console.error("Lỗi xóa cuộc trò chuyện:", err);
            toast.error("Xóa thất bại!");
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {confirmHistory && (<ConfirmModal
                isOpen={confirmHistory}
                onClose={() => setConfirmHistory(false)}
                onConfirm={handleClearHistory}
                message={"Bạn muốn xóa toàn bộ lịch sử trò chuyện?"} />)}
            {confirmChat && (<ConfirmModal
                isOpen={confirmChat}
                onClose={() => setConfirmChat(false)}
                onConfirm={handleDeleteConversation}
                message={"Bạn có chắc muốn xóa cuộc trò chuyện này?"} />)}

            <header className="flex items-center p-3 bg-white shadow-sm sticky top-0 z-50">
                <button
                    onClick={() => navigate(-1)}
                    className="mr-2 p-1 hover:bg-gray-100 rounded-full"
                >
                    <ChevronLeft />
                </button>

                <div className="relative">
                    <img
                        src={partner?.profile?.avatar && partner?.privacy?.showAvatar ? partner?.profile?.avatar : `https://api.dicebear.com/7.x/initials/svg?seed=${partner?.username}`}
                        className="w-10 h-10 rounded-full border object-cover"
                        alt="avatar"
                    />
                    {partner && checkIsOnline(partner._id || partner) && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                </div>

                <div className="ml-3 flex-1">
                    <h3 className="font-bold text-gray-800 text-sm">
                        {partner?.fname || partner?.username || 'Người dùng'}
                    </h3>
                    <p className={`text-[10px] ${isPartnerTyping ? 'text-blue-500 font-medium' : 'text-gray-400'}`}>
                        {isPartnerTyping ? 'Đang soạn tin nhắn...' : (partner && checkIsOnline(partner._id || partner) ? 'Đang hoạt động' : 'Ngoại tuyến')}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                    <button onClick={() => initiateCall('voice')} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                        <Phone size={18} />
                    </button>
                    <button onClick={() => initiateCall('video')} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                        <Video size={18} />
                    </button>
                    {messages.length !== 0 && (
                        <button
                            onClick={() => setShowMore(!showMore)}
                            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 relative"
                        >
                            <MoreVertical size={18} />
                        </button>
                    )}
                </div>

                {/* Popup More */}
                {showMore && messages.length !== 0 && (
                    <div className="absolute right-3 top-14 w-56 bg-white rounded-xl shadow-lg z-50 overflow-hidden">
                        <button
                            className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 w-full text-sm"
                            onClick={() => fileInputRef.current.click()}
                        >
                            <ImagePlus size={16} />
                            Đặt ảnh nền đoạn chat
                        </button>

                        <button
                            className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 w-full text-sm text-red-500"
                            onClick={() => {setConfirmHistory(true); setShowMore(false)}}
                        >
                            <Trash2 size={16} />
                            Xóa lịch sử chat
                        </button>

                        <button
                            className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 w-full text-sm text-red-600"
                            onClick={() => {setConfirmChat(true); setShowMore(false)}}
                        >
                            <Trash2 size={16} />
                            Xóa cuộc trò chuyện
                        </button>
                    </div>
                )}
            </header>


            {/* Tin nhắn */}
            {!loading ? (
                <main
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                    style={{
                        backgroundImage: chatBg ? `url(${chatBg})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    {messages.map((msg) => {
                        const senderRaw = msg.sender?._id || msg.sender;
                        const isMe = senderRaw?.toString() === myId;
                        return (
                            <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    {(msg.type === 'video_call' || msg.type === 'voice_call') && (
                                        <CallMessage msg={msg} isMe={isMe} />
                                    )}
                                    {msg.type === 'image' && (
                                        <img
                                            src={msg.content}
                                            className="rounded-xl max-w-[240px] cursor-pointer"
                                            onClick={() => {
                                                setViewerImages([msg.content]);
                                                setShowImageViewer(true);
                                            }}
                                        />
                                    )}

                                    {msg.type === 'audio' && (
                                        <audio controls className="max-w-[240px]">
                                            <source src={msg.content} />
                                        </audio>
                                    )}

                                    {msg.type === 'text' && (
                                        <div className={`p-3 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-white text-gray-800 rounded-tl-none'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    )}
                                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Typing Indicator Bubble */}
                    {isPartnerTyping && (
                        <div className="flex justify-start">
                            <div className="bg-gray-200 px-4 py-2 rounded-2xl rounded-tl-none animate-pulse text-xs text-gray-500">
                                Đang nhập...
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </main>
            ) : (
                <div className="flex h-screen items-center justify-center">Đang tải...</div>
            )}

            <input
                type="file"
                hidden
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    setCropImage(URL.createObjectURL(file));
                    setShowCropper(true);
                }}
            />


            {/* Input Footer */}
            <footer className="p-3 bg-white shadow-sm flex items-center gap-2">
                {/* Gửi ảnh */}
                <input
                    type="file"
                    hidden
                    accept="image/*"
                    ref={sendImageInputRef}
                    onChange={(e) => handleSend(e.target.files[0])}
                />


                <button
                    onClick={() => sendImageInputRef.current.click()}
                    className="text-gray-400 p-2 hover:text-blue-500"
                >
                    <ImageIcon size={22} />
                </button>

                {/* Input text */}
                <input
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 outline-none text-sm"
                    placeholder="Nhập tin nhắn..."
                    value={text}
                    onChange={handleTextChange}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                />

                {/* Mic / Stop */}
                {isRecording ? (
                    <button onClick={stopRecording} className="text-red-500 animate-pulse">
                        <StopCircle size={26} />
                    </button>
                ) : (
                    <button onClick={startRecording} className="text-gray-500 hover:text-blue-600">
                        <Mic size={22} />
                    </button>
                )}

                <button
                    onClick={() => handleSend()}
                    disabled={!text.trim()}
                    className="p-2 text-blue-600"
                >
                    <Send size={22} />
                </button>
            </footer>

            {showImageViewer && (
                <ImageOverlayViewer
                    images={viewerImages}
                    onClose={() => setShowImageViewer(false)}
                    type='message'
                />
            )}

            {showCropper && (
                <ImageCropperModal
                    image={cropImage}
                    type="cover"
                    loading={loadingSetBg}
                    onClose={() => setShowCropper(false)}
                    onConfirm={async (blob) => {
                        try {
                            setLoadingSetBg(true);
                            const file = new File([blob], "background.jpg", { type: "image/jpeg" });
                            const result = await setBackground(conversationId, file);

                            if (result.url) {
                                setChatBg(result.url);
                                alert("Đã đổi ảnh nền thành công!");
                            }
                        } catch (err) {
                            console.error("Lỗi đặt nền:", err);
                            alert("Không thể đặt ảnh nền. Vui lòng thử lại.");
                        } finally {
                            setLoadingSetBg(false);
                            setShowCropper(false);
                            setShowMore(false);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default ChatDetail;