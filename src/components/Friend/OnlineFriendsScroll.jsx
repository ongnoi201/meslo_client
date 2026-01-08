import React from 'react';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { checkAvatarPrivacy } from '@/utils/tools';

const OnlineFriendsScroll = ({ type = "list_friend", id, name, friends = [], onlineUsers = [] }) => {
    const navigate = useNavigate();
    const checkIsOnline = (friend) => {
        const friendId = friend._id || friend.id;
        return onlineUsers.includes(friendId);
    };

    const displayFriends = type === 'message' 
        ? friends.filter(friend => checkIsOnline(friend)).slice(0, 10)
        : friends.slice(0, 10);

    if (displayFriends.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
                    <Users size={16} className="text-indigo-600" /> 
                    {type === 'message' ? 'Bạn bè đang online' : `Bạn bè của ${name}`}
                </h3>
                <button 
                    onClick={() => navigate(`/friend/${id}`)} 
                    className="text-[11px] font-bold text-indigo-600 hover:underline"
                >
                    Xem tất cả
                </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {displayFriends.map((friend) => {
                    const friendId = friend._id || friend.id;
                    const isOnline = checkIsOnline(friend);

                    const handleItemClick = () => {
                        if (type === 'message') {
                            navigate(`/messages/${friendId}`);
                        } else {
                            navigate(`/profile/${friendId}`);
                        }
                    };

                    return (
                        <div 
                            key={friendId} 
                            onClick={handleItemClick}
                            className="flex flex-col items-center gap-2 min-w-[70px] cursor-pointer group"
                        >
                            <div className="relative">
                                <img 
                                    src={checkAvatarPrivacy(friend)} 
                                    alt={friend.username} 
                                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform" 
                                />
                                {isOnline && (
                                    <span className="absolute bottom-0 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                                )}
                            </div>
                            <span className="text-[11px] font-medium text-gray-600 truncate w-16 text-center">
                                {friend.fname || friend.username}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OnlineFriendsScroll;