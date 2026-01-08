import { checkAvatarPrivacy } from "@/utils/tools";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const CommentItem = ({ comment }) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = user._id || user.id || '';
    const isOwner = comment.user?._id === currentUserId;
    
    return (
        <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
            <img
                src={checkAvatarPrivacy(comment?.user)}
                className="w-8 h-8 rounded-full object-cover"
                alt="avatar"
            />

            <div className="flex flex-col max-w-[85%]">
                <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm">
                    <p className="font-bold text-[12px] text-gray-900 mb-0.5">
                        {isOwner ? `${comment.user?.fname} (Bạn)` : comment.user?.fname }
                    </p>
                    <p className="text-sm text-gray-800 leading-snug">
                        {comment.text}
                    </p>
                </div>

                <span className="text-[10px] text-gray-400 mt-1 ml-1">
                    {comment.createdAt
                        ? formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                            locale: vi
                        })
                        : "Vừa xong"}
                </span>
            </div>
        </div>
    );
};

export default CommentItem;
