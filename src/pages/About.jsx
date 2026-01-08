import React from 'react';
import {
    ShieldCheck,
    FileText,
    Globe,
    Github,
    Heart,
    ChevronRight,
    ExternalLink
} from 'lucide-react';
import HeaderPage from '@/components/More/HeaderPage';

const AboutLink = ({ icon: Icon, label, onClick, extra = "" }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 last:border-0"
    >
        <div className="flex items-center space-x-4">
            <div className="p-2 rounded-lg bg-gray-50 text-gray-600">
                <Icon size={20} />
            </div>
            <span className="font-semibold text-gray-800 text-sm md:text-base">{label}</span>
        </div>
        <div className="flex items-center text-gray-400">
            <span className="text-xs mr-2">{extra}</span>
            <ChevronRight size={18} />
        </div>
    </button>
);

const SettingAbout = () => {
    return (
        <div className="max-w-2xl mx-auto min-h-screen animate-in fade-in duration-300">
            <HeaderPage title={"Về ứng dụng"} />
            <div className="p-8 flex flex-col items-center">
                <div className="mb-10 text-center">
                    <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-3xl shadow-xl shadow-indigo-200 flex items-center justify-center mx-auto mb-6 rotate-3 hover:rotate-0 transition-transform duration-300">
                        <span className="text-white text-4xl font-black tracking-tighter">HD</span>
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">HD Meslo</h1>
                    <p className="text-gray-400 text-sm mt-1 font-medium">Phiên bản 1.0.24 (Build 2026)</p>
                </div>
                <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                    <AboutLink
                        icon={FileText}
                        label="Điều khoản dịch vụ"
                        onClick={() => window.open('#', '_blank')}
                    />
                    <AboutLink
                        icon={ShieldCheck}
                        label="Chính sách bảo mật"
                        onClick={() => window.open('#', '_blank')}
                    />
                    <AboutLink
                        icon={Globe}
                        label="Trang web chính thức"
                        extra="meslo.côm"
                        onClick={() => window.open('://aaaa', '_blank')}
                    />
                    <AboutLink
                        icon={Github}
                        label="Mã nguồn mở"
                        extra="v1.0.24"
                        onClick={() => window.open('https://github.com', '_blank')}
                    />
                </div>

                <div className="w-full p-6 bg-indigo-50 rounded-3xl border border-indigo-100 flex flex-col items-center text-center">
                    <div className="p-3 bg-white rounded-full shadow-sm mb-4 text-indigo-600">
                        <Heart size={24} fill="currentColor" />
                    </div>
                    <h3 className="font-bold text-indigo-900 mb-2">Phát triển bởi Hoàng Duy</h3>
                    <p className="text-sm text-indigo-700/70 leading-relaxed max-w-xs">
                        Ứng dụng này được xây dựng với mục tiêu kết nối mọi người thông qua giao diện đơn giản bảo mật.
                    </p>
                    <button className="mt-4 flex items-center gap-2 text-xs font-bold text-indigo-600 hover:underline">
                        Đánh giá ứng dụng <ExternalLink size={12} />
                    </button>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">
                        ©2026 HELLO Tech. All Rights Reserved.
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-1 text-gray-300">
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingAbout;