import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Smartphone, Mail, MessageSquare,
  UserPlus, Heart, Info
} from 'lucide-react';
import NotifyToggle from '@/components/More/NotifyToggle';
import HeaderPage from '@/components/More/HeaderPage';

const SettingNotify = () => {
  const navigate = useNavigate();
  const STORAGE_KEY = 'user_notification_settings';

  // 1. Khởi tạo State: Ưu tiên lấy từ LocalStorage, nếu không có thì dùng default
  const [notifs, setNotifs] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      pushNotifications: true,
      emailNotifications: false,
      messages: true,
      newFollowers: true,
      likesComments: true,
      systemUpdates: true
    };
  });

  // 2. useEffect: Tự động lưu vào LocalStorage mỗi khi state 'notifs' thay đổi
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
  }, [notifs]);

  const toggleNotif = (key) => {
    setNotifs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-2xl mx-auto min-h-screen animate-in fade-in duration-300">
      {/* HEADER */}
      <HeaderPage title={"Cài đặt Thông báo"} />

      <div className="p-6 space-y-8">
        {/* NHÓM 1: PHƯƠNG THỨC NHẬN */}
        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Kênh nhận thông báo</h3>
          <div className="bg-white rounded-2xl border border-gray-100 px-5 shadow-sm">
            <NotifyToggle
              icon={Smartphone}
              label="Thông báo đẩy (Push)"
              value={notifs.pushNotifications}
              onChange={() => toggleNotif('pushNotifications')}
              color="text-blue-600"
              description="Nhận thông báo trực tiếp trên màn hình."
            />
            <NotifyToggle
              icon={Mail}
              label="Email"
              value={notifs.emailNotifications}
              onChange={() => toggleNotif('emailNotifications')}
              color="text-red-500"
              description="Gửi tóm tắt vào hộp thư đến."
            />
          </div>
        </section>

        {/* NHÓM 2: HOẠT ĐỘNG TƯƠNG TÁC */}
        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Hoạt động cá nhân</h3>
          <div className="bg-white rounded-2xl border border-gray-100 px-5 shadow-sm">
            <NotifyToggle
              icon={MessageSquare}
              label="Tin nhắn mới"
              value={notifs.messages}
              onChange={() => toggleNotif('messages')}
              color="text-green-600"
              description="Thông báo khi có tin nhắn mới."
            />
            <NotifyToggle
              icon={UserPlus}
              label="Người theo dõi mới"
              value={notifs.newFollowers}
              onChange={() => toggleNotif('newFollowers')}
              color="text-indigo-600"
              description="Biết khi có ai đó bắt đầu theo dõi."
            />
            <NotifyToggle
              icon={Heart}
              label="Tương tác bài viết"
              value={notifs.likesComments}
              onChange={() => toggleNotif('likesComments')}
              color="text-pink-600"
              description="Lượt thích, bình luận hoặc nhắc tên."
            />
          </div>
        </section>

        {/* NHÓM 3: HỆ THỐNG */}
        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Ứng dụng</h3>
          <div className="bg-white rounded-2xl border border-gray-100 px-5 shadow-sm">
            <NotifyToggle
              icon={Info}
              label="Cập nhật hệ thống"
              value={notifs.systemUpdates}
              onChange={() => toggleNotif('systemUpdates')}
              color="text-gray-600"
              description="Tính năng mới hoặc bảo trì."
            />
          </div>
        </section>

        <p className="text-center text-[10px] text-gray-400 px-10">
          Cài đặt được tự động lưu vào trình duyệt của bạn.
        </p>
      </div>
    </div>
  );
};

export default SettingNotify;