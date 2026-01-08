import React, { useState } from 'react';
import { ShieldX, Search, AlertCircle, ArrowLeft } from 'lucide-react';
import BlockedUserCard from '@/components/Friend/BlockedUserCard';

const BlockedListPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [blockedUsers, setBlockedUsers] = useState([
    { id: 1, name: "Người Dùng Ẩn Danh", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hacker", blockedDate: "12/12/2025" },
    { id: 2, name: "Spammer Pro", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Spam", blockedDate: "15/12/2025" },
    { id: 3, name: "Nick Ảo 001", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bot", blockedDate: "20/12/2025" },
  ]);

  const handleUnblock = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn bỏ chặn người này? Họ sẽ có thể gửi tin nhắn và xem bài viết của bạn.")) {
      setBlockedUsers(blockedUsers.filter(u => u.id !== id));
    }
  };

  const filteredUsers = blockedUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fcfcfd] p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* NÚT QUAY LẠI & TIÊU ĐỀ */}
        <div className="flex items-center gap-4">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Quản lý những người không thể tương tác với bạn
          </p>
        </div>

        {/* GHI CHÚ CẢNH BÁO */}
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3 items-start">
          <AlertCircle className="text-amber-500 shrink-0" size={20} />
          <p className="text-xs text-amber-700 leading-relaxed font-medium">
            Khi bạn chặn một người, họ sẽ không thể xem bài viết trên dòng thời gian, gửi tin nhắn hoặc tìm thấy hồ sơ của bạn. Bạn có thể bỏ chặn họ bất cứ lúc nào.
          </p>
        </div>

        {/* THANH TÌM KIẾM TRONG DANH SÁCH CHẶN */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm trong danh sách đen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none shadow-sm transition font-medium text-sm"
          />
        </div>

        {/* DANH SÁCH NGƯỜI BỊ CHẶN */}
        <div className="space-y-3">
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <BlockedUserCard
                key={user.id}
                user={user}
                onUnblock={handleUnblock}
              />
            ))
          ) : (
            <div className="py-20 text-center space-y-3">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <ShieldX size={30} className="text-gray-300" />
              </div>
              <p className="text-gray-400 text-sm font-medium">Không tìm thấy ai bị chặn.</p>
            </div>
          )}
        </div>

        {/* THỐNG KÊ GỌN */}
        <div className="pt-4 text-center">
          <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.2em]">
            Tổng cộng: {blockedUsers.length} mục
          </p>
        </div>

      </div>
    </div>
  );
};

export default BlockedListPage;