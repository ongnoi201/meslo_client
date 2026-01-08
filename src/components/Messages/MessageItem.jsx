import { checkAvatarPrivacy } from '@/utils/tools';
import { Trash2 } from 'lucide-react';

const MessageItem = ({ item, onOpen, onDelete, onlineUsers = [] }) => {
    const partner = item.partner || {};
    const lastMsg = item.lastMessage;
    const partnerId = partner?._id?.toString();
    const isOnline = onlineUsers.includes(partnerId);

    const renderLastMessage = (msg) => {
        if (!msg) return '';
        if (msg.type === 'video_call') {
            if (msg.callStatus === 'missed') return '📹 Cuộc gọi video nhỡ';
            if (msg.callStatus === 'rejected') return '📹 Cuộc gọi video bị từ chối';
            if (msg.callStatus === 'ended') return '📹 Cuộc gọi video đã kết thúc';
            return '📹 Cuộc gọi video';
        }

        if (msg.type === 'voice_call') {
            if (msg.callStatus === 'missed') return '📞 Cuộc gọi nhỡ';
            if (msg.callStatus === 'rejected') return '📞 Cuộc gọi bị từ chối';
            if (msg.callStatus === 'ended') return '📞 Cuộc gọi đã kết thúc';
            return '📞 Cuộc gọi thoại';
        }

        if(msg.type === 'image') return '📷 Hình ảnh';

        return msg.content || '';
    };


    const displayTime = lastMsg
        ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : "";

    return (
        <div onClick={onOpen} className="group flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-all border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-3 flex-1">
                <div className="relative">
                    <img
                        src={checkAvatarPrivacy(partner)}
                        alt="avatar"
                        className="w-12 h-12 rounded-full object-cover border border-gray-200"
                    />
                    {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                </div>

                <div className="flex-1 min-w-0 py-1">
                    <div className="flex justify-between items-baseline">
                        <h4 className={`text-[15px] truncate ${item.unread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                            {partner.fname || partner.username || "Người dùng"}
                        </h4>
                        <span className="text-[11px] whitespace-nowrap ml-2 text-gray-400">
                            {displayTime}
                        </span>
                    </div>

                    <p className={`text-[13px] truncate pr-4 ${item.unread ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                        {renderLastMessage(item.lastMessage)}
                    </p>
                </div>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item._id);
                }}
                className="ml-4 p-2 text-gray-400 hover:text-red-500 md:opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
};

export default MessageItem;
