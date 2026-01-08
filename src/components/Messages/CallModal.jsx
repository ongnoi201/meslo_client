import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer/simplepeer.min.js';
import { PhoneOff, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { socket } from '@/utils/socket';

const CallModal = ({ callData, myId, onTrim }) => {
    const [localStream, setLocalStream] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [micOn, setMicOn] = useState(true);
    const [videoOn, setVideoOn] = useState(callData.type === 'video');

    const myVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerRef = useRef(null);
    const initializedRef = useRef(false);
    const signaledRef = useRef(false);

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;
        const startCall = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: callData.type === 'video'
                });

                setLocalStream(stream);
                if (myVideoRef.current) {
                    myVideoRef.current.srcObject = stream;
                }

                const peer = new Peer({
                    initiator: !callData.isReceiving,
                    trickle: false,
                    stream,
                    config: {
                        iceServers: [
                            { urls: 'stun:stun.l.google.com:19302' },
                            { urls: 'stun:stun1.l.google.com:19302' }
                        ]
                    }
                });

                peerRef.current = peer;
                peer.on('signal', (signal) => {
                    if (callData.isReceiving) {
                        socket.emit('answer_call', {
                            to: callData.from,
                            signal,
                            messageId: callData.messageId
                        });
                    } else {
                        socket.emit('call_user', {
                            userToCall: callData.to,
                            from: myId,
                            name: JSON.parse(localStorage.getItem('user'))?.name || 'User',
                            callType: callData.type,
                            signalData: signal
                        });
                    }
                });

                peer.on('stream', (remoteStream) => {
                    setCallAccepted(true);
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = remoteStream;
                    }
                });

                peer.on('error', (err) => {
                    console.error('Peer error:', err);
                    endAndClose();
                });

                if (callData.isReceiving && callData.signal) {
                    peer.signal(callData.signal);
                }

                socket.on('call_accepted', (signal) => {
                    if (!signaledRef.current) {
                        peer.signal(signal);
                        signaledRef.current = true;
                        setCallAccepted(true);
                    }
                });

                socket.on('call_rejected', () => {
                    alert('Người kia đã từ chối cuộc gọi');
                    endAndClose();
                });

                socket.on('call_ended', () => {
                    endAndClose();
                });

            } catch (err) {
                console.error('Media error:', err);
                alert('Không thể truy cập Camera/Microphone');
                onTrim();
            }
        };

        startCall();

        return () => {
            cleanup();
        };
    }, []);

    const stopMedia = () => {
        if (!localStream) return;
        localStream.getTracks().forEach(track => {
            track.stop();
        });
        setLocalStream(null);
        if (myVideoRef.current) {
            myVideoRef.current.srcObject = null;
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }
    };


    const cleanup = () => {
        socket.off('call_accepted');
        socket.off('call_rejected');
        socket.off('call_ended');
        socket.off('new_message');

        if (peerRef.current) {
            peerRef.current.destroy();
            peerRef.current = null;
        }

        stopMedia();
    };


    const endAndClose = () => {
        cleanup();
        onTrim();
    };

    const toggleMic = () => {
        if (!localStream) return;
        const track = localStream.getAudioTracks()[0];
        track.enabled = !track.enabled;
        setMicOn(track.enabled);
    };

    const toggleVideo = () => {
        if (!localStream) return;
        const track = localStream.getVideoTracks()[0];
        track.enabled = !track.enabled;
        setVideoOn(track.enabled);
    };

    const endCall = () => {
        socket.emit('end_call', {
            to: callData.isReceiving ? callData.from : callData.to,
            messageId: callData.messageId,
            startTime: Date.now()
        });

        cleanup();
        onTrim();
    };

    return (
        <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center text-white">
            <div className="relative w-full h-full max-w-4xl bg-gray-900 md:rounded-2xl overflow-hidden">
                <div className="w-full h-full flex items-center justify-center bg-black">
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain"
                    />

                    {!callAccepted && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
                            <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="text-lg tracking-wide">
                                {callData.isReceiving
                                    ? 'Đang kết nối...'
                                    : `Đang gọi ${callData.name}...`}
                            </p>
                        </div>
                    )}
                </div>

                <div className="absolute top-5 right-5 w-28 h-40 rounded-xl overflow-hidden border border-white/20 bg-black">
                    <video
                        ref={myVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    {!videoOn && (
                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                            <VideoOff size={20} className="text-gray-500" />
                        </div>
                    )}
                </div>

                <div className="absolute bottom-0 w-full p-6 flex justify-center gap-8 bg-gray-800/90">
                    <button
                        onClick={toggleMic}
                        className={`p-4 rounded-full ${micOn ? 'bg-gray-700' : 'bg-red-500'}`}
                    >
                        {micOn ? <Mic /> : <MicOff />}
                    </button>

                    <button
                        onClick={endCall}
                        className="p-5 rounded-full bg-red-600"
                    >
                        <PhoneOff size={28} />
                    </button>

                    {callData.type === 'video' && (
                        <button
                            onClick={toggleVideo}
                            className={`p-4 rounded-full ${videoOn ? 'bg-gray-700' : 'bg-red-500'}`}
                        >
                            {videoOn ? <Video /> : <VideoOff />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CallModal;
