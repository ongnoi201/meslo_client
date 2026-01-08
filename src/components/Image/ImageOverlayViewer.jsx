import React, { useState } from 'react';
import {
    X, ChevronLeft, ChevronRight, Download,
    UserCircle, Image as ImageIcon, Maximize2
} from 'lucide-react';

const ImageOverlayViewer = ({images = [], initialIndex = 0, onClose, type = 'post', onUpdateAvatar, onUpdateCover, isMe}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const handleNext = (e) => {
        e.stopPropagation();
        if (currentIndex < images.length - 1) setCurrentIndex(currentIndex + 1);
    };

    const handlePrev = (e) => {
        e.stopPropagation();
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    };

    const handleDownload = (e) => {
        e.stopPropagation();
        const link = document.createElement('a');
        link.href = type === 'post' ? images[currentIndex].url : images[currentIndex];
        link.download = `meslo-image-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <div
            className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div className="absolute top-0 w-full p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent z-10">
                <div className="text-white text-sm font-medium">
                    {images.length > 1 && `${currentIndex + 1} / ${images.length}`}
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleDownload}
                        className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
                        title="Tải về"
                    >
                        <Download size={20} />
                    </button>

                    {type === 'avatar' && isMe && (
                        <button
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                onUpdateAvatar();
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-bold transition-all"
                        >
                            <UserCircle size={18} /> Đổi ảnh đại diện
                        </button>
                    )}

                    {type === 'cover' && isMe && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onUpdateCover(); }}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-bold transition-all"
                        >
                            <ImageIcon size={18} /> Đổi ảnh bìa
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="relative w-full h-full flex items-center justify-center p-4 md:p-10">
                {images.length > 1 && currentIndex > 0 && (
                    <button
                        onClick={handlePrev}
                        className="absolute left-4 z-20 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
                    >
                        <ChevronLeft size={32} />
                    </button>
                )}

                <img
                    src={type === 'post' ? images[currentIndex].url : images[currentIndex]}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain select-none shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                />

                {images.length > 1 && currentIndex < images.length - 1 && (
                    <button
                        onClick={handleNext}
                        className="absolute right-4 z-20 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
                    >
                        <ChevronRight size={32} />
                    </button>
                )}
            </div>

            {images.length > 1 && (
                <div className="absolute bottom-8 flex gap-2 p-2 bg-black/40 backdrop-blur-md rounded-2xl">
                    {images.map((img, idx) => (
                        <div
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                            className={`w-12 h-12 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${currentIndex === idx ? 'border-indigo-500 scale-110' : 'border-transparent opacity-50'
                                }`}
                        >
                            <img src={type === 'post' ? img.url: img} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageOverlayViewer;