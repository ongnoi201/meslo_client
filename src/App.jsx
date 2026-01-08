import React, { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import Messages from '@/pages/Messages';
import ChatDetail from './pages/ChatDetail';
import Profile from './pages/Profile';
import Setting from './pages/Setting';
import Security from './pages/Security';
import SettingNotify from './pages/SettingNotify';
import Appearance from './pages/Appearance';
import About from './pages/About';
import PostsPage from './pages/Posts';
import Home from './pages/Home';
import FriendsPage from './pages/FriendsPage';
import BlockedListPage from './pages/BlockedListPage';
import Register from './pages/Register';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PulicRoute';
import Notifications from './pages/Notify';
import PostDetail from './pages/PostDetail';
import { useSocketEvents } from './utils/useSocketEvents';
import { usePostSocket } from './utils/usePostSocket';

function App() {
    const { onlineUsers } = useSocketEvents();
    const user = JSON.parse(localStorage.getItem('user'));
    const myId = user?._id || user?.id;
    usePostSocket({
        myId
    });
    return (
        <Routes>
            {/* 1. PUBLIC ROUTES: Không dùng MainLayout hoặc dùng Layout riêng */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            {/* 2. PROTECTED ROUTES: Phải đăng nhập mới vào được */}
            <Route
                path="/*"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/messages" element={<Messages onlineUsers={onlineUsers} />} />
                                <Route path="/messages/:id" element={<ChatDetail onlineUsers={onlineUsers} />} />
                                <Route path="/friend" element={<FriendsPage onlineUsers={onlineUsers} />} />
                                <Route path="/friend/:id" element={<FriendsPage onlineUsers={onlineUsers} />} />
                                <Route path="/blockfriend" element={<BlockedListPage />} />
                                <Route path="/setting" element={<Setting />} />
                                <Route path="/profile/:id" element={<Profile onlineUsers={onlineUsers} />} />
                                <Route path="/security" element={<Security />} />
                                <Route path="/notifications" element={<SettingNotify />} />
                                <Route path="/appearance" element={<Appearance />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/feed" element={<PostsPage onlineUsers={onlineUsers} />} />
                                <Route path="/post/:id" element={<PostDetail onlineUsers={onlineUsers} />} />
                                <Route path="/notify" element={<Notifications onlineUsers={onlineUsers} />} />

                                {/* Trang 404 nếu cần */}
                                <Route path="*" element={<div>Not Found</div>} />
                            </Routes>
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

export default App;