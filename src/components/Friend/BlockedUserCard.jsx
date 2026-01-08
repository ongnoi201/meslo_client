import React from 'react';
import { ShieldCheck, UserCheck, MoreVertical } from 'lucide-react';

const BlockedUserCard = ({ user, onUnblock }) => {
  return (
    <div className="group bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-100 transition-all">
      <div className="flex items-center justify-between">
        
        {/* THÔNG TIN NGƯỜI BỊ CHẶN */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-12 h-12 rounded-full grayscale object-cover border-2 border-gray-50"
            />
            <div className="absolute -bottom-1 -right-1 bg-gray-500 rounded-full p-0.5 border-2 border-white">
              <ShieldCheck size={10} className="text-white" />
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-800 text-sm group-hover:text-rose-600 transition-colors">
              {user.name}
            </h4>
            <p className="text-[11px] text-gray-400 font-medium">
              Đã chặn vào: {user.blockedDate}
            </p>
          </div>
        </div>

        {/* NÚT BỎ CHẶN */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onUnblock(user.id)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-600 rounded-xl transition-all text-xs font-bold border border-transparent hover:border-green-100"
          >
            <UserCheck size={16} />
            <span className="hidden sm:inline">Bỏ chặn</span>
          </button>
          
          <button className="p-2 text-gray-300 hover:text-gray-500 transition">
            <MoreVertical size={18} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default BlockedUserCard;