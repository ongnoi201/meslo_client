import { useEffect } from "react";
import { socket } from "./socket";
import { connectSocket } from "@/services/messageService";
import { setHasNewPost } from "./newPostStorage";

export const usePostSocket = ({
    myId,
    postId,               // 👈 optional (dùng cho PostDetail)
    onNewPost,
    onPostDeleted,
    onPostLiked,
    onPostCommented
}) => {

    // 1️⃣ CONNECT SOCKET – CHỈ 1 LẦN
    useEffect(() => {
        if (!myId) return;
        connectSocket(myId);
    }, [myId]);

    // 2️⃣ LISTEN EVENTS
    useEffect(() => {

        // 🆕 NEW POST
        const handleNotification = (data) => {
            if (data.type === 'new_post') {
                setHasNewPost();
                onNewPost?.(data.post);
            }
        };

        // ❌ DELETE POST
        const handlePostDeleted = (deletedPostId) => {
            if (postId && deletedPostId !== postId) return;
            onPostDeleted?.(deletedPostId);
        };

        // ❤️ LIKE
        const handlePostLiked = ({ postId: likedPostId, likes }) => {
            if (postId && likedPostId !== postId) return;
            onPostLiked?.({ postId: likedPostId, likes });
        };

        // 💬 COMMENT
        const handlePostCommented = ({ postId: commentedPostId, comment }) => {
            if (postId && commentedPostId !== postId) return;
            onPostCommented?.({ postId: commentedPostId, comment });
        };

        socket.on('get_notification', handleNotification);
        socket.on('post_deleted', handlePostDeleted);
        socket.on('post_liked', handlePostLiked);
        socket.on('post_commented', handlePostCommented);

        return () => {
            socket.off('get_notification', handleNotification);
            socket.off('post_deleted', handlePostDeleted);
            socket.off('post_liked', handlePostLiked);
            socket.off('post_commented', handlePostCommented);
        };

    }, [
        postId,
        onNewPost,
        onPostDeleted,
        onPostLiked,
        onPostCommented
    ]);
};
