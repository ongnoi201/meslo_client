import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, MessageCircle } from 'lucide-react';
import { getPostById, commentPost, deletePost } from '@/services/postService';
import PostCard from '@/components/Post/PostCard';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { usePostSocket } from '@/utils/usePostSocket';
import HeaderPage from '@/components/More/HeaderPage';
import { toast } from 'react-toastify';
import LoadingOverlay from '@/components/More/LoadingOverlay';
import { checkAvatarPrivacy } from '@/utils/tools';

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState("");

    useEffect(() => {
        fetchPost();
    }, [id]);

    usePostSocket({
        myId: user._id,
        postId: post?._id,

        onPostCommented: ({ comment }) => {
            setPost(prev => {
                if (!prev) return prev;

                const exists = prev.comments.some(c => c._id === comment._id);
                if (exists) return prev;

                return {
                    ...prev,
                    comments: [...prev.comments, comment]
                };
            });
        },

        onPostLiked: ({ likes }) => {
            setPost(prev => prev ? { ...prev, likes } : prev);
        },

        onPostDeleted: () => {
            navigate('/');
        }
    });


    const fetchPost = async () => {
        try {
            setLoading(true);
            const data = await getPostById(id);
            setPost(data);
        } catch (err) {
            console.log(err.response?.data?.message || "Không thể tải bài viết");
        } finally {
            setLoading(false);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            const newComment = await commentPost(post._id, commentText);
            setPost({
                ...post,
                comments: [...post.comments, newComment]
            });
            setCommentText("");
        } catch (err) {
            toast.error("Không thể gửi bình luận");
        }
    };

    const handleOnDelete = async (postId) => {
        try {
            await deletePost(postId);
            navigate('/feed');
        } catch (err) {
            toast.error("Xóa bài viết thất bại");
        }
    };

    const sortedComments = post?.comments
        ? [...post.comments].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
        : [];

    return (
        <div className="max-w-2xl mx-auto">
            <HeaderPage title={"Bài viết"} />
            {loading && (<LoadingOverlay message='Đang tải bài viết' />)}
            {post ? (
                <div className='p-4'>
                    <PostCard
                        post={post}
                        onDelete={handleOnDelete}
                        type='detail_post'
                    />
                </div>
            ) : (<div className='p-4 mt-4 text-center text-amber-500'>Bài viết này có thể đã bị xóa.</div>)}

            <div className="mt-2 space-y-4 p-4">

                {post && (
                    <div className="flex items-center gap-2 px-2 mb-4">
                        <MessageCircle size={18} className="text-gray-600" />
                        <span className="font-bold text-sm text-gray-700">Tất cả bình luận</span>
                    </div>
                )}

                {sortedComments?.map((comment) => {
                    return (
                        <div
                            key={comment._id}
                            className="flex gap-3 group animate-in fade-in slide-in-from-bottom-2"
                        >
                            <img
                                src={checkAvatarPrivacy(comment.user)}
                                className="w-8 h-8 rounded-full object-cover"
                                alt="avatar"
                            />

                            <div className="flex flex-col max-w-[85%]">
                                <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm">
                                    <p className="font-bold text-[12px] text-gray-900 mb-0.5">
                                        {comment.user?.fname || comment.user?.username}
                                    </p>
                                    <p className="text-sm text-gray-800 leading-snug">
                                        {comment.text}
                                    </p>
                                </div>

                                <span className="text-[10px] text-gray-400 mt-1 ml-1">
                                    {comment.createdAt
                                        ? formatDistanceToNow(new Date(comment.createdAt), {
                                            addSuffix: true,
                                            locale: vi,
                                        })
                                        : "Vừa xong"}
                                </span>
                            </div>
                        </div>
                    );
                })}

                {post?.comments?.length === 0 && (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed">
                        <p className="text-gray-400 text-sm">Chưa có bình luận nào</p>
                    </div>
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-3 z-50">
                <form onSubmit={handleComment} className="max-w-2xl mx-auto flex gap-2 items-center">
                    <img
                        src={user.profile?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
                        className="w-8 h-8 rounded-full hidden sm:block border"
                        alt="me"
                    />
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Viết bình luận công khai..."
                            className="w-full bg-gray-100 border-none rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!commentText.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 disabled:text-gray-300 transition"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostDetail;