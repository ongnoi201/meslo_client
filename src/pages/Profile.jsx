import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ChevronLeft, Camera, User, Calendar, Users,
    AtSign, AlignLeft, Check, Grid, Settings2,
    UserPlus, MessageCircle, X
} from 'lucide-react';
import PostCard from '@/components/Post/PostCard';
import { getUser, updateProfile, getFriends } from '@/services/userService';
import { getUserPosts } from '@/services/postService'; // Đã tách service bài viết
import ImageCropperModal from '@/components/Image/ImageCropperModal';
import ImageOverlayViewer from '@/components/Image/ImageOverlayViewer';
import LoadingOverlay from '@/components/More/LoadingOverlay';
import { toast } from 'react-toastify';
import { acceptFriendRequest, cancelFriendRequest, rejectFriendRequest, sendFriendRequest, unfriend } from '@/services/friendService';
import OnlineFriendsScroll from '@/components/Friend/OnlineFriendsScroll';
import HeaderPage from '@/components/More/HeaderPage';
import { checkAvatarPrivacy, checkCoverPrivacy } from '@/utils/tools';

const ProfileSetting = ({ onlineUsers }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('posts');
    const [userData, setUserData] = useState(null);
    const [friendsList, setFriendsList] = useState([]);
    const [friendsPrivacyMsg, setFriendsPrivacyMsg] = useState("");
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [postPage, setPostPage] = useState(1);
    const [hasMorePosts, setHasMorePosts] = useState(true);
    const [isPostsLoading, setIsPostsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [tempImage, setTempImage] = useState(null);
    const [cropType, setCropType] = useState(null);
    const avatarInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const [viewerConfig, setViewerConfig] = useState({
        isOpen: false, images: [], type: 'post', index: 0
    });

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            setFriendsPrivacyMsg("");
            try {
                const [userRes, friendsRes] = await Promise.all([
                    getUser(id),
                    getFriends(id).catch(() => ({ status: 201, data: { message: "Danh sách bạn bè đang ẩn" } }))
                ]);

                setUserData(userRes.data);

                if (friendsRes.status === 201) {
                    setFriendsPrivacyMsg(friendsRes.data.message);
                    setFriendsList([]);
                } else if (friendsRes.data) {
                    setFriendsList(friendsRes.data);
                }
            } catch (err) {
                console.error("Lỗi fetch profile:", err);
                setUserData(null);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchUserData();
            setPosts([]);
            setPostPage(1);
            loadInitialPosts();
        }
    }, [id]);

    const sortedFriends = useMemo(() => {
        if (!friendsList || friendsList.length === 0) return [];

        return [...friendsList].sort((a, b) => {
            const aId = a._id || a.id;
            const bId = b._id || b.id;
            const aOn = onlineUsers.includes(aId) || a.isOnline;
            const bOn = onlineUsers.includes(bId) || b.isOnline;
            return bOn - aOn;
        });
    }, [friendsList, onlineUsers]);

    const loadInitialPosts = async () => {
        setIsPostsLoading(true);
        try {
            const data = await getUserPosts(id, 1, 10);
            setPosts(data.posts || []);
            setHasMorePosts(1 < data.totalPages);
            setPostPage(1);
        } catch (err) {
            console.error("Lỗi tải bài viết:", err);
        } finally {
            setIsPostsLoading(false);
        }
    };

    const loadMorePosts = async () => {
        if (isPostsLoading || !hasMorePosts) return;
        setIsPostsLoading(true);
        try {
            const nextPage = postPage + 1;
            const data = await getUserPosts(id, nextPage, 10);
            setPosts(prev => [...prev, ...data.posts]);
            setHasMorePosts(nextPage < data.totalPages);
            setPostPage(nextPage);
        } catch (err) {
            console.error("Lỗi tải thêm bài viết:", err);
        } finally {
            setIsPostsLoading(false);
        }
    };

    const handleFriendAction = async (type) => {
        try {
            let response;
            const targetId = userData._id;
            switch (type) {
                case 'add': response = await sendFriendRequest(targetId); setUserData(prev => ({ ...prev, status: 'sent' })); break;
                case 'cancel': response = await cancelFriendRequest(targetId); setUserData(prev => ({ ...prev, status: 'none' })); break;
                case 'accept': response = await acceptFriendRequest(targetId); setUserData(prev => ({ ...prev, status: 'friend' })); break;
                case 'reject': response = await rejectFriendRequest(targetId); setUserData(prev => ({ ...prev, status: 'none' })); break;
                case 'unfriend':
                    response = await unfriend(targetId);
                    setUserData(prev => ({ ...prev, status: 'none' }));
                    toast.success("Đã hủy kết bạn.");
                    break;
                default: break;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Thao tác thất bại");
        }
    };

    const wrapAsyncAction = async (actionFn, message) => {
        setLoadingMessage(message);
        setIsUpdating(true);
        try { await actionFn(); } finally { setIsUpdating(false); setLoadingMessage(""); }
    };

    const onFileChange = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => { setTempImage(reader.result); setCropType(type); };
    };

    const handleUploadCroppedImage = async (blob) => {
        await wrapAsyncAction(async () => {
            const formData = new FormData();
            const fieldName = cropType === 'avatar' ? 'avatar' : 'coverImage';
            formData.append(fieldName, new File([blob], `${cropType}.jpg`, { type: 'image/jpeg' }));
            const res = await updateProfile(formData);
            setUserData(prev => ({ ...res.data.user, isMe: true, status: 'me' }));
            toast.success("Cập nhật ảnh thành công!");
            setTempImage(null);
        }, "Đang tải ảnh lên...");
    };

    const handleUpdateInfo = async (e) => {
        e.preventDefault();
        const form = e.target;
        await wrapAsyncAction(async () => {
            const formData = new FormData();
            formData.append('profile', JSON.stringify({
                bio: form.bio.value, gender: form.gender.value, birthday: form.birthday.value,
            }));
            formData.append('fname', form.fname.value);
            formData.append('username', form.username.value);
            formData.append('birthday', form.birthday.value);
            formData.append('gender', form.gender.value);
            const res = await updateProfile(formData);
            setUserData(prev => ({ ...res.data.user, isMe: true, status: 'me' }));
            toast.success("Cập nhật thành công!");
            setActiveTab('posts');
        }, "Đang lưu thông tin...");
    };

    if (loading) return <LoadingOverlay message="Đang tải hồ sơ" />;

    if (!userData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                <div className="p-8 bg-white rounded-3xl shadow-xl border border-gray-100 max-w-sm">
                    <X size={40} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-black text-gray-800">Không tìm thấy hồ sơ</h2>
                    <button onClick={() => navigate('/')} className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-2xl font-bold transition">Về trang chủ</button>
                </div>
            </div>
        );
    }

    const isOwnProfile = userData.isMe;
    const birthdayFormatted = userData.profile?.birthday
        ? new Date(userData.profile.birthday).toLocaleDateString("vi-VN")
        : "";

    return (
        <div className="max-w-2xl mx-auto min-h-screen bg-gray-50/30 pb-10">
            {isUpdating && <LoadingOverlay message={loadingMessage} />}
            {tempImage && (
                <ImageCropperModal image={tempImage} type={cropType} onClose={() => setTempImage(null)} onConfirm={handleUploadCroppedImage} />
            )}
            {viewerConfig.isOpen && (
                <ImageOverlayViewer
                    images={viewerConfig.images} type={viewerConfig.type} initialIndex={viewerConfig.index}
                    onClose={() => setViewerConfig({ ...viewerConfig, isOpen: false })}
                    onUpdateAvatar={() => { setViewerConfig({ ...viewerConfig, isOpen: false }); avatarInputRef.current.click(); }}
                    onUpdateCover={() => { setViewerConfig({ ...viewerConfig, isOpen: false }); coverInputRef.current.click(); }}
                    isMe={isOwnProfile}
                />
            )}
            <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => onFileChange(e, 'avatar')} />
            <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => onFileChange(e, 'cover')} />
            <HeaderPage title={isOwnProfile ? "Hồ sơ của tôi" : userData.fname} />

            <div className="relative bg-white">
                <div className="h-48 md:h-64 w-full relative overflow-hidden bg-gray-200">
                    <img
                        src={checkCoverPrivacy(userData)}
                        className="w-full h-full object-cover cursor-pointer"
                        alt="Cover"
                        onClick={() => (isOwnProfile || userData.privacy?.showCover) && setViewerConfig({ isOpen: true, images: [userData.profile?.coverImage || "https://images.unsplash.com/photo-1557683316-973673baf926"], type: 'cover', index: 0 })}
                    />
                    {isOwnProfile && (
                        <button onClick={() => coverInputRef.current.click()} className="absolute bottom-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition">
                            <Camera size={18} />
                        </button>
                    )}
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 -bottom-14">
                    <div className="relative">
                        <img
                            src={checkAvatarPrivacy(userData)}
                            className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-xl object-cover bg-white cursor-pointer"
                            alt="Avatar"
                            onClick={() => (isOwnProfile || userData.privacy?.showAvatar) && setViewerConfig({ isOpen: true, images: [userData.profile?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${userData.username}`], type: 'avatar', index: 0 })}
                        />
                        {isOwnProfile && (
                            <button onClick={() => avatarInputRef.current.click()} className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full border-4 border-white hover:bg-indigo-700 transition">
                                <Camera size={12} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-16 text-center px-6">
                <h1 className="text-xl font-black text-gray-900">{userData.fname}</h1>
                <p className="text-indigo-600 font-bold text-xs">@{userData.username}</p>
                <p className="text-gray font-bold text-xs">{birthdayFormatted}</p>
                <p className="text-gray-500 font-bold text-xs">{userData?.email}</p>
                <p className="mt-3 text-gray-500 text-sm italic max-w-sm mx-auto">{userData.profile?.bio}</p>

                {!isOwnProfile && (
                    <div className="flex justify-center gap-2 mt-5">
                        {userData.status === 'friend' && <button onClick={() => handleFriendAction('unfriend')} className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm border hover:bg-red-50 transition"><Users size={16} /> Bạn bè</button>}
                        {userData.status === 'received' && <div className="flex gap-2"><button onClick={() => handleFriendAction('accept')} className="px-5 py-2 bg-green-600 text-white rounded-xl font-bold text-sm">Chấp nhận</button><button onClick={() => handleFriendAction('reject')} className="px-5 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm">Từ chối</button></div>}
                        {userData.status === 'sent' && <button onClick={() => handleFriendAction('cancel')} className="px-6 py-2 bg-amber-50 text-amber-600 rounded-xl font-bold text-sm border border-amber-200">Hủy yêu cầu</button>}
                        {(userData.status === 'none' || !userData.status) && <button onClick={() => handleFriendAction('add')} className="flex items-center gap-2 px-8 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm"><UserPlus size={16} /> Kết bạn</button>}
                        <button onClick={() => navigate(`/messages/${userData._id}`)} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100"><MessageCircle size={20} /></button>
                    </div>
                )}
            </div>

            <div className="px-4 mt-6">
                {friendsPrivacyMsg ? (
                    <div className="p-4 bg-gray-100/50 rounded-2xl text-center text-gray-400 text-sm italic border border-dashed">{friendsPrivacyMsg}</div>
                ) : (
                    sortedFriends.length > 0 && <OnlineFriendsScroll friends={sortedFriends} name={userData.fname} id={userData._id} onlineUsers={onlineUsers} />
                )}
            </div>

            <div className="flex border-b mt-4 sticky top-[60px] bg-white z-20">
                <button onClick={() => setActiveTab('posts')} className={`flex-1 py-4 font-bold text-sm ${activeTab === 'posts' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-400'}`}>Bài viết</button>
                {isOwnProfile && <button onClick={() => setActiveTab('edit')} className={`flex-1 py-4 font-bold text-sm ${activeTab === 'edit' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-400'}`}>Cài đặt</button>}
            </div>

            <div className="p-4">
                {activeTab === 'edit' ? (
                    <form onSubmit={handleUpdateInfo} className="bg-white p-5 rounded-2xl shadow-sm space-y-6">
                        <h3 className="font-black text-gray-700 mb-3">Thông tin cá nhân</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase">Họ tên</label>
                                <input
                                    name="fname"
                                    type="text"
                                    defaultValue={userData.fname}
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase">Username</label>
                                <input
                                    name="username"
                                    type="text"
                                    defaultValue={userData.username}
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase">Email</label>
                                <input
                                    type="email"
                                    value={userData.email}
                                    disabled
                                    className="w-full px-4 py-2.5 bg-gray-100 text-gray-400 rounded-xl cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase">Ngày sinh</label>
                                <input
                                    name="birthday"
                                    type="date"
                                    defaultValue={
                                        userData.profile?.birthday
                                            ? userData.profile.birthday.split('T')[0]
                                            : ''
                                    }
                                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase">Giới tính</label>
                                <select
                                    name="gender"
                                    defaultValue={userData.profile?.gender || ''}
                                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl outline-none"
                                >
                                    <option value="">-- Chọn --</option>
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase">Tiểu sử</label>
                            <textarea name="bio" rows="2" defaultValue={userData.profile?.bio} className="w-full px-4 py-2.5 bg-gray-50 shadow-sm rounded-xl outline-none resize-none" />
                        </div>
                        <button type="submit" disabled={isUpdating} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Lưu thay đổi</button>
                    </form>
                ) : (
                    <div className="space-y-4">
                        {posts.length > 0 ? (
                            <>
                                {posts.map(post => <PostCard key={post._id} post={post} />)}
                                {hasMorePosts && (
                                    <button
                                        onClick={loadMorePosts}
                                        className="w-full py-4 bg-white rounded-2xl text-indigo-600 font-bold shadow-sm hover:bg-indigo-50 transition"
                                    >
                                        {isPostsLoading ? "Đang tải..." : "Xem thêm bài viết"}
                                    </button>
                                )}
                            </>
                        ) : (
                            !isPostsLoading && <div className="py-20 text-center text-gray-400 bg-white rounded-2xl border border-dashed"><p>Chưa có bài viết nào.</p></div>
                        )}
                        {isPostsLoading && <div className="py-4 text-center text-gray-400">Đang tải bài viết...</div>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileSetting;