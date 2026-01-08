export const checkAvatarPrivacy =  (dataUser) => {
    const currentUserId = JSON.parse(localStorage.getItem('user'))?.id;
    const isMe = dataUser?._id === currentUserId;
    const isShowAvatar = isMe || dataUser.privacy?.showAvatar !== false;
    const avatar = isShowAvatar && dataUser.profile?.avatar
        ? dataUser.profile?.avatar
        : `https://api.dicebear.com/7.x/initials/svg?seed=${dataUser.username}`;
    return avatar;
}

export const checkCoverPrivacy =  (dataUser) => {
    const currentUserId = JSON.parse(localStorage.getItem('user'))?.id;
    const isMe = dataUser?._id === currentUserId;
    const isShowCover = isMe || dataUser.privacy?.showCover !== false;
    const cover = isShowCover && dataUser.profile?.coverImage
        ? dataUser.profile?.coverImage
        : `https://images.unsplash.com/photo-1557683316-973673baf926`;
    return cover;
}