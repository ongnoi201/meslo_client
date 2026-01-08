import { Phone, Video, PhoneMissed, PhoneOff } from 'lucide-react';

const CallMessage = ({ msg, isMe }) => {
    const isVideo = msg.type === 'video_call';
    const getIcon = () => {
        if (msg.callStatus === 'missed') return <PhoneMissed size={16} />;
        if (msg.callStatus === 'rejected') return <PhoneOff size={16} />;
        return isVideo ? <Video size={16} /> : <Phone size={16} />;
    };

    const getText = () => {
        switch (msg.callStatus) {
            case 'calling':
                return 'Cuộc gọi đi';
            case 'missed':
                return 'Cuộc gọi nhỡ';
            case 'rejected':
                return 'Cuộc gọi bị từ chối';
            case 'busy':
                return 'Người dùng bận';
            case 'ended':
                return `Cuộc gọi đã kết thúc${msg.callDuration
                    ? ` (${Math.floor(msg.callDuration / 60)
                        .toString()
                        .padStart(2, '0')}:${(msg.callDuration % 60)
                            .toString()
                            .padStart(2, '0')})`
                    : ''}`;
            default:
                return 'Cuộc gọi';
        }
    };

    return (
        <div
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm shadow-sm
      ${isMe
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white text-gray-800 rounded-tl-none'
                }`}
        >
            {getIcon()}
            <span>{getText()}</span>
        </div>
    );
};

export default CallMessage;
