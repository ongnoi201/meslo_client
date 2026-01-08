import { checkAvatarPrivacy } from '@/utils/tools';
import React from 'react';

const FriendRequestCard = ({ request, onAccept, onDecline }) => {
    return (
        <div className="min-w-[220px] bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center transition-all hover:shadow-md">
            <div className="relative mb-3">
                <img
                    src={checkAvatarPrivacy(request)}
                    alt={request.name}
                    className="w-20 h-20 rounded-full bg-gray-50 object-cover p-1 border border-indigo-100"
                />
            </div>
            <h4 className="font-bold text-gray-900 text-sm mb-1 truncate w-full px-2">
                {request.name}
            </h4>
            <p className="text-[11px] text-gray-400 mb-4 font-medium">
                @{request.username}
            </p>
            <div className="flex gap-2 w-full">
                <button
                    onClick={() => onAccept(request.id)}
                    className="flex-1 py-2 bg-indigo-600 text-white text-[11px] font-black rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 uppercase tracking-tighter"
                >
                    Chấp nhận
                </button>
                <button
                    onClick={() => onDecline(request.id)}
                    className="flex-1 py-2 bg-gray-100 text-gray-500 text-[11px] font-black rounded-xl hover:bg-gray-200 transition uppercase tracking-tighter"
                >
                    Xóa
                </button>
            </div>
        </div>
    );
};

export default FriendRequestCard;