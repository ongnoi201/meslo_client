import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, ZoomIn, Maximize, Loader2 } from 'lucide-react';
import { getCroppedImg } from '@/utils/cropImage';

const ImageCropperModal = ({ image, type, loading = false, onClose, onConfirm }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [aspect, setAspect] = useState(type === 'avatar' ? 1 : 16 / 9);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropComplete = useCallback((_, pixels) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const handleConfirm = async () => {
        const blob = await getCroppedImg(image, croppedAreaPixels);
        onConfirm(blob);
    };

    const aspectRatios = [
        { label: '1:1', value: 1 },
        { label: '4:3', value: 4 / 3 },
        { label: '16:9', value: 16 / 9 },
        { label: '3:4', value: 3 / 4 },
        { label: '9:16', value: 9 / 16 },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">Cắt ảnh {type === 'avatar' ? 'đại diện' : 'ảnh bìa'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition"><X size={20} /></button>
                </div>

                <div className="relative h-80 md:h-96 bg-gray-200">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                        <ZoomIn size={20} className="text-gray-400" />
                        <input
                            type="range" value={zoom} min={1} max={3} step={0.1}
                            onChange={(e) => setZoom(e.target.value)}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center">
                        {aspectRatios.map((ratio) => (
                            <button
                                key={ratio.label}
                                onClick={() => setAspect(ratio.value)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${aspect === ratio.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            >
                                {ratio.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <button onClick={onClose} className="flex-1 py-3 font-bold text-gray-500 rounded-xl hover:bg-gray-50">Hủy</button>
                        <button
                            onClick={handleConfirm}
                            disabled={loading}
                            className={`flex-1 py-3 font-bold rounded-xl shadow-lg transition-all
                                ${loading
                                    ? 'bg-indigo-400 cursor-not-allowed opacity-70' // Style khi loading
                                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 text-white' // Style bình thường
                                }`}
                        >
                            {loading
                                ?
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    <span>Đang lưu</span>
                                </>
                                : 'Áp dụng'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageCropperModal;