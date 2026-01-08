import { login } from '@/services/authService';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// Import icons từ lucide-react (phổ biến với Tailwind) hoặc bạn có thể dùng emoji/SVG
import { Eye, EyeOff } from 'lucide-react';
import { socket } from '@/utils/socket';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ identity: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await login(formData);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full">
                 <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-3xl shadow-xl shadow-indigo-200 flex items-center justify-center mx-auto mb-6 rotate-3 hover:rotate-0 transition-transform duration-300">
                            <span className="text-white text-4xl font-black tracking-tighter">HD</span>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">Đăng nhập để quản lý hệ thống của bạn</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 mb-6 rounded text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Tài khoản</label>
                            <input
                                type="text"
                                name="identity"
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder="Email hoặc Username"
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="text-sm font-semibold text-gray-600">Mật khẩu</label>
                                <a href="#" className="text-xs text-indigo-600 hover:underline">Quên mật khẩu?</a>
                            </div>

                            {/* 2. Bọc Input vào div relative để đặt icon */}
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"} // Thay đổi type dựa trên state
                                    name="password"
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                    onChange={handleChange}
                                />
                                {/* Button chuyển đổi trạng thái */}
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3.5 rounded-xl text-white font-bold transition-all duration-300 ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg active:scale-[0.97]'
                                }`}
                        >
                            {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            Chưa có tài khoản?{' '}
                            <Link to="/register" className="font-bold text-indigo-600 hover:underline">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;