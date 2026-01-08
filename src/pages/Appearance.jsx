import React, { useState } from 'react';
import { Moon, Sun, Monitor, MessageSquare, Type, Palette, Check } from 'lucide-react';
import HeaderPage from '@/components/More/HeaderPage';
import { toast } from 'react-toastify';

const Appearance = () => {
    const STORAGE_KEY = 'app_appearance_settings';

    const [appearance, setAppearance] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : {
            theme: 'light',
            fontSize: 'medium',
            chatColor: 'bg-indigo-600'
        };
    });

    const { theme, fontSize, chatColor } = appearance;
    const updateSetting = (key, value) => {
        setAppearance(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance));
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        toast.success('Đã lưu thay đổi giao diện!');
    };

    const themeOptions = [
        { id: 'light', label: 'Sáng', icon: Sun },
        { id: 'dark', label: 'Tối', icon: Moon },
        { id: 'system', label: 'Hệ thống', icon: Monitor },
    ];

    return (
        <div className={`max-w-2xl mx-auto min-h-screen shadow-sm animate-in fade-in duration-300 pb-10 transition-colors ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            <HeaderPage title={"Giao diện"} />
            <div className="p-6 space-y-10">
                <section>
                    <div className="flex items-center gap-2 mb-4 font-bold">
                        <Palette size={20} className="text-indigo-500" />
                        <h3>Chế độ hiển thị</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {themeOptions.map((opt) => {
                            const Icon = opt.icon;
                            const isActive = theme === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => updateSetting('theme', opt.id)}
                                    className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${isActive
                                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500'
                                            : theme === 'dark' ? 'border-gray-800 bg-gray-800 text-gray-400 hover:border-gray-700' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                                        }`}
                                >
                                    <Icon size={24} className="mb-2" />
                                    <span className="text-sm font-bold">{opt.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-2 mb-4 font-bold">
                        <MessageSquare size={20} className="text-indigo-500" />
                        <h3>Mẫu tin nhắn mặc định</h3>
                    </div>

                    <div className={`rounded-3xl p-6 min-h-[160px] space-y-4 shadow-inner transition-all duration-500 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <div className="flex justify-start">
                            <div className={`p-3 rounded-2xl rounded-bl-none shadow-sm max-w-[80%] text-sm ${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-800'}`}>
                                Chào bạn! Đây là cỡ chữ và màu sắc bạn đã chọn.
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <div className={`${chatColor} text-white p-3 rounded-2xl rounded-br-none shadow-md max-w-[80%] ${fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-lg' : 'text-sm'}`}>
                                Trông rất cân đối! 🚀
                            </div>
                        </div>
                    </div>
                </section>

                <div className={`p-5 rounded-3xl border space-y-8 ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Type size={14} /> Cỡ chữ ứng dụng
                        </p>
                        <div className="flex items-center gap-4 px-2">
                            <span className="text-xs font-medium">A</span>
                            <input
                                type="range" min="1" max="3" step="1"
                                value={fontSize === 'small' ? 1 : fontSize === 'medium' ? 2 : 3}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    updateSetting('fontSize', val === 1 ? 'small' : val === 2 ? 'medium' : 'large');
                                }}
                                className="flex-grow h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                            <span className="text-xl font-bold">A</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Palette size={14} /> Màu sắc chủ đạo
                        </p>
                        <div className="flex flex-wrap gap-3 px-1">
                            {['bg-indigo-600', 'bg-blue-500', 'bg-sky-500', 'bg-emerald-500', 'bg-rose-500', 'bg-zinc-800'].map((color) => (
                                <button
                                    key={color}
                                    onClick={() => updateSetting('chatColor', color)}
                                    className={`w-10 h-10 rounded-full ${color} flex items-center justify-center transition-all active:scale-90 shadow-md`}
                                >
                                    {chatColor === color && <Check size={20} className="text-white" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <Check size={20} />
                    Lưu cài đặt giao diện
                </button>
            </div>
        </div>
    );
};

export default Appearance;