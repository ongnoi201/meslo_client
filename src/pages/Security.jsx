import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Lock,
    Eye,
    EyeOff,
    ShieldCheck,
    CheckCircle2,
    LockKeyhole,
    Loader2
} from 'lucide-react';
import PrivacyToggle from '@/components/More/PrivacyToggle';
import { changePassword } from '@/services/authService';
import LoadingOverlay from '@/components/More/LoadingOverlay';
import { getUser, updateProfile } from '@/services/userService';
import HeaderPage from '@/components/More/HeaderPage';

const Security = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showPass, setShowPass] = useState(false);
    const [loadingPrivacy, setLoadingPrivacy] = useState(true);

    const [privacy, setPrivacy] = useState({});

    // 2. Xử lý thay đổi input
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 3. Xử lý Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        // Validate cơ bản
        if (formData.newPassword !== formData.confirmPassword) {
            return setMessage({ type: 'error', text: 'Mật khẩu mới không khớp!' });
        }
        if (formData.newPassword.length < 8) {
            return setMessage({ type: 'error', text: 'Mật khẩu mới phải từ 8 ký tự!' });
        }

        setLoading(true);
        try {
            const result = await changePassword({
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword
            });
            alert("Đổi mật khẩu thành công");
            setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' }); // Reset form
        } catch (err) {
            setMessage({ type: 'error', text: err }); // err này là chuỗi message từ interceptor
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoadingPrivacy(true);
                const res = await getUser(); // Gọi API GET /profile
                if (res.data && res.data.privacy) {
                    setPrivacy(res.data.privacy);                    
                }
            } catch (err) {
                console.error("Không thể lấy thông tin privacy:", err);
            } finally {
                setLoadingPrivacy(false);
            }
        };

        fetchUserData();
    }, []);

    const handlePrivacyChange = async (key) => {
        const newValue = !privacy[key];

        // Cập nhật UI tạm thời (Optimistic Update)
        const updatedPrivacy = { ...privacy, [key]: newValue };
        setPrivacy(updatedPrivacy);

        try {
            // Gửi lên backend (Hàm updateProfile bạn đã viết ở câu đầu tiên)
            await updateProfile({ privacy: updatedPrivacy });
            alert("changed");
        } catch (err) {
            // Nếu lỗi thì rollback lại giá trị cũ
            setPrivacy(prev => ({ ...prev, [key]: !newValue }));
            alert("Lỗi: " + err);
        }
    };

    return (
        <div className="max-w-2xl mx-auto min-h-screen animate-in slide-in-from-right-4 duration-300">
            {/* HEADER */}
            <HeaderPage title={"Bảo mật & Quyền riêng tư"} />

            <div className="p-6 space-y-8">

                {/* PHẦN 1: ĐỔI MẬT KHẨU */}
                <section>
                    <div className="flex items-center gap-2 mb-4 text-indigo-600">
                        <LockKeyhole size={20} />
                        <h3 className="font-bold text-lg uppercase tracking-wide">Đổi mật khẩu</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4 shadow-sm">
                        {/* Thông báo */}
                        {message.text && (
                            <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="relative">
                            <label className="text-md font-bold text-gray-500 ml-1 mb-1 block">Mật khẩu cũ</label>
                            <input
                                name="oldPassword"
                                value={formData.oldPassword}
                                onChange={handleChange}
                                type={showPass ? "text" : "password"}
                                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="relative">
                            <label className="text-md font-bold text-gray-500 ml-1 mb-1 block">Mật khẩu mới</label>
                            <input
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                type={showPass ? "text" : "password"}
                                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                placeholder="Tối thiểu 8 ký tự"
                                required
                            />
                        </div>

                        <div className="relative">
                            <label className="text-md font-bold text-gray-500 ml-1 mb-1 block">Xác nhận mật khẩu mới</label>
                            <input
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                type={showPass ? "text" : "password"}
                                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                placeholder="Nhập lại mật khẩu mới"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-11 text-gray-400 hover:text-indigo-600 transition"
                            >
                                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                            {loading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                        </button>
                    </form>
                </section>

                {/* PHẦN 2: QUYỀN RIÊNG TƯ */}
                {loadingPrivacy && (
                    <LoadingOverlay message='Đang tải dữ liệu...' />
                )}
                <section>
                    <div className="flex items-center gap-2 mb-4 text-indigo-600">
                        <Eye size={20} />
                        <h3 className="font-bold text-lg uppercase tracking-wide">Quyền riêng tư</h3>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 px-5 shadow-sm">
                        <PrivacyToggle
                            label="Ngày sinh"
                            description="Cho phép mọi người xem ngày sinh của bạn"
                            value={privacy.showBirthday}
                            onChange={() => handlePrivacyChange('showBirthday')}
                        />
                        <PrivacyToggle
                            label="Ảnh đại diện"
                            description="Hiển thị ảnh đại diện với người lạ"
                            value={privacy.showAvatar}
                            onChange={() => handlePrivacyChange('showAvatar')}
                        />
                        <PrivacyToggle
                            label="Ảnh bìa"
                            description="Công khai ảnh bìa trang cá nhân"
                            value={privacy.showCover}
                            onChange={() => handlePrivacyChange('showCover')}
                        />
                        <PrivacyToggle
                            label="Địa chỉ Email"
                            description="Hiển thị email liên hệ trên hồ sơ"
                            value={privacy.showEmail}
                            onChange={() => handlePrivacyChange('showEmail')}
                        />
                        <PrivacyToggle
                            label="Bài viết"
                            description="Hiển thị bài viết cho mọi người"
                            value={privacy.showPosts}
                            onChange={() => handlePrivacyChange('showPosts')}
                        />
                        <PrivacyToggle
                            label="Giới thiệu (Bio)"
                            description="Cho phép xem đoạn mô tả bản thân"
                            value={privacy.showBio}
                            onChange={() => handlePrivacyChange('showBio')}
                        />
                        <PrivacyToggle
                            label="Bạn bè"
                            description="Cho phép xem danh sách bạn bè"
                            value={privacy.showFriends}
                            onChange={() => handlePrivacyChange('showFriends')}
                        />
                    </div>
                </section>

                {/* Ghi chú bảo mật */}
                <div className="flex gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100 text-blue-700 text-sm">
                    <CheckCircle2 size={24} className="shrink-0" />
                    <p>
                        Tài khoản của bạn đang được bảo vệ. Hãy đảm bảo không chia sẻ mật khẩu cho bất kỳ ai.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Security;