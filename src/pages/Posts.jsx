import React, { useState, useEffect } from 'react';
import PostCard from '@/components/Post/PostCard';
import CreatePost from '@/components/Post/CreatePost';
import { getNewsfeed, deletePost } from '@/services/postService';
import { usePostSocket } from '@/utils/usePostSocket';
import { clearNewPost } from '@/utils/newPostStorage';
import { toast } from 'react-toastify';

const PostsPage = () => {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));
    const myId = user?._id || user?.id;

    const loadPosts = async (pageNum) => {
        try {
            setLoading(true);
            const data = await getNewsfeed(pageNum, 10);
            if (pageNum === 1) {
                setPosts(data.posts);
            } else {
                setPosts(prev => [...prev, ...data.posts]);
            }
            setHasMore(pageNum < data.totalPages);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts(1);
    }, []);

    useEffect(() => {
        clearNewPost();
    }, []);

    usePostSocket({
        myId,
        onNewPost: (post) => {
            setPosts(prev => {
                if (prev.some(p => p._id === post._id)) return prev;
                return [post, ...prev];
            });
        },
        onPostDeleted: (postId) => {
            setPosts(prev => prev.filter(p => p._id !== postId));
        },

        onPostLiked: ({ postId, likes }) => {
            setPosts(prev =>
                prev.map(p =>
                    p._id === postId ? { ...p, likes } : p
                )
            );
        },

        onPostCommented: ({ postId, comment }) => {
            setPosts(prev =>
                prev.map(p =>
                    p._id === postId
                        ? { ...p, comments: [...(p.comments || []), comment] }
                        : p
                )
            );
        }
    });

    const handlePostCreated = (newPost) => {
        setPosts(prev => [newPost, ...prev]);
    };

    const handleDeletePost = async (postId) => {
        try {
            await deletePost(postId);
            setPosts(prev => prev.filter(p => p._id !== postId));
            toast.success("Đã xóa bài viết")
        } catch (error) {
            toast.error("Không thể xóa bài viết")
            console.log("Không thể xóa bài viết: " + error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-2xl mx-auto px-0 md:px-4 py-4 space-y-4">
                <CreatePost onPostCreated={handlePostCreated} />

                <div className="space-y-4 pb-20">
                    {posts.map((post) => (
                        <PostCard
                            key={post._id}
                            post={post}
                            onDelete={handleDeletePost}
                        />
                    ))}

                    {hasMore && (
                        <button
                            onClick={() => { setPage(p => p + 1); loadPosts(page + 1); }}
                            className="w-full py-4 bg-white rounded-2xl text-indigo-600 font-bold shadow-sm hover:bg-indigo-50 transition"
                        >
                            {loading ? "Đang tải..." : "Xem thêm bài viết"}
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PostsPage;