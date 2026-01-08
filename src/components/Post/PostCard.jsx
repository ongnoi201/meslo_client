import React, { useEffect, useState } from 'react';
import { Heart, MessageCircle, MoreHorizontal, Trash2, Clock, Globe, Lock } from 'lucide-react';
import CommentSheet from './CommentSheet';
import { likePost } from '@/services/postService';
import ImageOverlayViewer from '../Image/ImageOverlayViewer';
import { useNavigate } from 'react-router-dom';
import { checkAvatarPrivacy } from '@/utils/tools';

const PostCard = ({ post, onDelete, type = 'all_post' }) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = user._id || user.id || '';

    const [likes, setLikes] = useState(post.likes || []);
    const [isCommentOpen, setIsCommentOpen] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [viewerConfig, setViewerConfig] = useState({ isOpen: false, initialIndex: 0 });
    const navigate = useNavigate();
    const isLiked = likes.includes(currentUserId);
    const isOwner = post.author?._id === currentUserId;

    const handleLike = async () => {
        try {
            const data = await likePost(post._id);
            setLikes(data.likes);
        } catch (error) {
            console.error("Lỗi khi like:", error);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    useEffect(() => {
        setLikes(post.likes || []);
    }, [post.likes]);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    <img
                        src={checkAvatarPrivacy(post?.author)}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-50"
                        alt="avatar"
                        onClick={() => navigate(`/profile/${post.author?._id}`)} />
                    <div>
                        <h4 className="font-bold text-sm text-gray-900" onClick={() => navigate(`/profile/${post.author?._id}`)}>{post.author?.fname || post.author?.username}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                            <span className="flex items-center gap-1"><Clock size={12} /> {formatTime(post.createdAt)}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                {post.visibility === 'public' ? <Globe size={12} /> : <Lock size={12} />}
                                {post.visibility}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                        <MoreHorizontal size={20} />
                    </button>
                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
                            <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl border border-gray-100 rounded-xl z-20 py-1">
                                {isOwner && (
                                    <button onClick={() => { if (window.confirm("Xóa bài?")) onDelete(post._id); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 text-sm font-bold hover:bg-red-50 transition">
                                        <Trash2 size={16} /> Xóa bài viết
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {post.content && (
                <div className="px-4 pb-3 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                </div>
            )}

            {post.images?.length > 0 && (
                <div className={`grid gap-0.5 bg-gray-50 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {post.images.map((img, i) => (
                        <img
                            key={img.public_id}
                            src={img.url}
                            className="w-full aspect-square object-cover cursor-pointer hover:brightness-90 transition"
                            onClick={() => setViewerConfig({ isOpen: true, initialIndex: i })}
                            alt="post-img"
                        />
                    ))}
                </div>
            )}

            <div className="px-4 py-3 border-t border-gray-50 flex items-center gap-6">
                <button onClick={handleLike} className={`flex items-center gap-2 ${isLiked ? 'text-rose-500' : 'text-gray-500'}`}>
                    <Heart size={22} fill={isLiked ? "currentColor" : "none"} />
                    <span className="text-xs font-bold">{likes.length}</span>
                </button>
                {type === 'all_post' && (
                    <button onClick={() => setIsCommentOpen(true)} className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition">
                        <MessageCircle size={22} />
                        <span className="text-xs font-bold">{post.comments?.length || 0}</span>
                    </button>
                )}
            </div>

            {viewerConfig.isOpen && (
                <ImageOverlayViewer
                    images={post.images}
                    initialIndex={viewerConfig.initialIndex}
                    onClose={() => setViewerConfig({ ...viewerConfig, isOpen: false })}
                    type="post"
                />
            )}
            {type === "all_post" && (
                <CommentSheet isOpen={isCommentOpen} onClose={() => setIsCommentOpen(false)} post={post} />
            )}
        </div>
    );
};

export default PostCard;