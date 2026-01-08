import React from 'react';

const LoadingOverlay = ({ message = "Đang xử lý..." }) => {
    return (
        <div className="fixed h-screen inset-0 z-[999] flex items-center justify-center bg-white/10 backdrop-blur-sm transition-opacity">
            <div className="flex flex-col items-center p-8">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="mt-4 text-indigo-900 font-bold animate-pulse">
                    {message}
                </p>
            </div>
        </div>
    );
};

export default LoadingOverlay;