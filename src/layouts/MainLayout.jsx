import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@/layouts/Header';
import Footer from '@/layouts/Footer';
import { socket } from '@/utils/socket';
import CallModal from '@/components/Messages/CallModal';
import { Phone, PhoneCall, PhoneOff, Video as VideoIcon } from 'lucide-react';
import { callActive, initGlobalMessageListener } from '@/services/messageService';
import { registerPush } from '@/services/userService';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MainLayout = ({ children }) => {
    const location = useLocation();
    const exactRoutes = ['/', '/messages', '/setting', '/feed', '/blockfriend'];
    const isShowLayout = exactRoutes.includes(location.pathname);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const myId = (user?._id || user?.id || '').toString();

    const [callData, setCallData] = useState(null);
    const [showCallModal, setShowCallModal] = useState(false);
    const ringtoneRef = useRef(null);

    useEffect(() => {
        initGlobalMessageListener();
    }, []);

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js');
        }

        if ('Notification' in window) {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        registerPush();
    }, []);


    useEffect(() => {
        const checkCall = async () => {
            const data = await callActive();
            if (data) {
                setCallData({
                    isReceiving: true,
                    from: data.sender,
                    type: data.type === 'video_call' ? 'video' : 'voice',
                    messageId: data._id
                });
                setShowCallModal(true);
            }
        };
        checkCall();
    }, []);

    const playRingtone = () => {
        if (!ringtoneRef.current) return;
        ringtoneRef.current.currentTime = 0;
        ringtoneRef.current.volume = 1;
        ringtoneRef.current.play().catch(() => { });
    };

    const stopRingtone = () => {
        if (!ringtoneRef.current) return;
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
    };

    useEffect(() => {
        if (!socket) return;
        socket.on('incoming_call', (data) => {
            console.log(data);
            if (document.hidden && 'serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(reg => {
                    reg.showNotification('Cuộc gọi đến', {
                        body: `${data.name} đang gọi cho bạn`,
                        icon: '/logo.png',
                        data: { url: '/messages' }
                    });
                });
            }

            setCallData({
                isReceiving: true,
                from: data.from,
                name: data.name,
                signal: data.signal,
                type: data.callType,
                messageId: data.messageId
            });

            playRingtone();
        });


        socket.on('call_ended', () => {
            setShowCallModal(false);
            setCallData(null);
        });

        const handleStartGlobalCall = (e) => {
            setCallData(e.detail);
            setShowCallModal(true);
        };

        window.addEventListener('start_global_call', handleStartGlobalCall);

        return () => {
            socket.off('incoming_call');
            socket.off('call_ended');
            window.removeEventListener('start_global_call', handleStartGlobalCall);
        };
    }, []);

    const handleAccept = () => {
        stopRingtone();
        setShowCallModal(true);
    };

    const handleReject = () => {
        stopRingtone();
        socket.emit('reject_call', {
            to: callData.from,
            messageId: callData.messageId
        });
        setCallData(null);
        setShowCallModal(false);
    };



    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {isShowLayout && <Header />}

            <main className={`flex-grow w-full mx-auto ${!isShowLayout ? 'p-0 max-w-full' : 'max-w-4xl p-4 mb-16 md:mb-0'
                }`}>
                {children}
            </main>

            {callData?.isReceiving && !showCallModal && (
                <div className="fixed top-5 right-5 z-[2000] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.2)] p-4 rounded-2xl border border-blue-100 flex items-center gap-4 animate-in fade-in slide-in-from-right-10 duration-300 w-[320px]">
                    <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                        {callData.type === 'video' ? <VideoIcon size={24} /> : <Phone size={24} />}
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-gray-800">{callData.name}</p>
                        <p className="text-xs text-gray-500">Đang gọi cho bạn...</p>
                    </div>
                    <div className="flex flex-col gap-1">
                        <button
                            onClick={handleAccept}
                            className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                            <PhoneCall size={16} className='text-green' />
                        </button>
                        <button
                            onClick={handleReject}
                            className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <PhoneOff size={16} className='text-red' />
                        </button>
                    </div>
                </div>
            )}

            {showCallModal && (
                <CallModal
                    callData={callData}
                    myId={myId}
                    onTrim={() => {
                        setShowCallModal(false);
                        setCallData(null);
                    }}
                />
            )}

            {isShowLayout && <Footer />}

            <audio
                ref={ringtoneRef}
                src="https://res.cloudinary.com/dcizsgteb/video/upload/v1767695297/call_baz763.mp3"
                loop
            />

            <ToastContainer />
        </div>
    );
};

export default MainLayout;