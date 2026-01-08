import React from 'react';
import { MessageCircle, UserPlus, UserMinus, UserCheck, UserX, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { checkAvatarPrivacy } from '@/utils/tools';

const UserCard = ({ user, onAction }) => {
    const { status } = user;
    const navigate = useNavigate();
    return (
        <div className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3" onClick={() => navigate(`/profile/${user._id}`)}>
                <img
                    src={checkAvatarPrivacy(user)}
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover border"
                />
                <div>
                    <h4 className="font-semibold text-gray-800">{user.fname || user.username}</h4>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => onAction('message', user._id)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                    title="Nhắn tin"
                >
                    <MessageCircle size={18} />
                </button>

                {status === 'none' && (
                    <button
                        onClick={() => onAction('add', user._id)}
                        className="flex items-center gap-1 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        <UserPlus size={16} /> Kết bạn
                    </button>
                )}

                {status === 'friend' && (
                    <button
                        onClick={() => onAction('unfriend', user._id)}
                        className="flex items-center gap-1 px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-red-100 hover:text-red-600 transition-colors"
                    >
                        <UserMinus size={16} /> Hủy kết bạn
                    </button>
                )}

                {status === 'received' && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => onAction('accept', user._id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                        >
                            <UserCheck size={16} /> Chấp nhận
                        </button>
                        <button
                            onClick={() => onAction('reject', user._id)}
                            className="p-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Từ chối"
                        >
                            <UserX size={16} />
                        </button>
                    </div>
                )}

                {status === 'sent' && (
                    <button
                        onClick={() => onAction('cancel', user._id)}
                        className="flex items-center gap-1 px-4 py-1.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
                    >
                        <Clock size={16} className="animate-pulse" /> Hủy yêu cầu
                    </button>
                )}
            </div>
        </div>
    );
};

export default UserCard;