import React, { useEffect, useState } from 'react';
import { X, Send } from 'lucide-react';
import { commentPost } from '@/services/postService';
import CommentItem from './CommentItem';

const CommentSheet = ({ isOpen, onClose, post }) => {
    const [text, setText] = useState('');
    const [comments, setComments] = useState(post.comments || []);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setComments(post.comments || []);
    }, [post.comments]);

    if (!isOpen) return null;

    const handleSend = async () => {
        if (!text.trim() || loading) return;
        try {
            setLoading(true);
            const newComment = await commentPost(post._id, text);
            setComments(prev => [...prev, newComment]);
            setText('');
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const sortedComments = [...comments].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return (
        <div className="fixed inset-0 z-[150] flex items-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl mx-auto bg-white rounded-t-[32px] h-[80vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between px-6 py-4 shadow-sm">
                    <h3 className="font-bold text-gray-900">Bình luận ({comments.length})</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {sortedComments.length === 0 && (
                        <div className="text-center py-10 text-gray-400 text-sm">
                            Chưa có bình luận nào
                        </div>
                    )}

                    {sortedComments.map((comment) => (
                        <CommentItem
                            key={comment._id}
                            comment={comment}
                        />
                    ))}
                </div>

                <div className="p-4 shadow-sm bg-white">
                    <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl shadow-sm">
                        <input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Viết bình luận..."
                            className="flex-1 bg-transparent px-2 text-sm outline-none"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!text.trim() || loading}
                            className="p-2 bg-indigo-600 text-white rounded-xl disabled:opacity-50 shadow-sm"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommentSheet;