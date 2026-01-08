import React from 'react';
import { MessageCircle, UserMinus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FriendCard = ({ friend, onMessage, onUnfriend }) => {
    const navigate = useNavigate();
    const userLocal = JSON.parse(localStorage.getItem('user'));
    const myId = userLocal?.id;
    const myUsername = userLocal?.username;

    const canShowAvatar = friend.id === myId || friend.privacy?.showAvatar !== false;
    const displayAvatar = canShowAvatar && friend.avatar
        ? friend.avatar
        : `https://api.dicebear.com/7.x/initials/svg?seed=${friend.username}`;

    return (
        <div className="group bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/profile/${friend.id}`)}>
                    <div className="relative flex-shrink-0">
                        <img
                            src={displayAvatar}
                            alt={friend.name}
                            className="w-12 h-12 rounded-xl bg-gray-50 object-cover border border-gray-100 transition-transform group-hover:scale-105"
                        />
                        {friend.status === 'online' && (
                            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                        )}
                    </div>

                    <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm truncate group-hover:text-indigo-600">
                            {myUsername === friend.username ? `${friend.name} (Bạn)` : friend.name}
                        </h4>
                        <p className="text-[11px] text-gray-400 font-medium truncate">@{friend.username}</p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {onMessage && friend.id !== myId && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onMessage(friend.id); }}
                            className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition shadow-sm"
                        >
                            <MessageCircle size={18} />
                        </button>
                    )}

                    {onUnfriend && friend.id !== myId && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onUnfriend(friend.id); }}
                            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition"
                        >
                            <UserMinus size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FriendCard;