import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Smile, Send, X, Plus, Globe, Lock, Loader2 } from 'lucide-react';
import { createPost } from '@/services/postService';
import { toast } from 'react-toastify';

const CreatePost = ({ onPostCreated }) => {
    const [content, setContent] = useState('');
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [visibility, setVisibility] = useState('public');
    const [isExpanding, setIsExpanding] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const user = JSON.parse(localStorage.getItem("user"));
    const avatar = user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`;
    const fname = user.name || "Người dùng";

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 5) {
            toast.warn('Tối đa 5 ảnh');
            return;
        }
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
        setImages(prev => [...prev, ...files]);
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
        setPreviews(previews.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!content.trim() && images.length === 0) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('content', content);
            formData.append('visibility', visibility);
            images.forEach((file) => {
                formData.append('images', file);
            });
            const newPost = await createPost(formData);
            onPostCreated(newPost);
            setContent('');
            setImages([]);
            setPreviews([]);
            setVisibility('public');
            setIsExpanding(false);
        } catch (error) {
            toast.error('Đăng bài thất bại');
            console.log("Đăng bài thất bại: " + (error.message || error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all">
            <div className="p-4">
                <div className="flex gap-3">
                    <img
                        src={avatar}
                        className="w-10 h-10 rounded-full object-cover border border-gray-100"
                        alt="Me"
                    />
                    <div className="flex-1">
                        <div className="flex flex-col gap-1 mb-2">
                            <span className="font-bold text-sm">{fname}</span>

                            {/* Nút chọn quyền riêng tư */}
                            {isExpanding && (
                                <div className="relative inline-block">
                                    <select
                                        value={visibility}
                                        onChange={(e) => setVisibility(e.target.value)}
                                        className="appearance-none bg-gray-100 px-2 py-1 pr-7 rounded-md text-[11px] font-bold text-gray-600 outline-none cursor-pointer hover:bg-gray-200 transition"
                                    >
                                        <option value="public">Công khai</option>
                                        <option value="private">Chỉ mình tôi</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center px-1 text-gray-500">
                                        {visibility === 'public' ? <Globe size={12} /> : <Lock size={12} />}
                                    </div>
                                </div>
                            )}
                        </div>

                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onFocus={() => setIsExpanding(true)}
                            placeholder="Bạn đang nghĩ gì thế?"
                            className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition min-h-[44px] resize-none"
                            rows={isExpanding ? 3 : 1}
                        />
                    </div>
                </div>

                {/* Image Previews */}
                {previews.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                        {previews.map((url, index) => (
                            <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100">
                                <img src={url} className="w-full h-full object-cover" alt="preview" />
                                <button onClick={() => removeImage(index)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70">
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                        {previews.length < 5 && (
                            <button onClick={() => fileInputRef.current.click()} className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50">
                                <Plus size={20} />
                                <span className="text-[10px] font-bold mt-1">Thêm ảnh</span>
                            </button>
                        )}
                    </div>
                )}

                {isExpanding && (
                    <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between animate-in fade-in slide-in-from-top-1">
                        <div className="flex gap-1">
                            <input type="file" multiple accept="image/*" hidden ref={fileInputRef} onChange={handleImageChange} />
                            <button onClick={() => fileInputRef.current.click()} className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition flex items-center gap-2 text-xs font-bold">
                                <ImageIcon size={18} /> Ảnh
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => { setIsExpanding(false); setPreviews([]); setImages([]); }}
                                className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={(!content.trim() && images.length === 0) || loading}
                                className="px-6 py-2 bg-indigo-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-100"
                            >
                                {loading
                                    ?
                                    <Loader2 className="animate-spin" size={16} />
                                    : <Send size={16} />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreatePost;