import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    ShieldCheck,
    Bell,
    Palette,
    Info,
    ChevronRight,
    LogOut,
    LogIn
} from 'lucide-react';
import { getUser } from '@/services/userService';

const SettingItem = ({ icon: Icon, label, description, onClick, color = "text-gray-700" }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 active:bg-gray-100 transition-all border-b border-gray-100 last:border-0"
    >
        <div className="flex items-center space-x-4">
            <div className={`p-2 rounded-xl bg-gray-50 ${color}`}>
                <Icon size={22} />
            </div>
            <div className="text-left">
                <p className="font-semibold text-gray-900">{label}</p>
                {description && <p className="text-xs text-gray-500">{description}</p>}
            </div>
        </div>
        <ChevronRight size={18} className="text-gray-400" />
    </button>
);

const Setting = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Kiểm tra login qua sự tồn tại của token
    const isLoggedIn = !!localStorage.getItem('token');

    useEffect(() => {
        if (isLoggedIn) {
            const fetchUserData = async () => {
                try {
                    // Gọi hàm getUser() không truyền ID để lấy thông tin chính mình
                    const res = await getUser();
                    setUser(res.data);
                } catch (err) {
                    console.error("Lỗi xác thực:", err);
                    // Nếu lỗi do token hết hạn, có thể logout luôn
                    if (err.response?.status === 401) handleLogout(false);
                } finally {
                    setLoading(false);
                }
            };
            fetchUserData();
        } else {
            setLoading(false);
        }
    }, [isLoggedIn]);

    const handleLogout = (confirm = true) => {
        if (confirm && !window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi MesLo?")) return;
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const settingsMenu = [
        { id: 'profile', label: 'Hồ sơ cá nhân', description: 'Tên, ảnh đại diện và tiểu sử', icon: User, color: 'text-blue-600', path: `/profile/${user?._id}` },
        { id: 'security', label: 'Bảo mật và mật khẩu', description: 'Đổi mật khẩu, xác thực 2 lớp', icon: ShieldCheck, color: 'text-green-600', path: '/security' },
        { id: 'notifications', label: 'Cài đặt thông báo', description: 'Tin nhắn, thông báo hệ thống', icon: Bell, color: 'text-orange-600', path: '/notifications' },
        { id: 'appearance', label: 'Cài đặt giao diện', description: 'Chế độ tối, màu chủ đạo', icon: Palette, color: 'text-purple-600', path: '/appearance' },
        { id: 'about', label: 'Về MesLo', description: 'Phiên bản ứng dụng, điều khoản', icon: Info, color: 'text-gray-600', path: '/about' },
    ];

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto pb-10 px-4 animate-fade-in">
            {/* --- PHẦN ĐẦU TRANG (USER INFO) --- */}
            <div className="flex flex-col items-center justify-center py-10 mb-4 to-transparent rounded-3xl">
                <div className="relative group">
                    <img
                        src={isLoggedIn ? (user?.profile?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`) : "https://www.svgrepo.com/show/452030/avatar-default.svg"}
                        alt="Avatar"
                        className="w-28 h-28 rounded-full border-4 border-white shadow-xl object-cover bg-white transition-transform group-hover:scale-105"
                    />
                    {isLoggedIn && (
                        <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-sm"></div>
                    )}
                </div>

                {isLoggedIn ? (
                    <div className="text-center mt-5">
                        <h2 className="text-2xl font-bold text-gray-900">{user?.fname}</h2>
                        <p className="text-sm text-gray-500 font-medium">{user?.email || "Chưa cập nhật email"}</p>
                    </div>
                ) : (
                    <div className="text-center mt-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 uppercase tracking-tight">Trải nghiệm tốt hơn</h2>
                        <p className="text-sm text-gray-500 mb-5 max-w-[200px] mx-auto">Đăng nhập để đồng bộ cài đặt và kết nối bạn bè</p>
                        <button 
                            onClick={() => navigate('/login')}
                            className="flex items-center justify-center space-x-2 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                        >
                            <LogIn size={18} />
                            <span>Đăng nhập ngay</span>
                        </button>
                    </div>
                )}
            </div>

            {/* --- DANH SÁCH CÀI ĐẶT --- */}
            <div className="space-y-4">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {settingsMenu.map((item) => (
                        <SettingItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            description={item.description}
                            color={item.color}
                            onClick={() => navigate(item.path)}
                        />
                    ))}
                </div>

                {/* --- NÚT ĐĂNG XUẤT (Chỉ hiện khi đã đăng nhập) --- */}
                {isLoggedIn && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <SettingItem
                            icon={LogOut}
                            label="Đăng xuất"
                            description="Thoát khỏi phiên làm việc này"
                            color="text-red-500"
                            onClick={() => handleLogout()}
                        />
                    </div>
                )}
            </div>

            <div className="mt-12 text-center">
                <div className="text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase">
                    MESLO Social Network
                </div>
                <div className="text-gray-300 text-[10px] mt-1">
                    Build 2026.1.5 • v1.0.24
                </div>
            </div>
        </div>
    );
};

export default Setting;