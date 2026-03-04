import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '../lib/firebase';
import {
    collection, doc, setDoc, deleteDoc, onSnapshot,
    query, where, serverTimestamp, addDoc, getDocs
} from 'firebase/firestore';
import { Mic, MicOff, PhoneOff, Hash, Volume2, WifiOff, MonitorUp, MonitorOff } from 'lucide-react';

const AudioWave = ({ stream, isMuted, activeColor }: { stream: MediaStream | null, isMuted: boolean, activeColor: string }) => {
    const waveRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!stream || isMuted || stream.getAudioTracks().length === 0 || !waveRef.current) {
            if (waveRef.current) {
                waveRef.current.style.transform = 'scale(1)';
                waveRef.current.style.opacity = '0';
            }
            return;
        }

        // Handle no audio support gracefully
        let audioCtx: AudioContext;
        try { audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)(); }
        catch (e) { return; }

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;

        let source: MediaStreamAudioSourceNode;
        try {
            source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
        } catch (e) { return; }

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let animationId: number;

        const checkVolume = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const average = sum / dataArray.length;

            if (waveRef.current) {
                const scale = 1 + (average / 150);
                waveRef.current.style.transform = `scale(${scale})`;
                waveRef.current.style.opacity = average > 5 ? `${0.3 + (average / 255)}` : '0';
            }
            animationId = requestAnimationFrame(checkVolume);
        };
        checkVolume();

        return () => {
            cancelAnimationFrame(animationId);
            if (audioCtx.state !== 'closed') audioCtx.close();
        };
    }, [stream, isMuted]);

    return (
        <div ref={waveRef} className={`absolute inset-0 rounded-full border-[3px] ${activeColor} transition-transform duration-75 pointer-events-none z-0`} style={{ transform: 'scale(1)', opacity: 0 }} />
    );
};

const RemoteAudio: React.FC<{ stream: MediaStream, email: string }> = ({ stream, email }) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (audioRef.current && stream) {
            console.log(`Attaching stream for ${email}`, stream.getTracks());
            audioRef.current.srcObject = stream;

            // Explicitly play to handle some browser quirks
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn(`Auto-play prevented for ${email}:`, error);
                });
            }
        }
    }, [stream, email]);

    return (
        <audio
            ref={audioRef}
            autoPlay
            playsInline
            data-email={email}
            className="hidden"
        />
    );
};

interface VoiceBoxProps {
    currentUserEmail: string;
    roomNameOverride?: string;
}

const ROOMS = ['GTA Online', 'Euro Truck', 'Call of Duty', 'Other Games'];

const sanitizeEmail = (email: string) => email.replace(/\./g, '_').replace(/@/g, '-at-');

const VoiceBox: React.FC<VoiceBoxProps> = ({ currentUserEmail, roomNameOverride }) => {
    const [currentRoom, setCurrentRoom] = useState<string | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [globalRoomState, setGlobalRoomState] = useState<{ [room: string]: string[] }>({
        'GTA Online': [],
        'Euro Truck': [],
        'Call of Duty': [],
        'Other Games': []
    });
    const [dbError, setDbError] = useState<string | null>(null);

    // WebRTC
    const localStreamRef = useRef<MediaStream | null>(null);
    const peersRef = useRef<{ [email: string]: RTCPeerConnection }>({});
    const [remoteStreams, setRemoteStreams] = useState<{ [email: string]: MediaStream }>({});
    const meKey = sanitizeEmail(currentUserEmail);
    const signalingUnsubRef = useRef<(() => void) | null>(null);

    // Screen Share
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const screenStreamRef = useRef<MediaStream | null>(null);
    const screenPeersRef = useRef<{ [email: string]: RTCPeerConnection }>({});
    const [remoteScreenStreams, setRemoteScreenStreams] = useState<{ [email: string]: MediaStream }>({});

    // 1. Listen globally to who is in which room (presence)
    useEffect(() => {
        const q = query(collection(db, 'voicePresence'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setDbError(null);
            const newState: { [room: string]: string[] } = {
                'GTA Online': [],
                'Euro Truck': [],
                'Call of Duty': [],
                'Other Games': []
            };
            snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.room && newState[data.room] !== undefined) {
                    newState[data.room].push(data.email);
                }
            });
            setGlobalRoomState(newState);
        }, (error) => {
            console.error("Firestore Presence Error:", error);
            setDbError("Signaling server connection error. Please check your network.");
        });

        return () => unsubscribe();
    }, []);

    const createPeerConnection = useCallback((remoteEmail: string, signalingId: string) => {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        });

        localStreamRef.current?.getTracks().forEach(track => {
            if (localStreamRef.current) pc.addTrack(track, localStreamRef.current);
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                // Add ICE candidate to the signaling document
                addDoc(collection(db, `voiceSignaling/${signalingId}/iceCandidates`), {
                    candidate: event.candidate.toJSON(),
                    from: currentUserEmail,
                    timestamp: serverTimestamp()
                });
            }
        };

        pc.ontrack = (event) => {
            console.log(`Received track from ${remoteEmail}:`, event.track.kind);
            setRemoteStreams(prev => {
                const existingStream = prev[remoteEmail];
                if (existingStream) {
                    // Check if track is already in the stream
                    if (!existingStream.getTracks().find(t => t.id === event.track.id)) {
                        existingStream.addTrack(event.track);
                    }
                    // Return a NEW MediaStream object to trigger React re-renders/useEffect
                    return { ...prev, [remoteEmail]: new MediaStream(existingStream.getTracks()) };
                } else {
                    return { ...prev, [remoteEmail]: event.streams[0] || new MediaStream([event.track]) };
                }
            });
        };

        pc.onconnectionstatechange = () => {
            console.log(`Connection state with ${remoteEmail}:`, pc.connectionState);
        };

        peersRef.current[remoteEmail] = pc;
        return pc;
    }, [currentUserEmail]);

    const stopScreenShare = useCallback(() => {
        screenStreamRef.current?.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
        setIsScreenSharing(false);
        Object.values(screenPeersRef.current).forEach(pc => (pc as RTCPeerConnection).close());
        screenPeersRef.current = {};
        if (currentRoom) {
            setDoc(doc(db, 'voicePresence', meKey), { isScreenSharing: false }, { merge: true }).catch(console.error);
        }
    }, [currentRoom, meKey]);

    const initiateScreenShare = useCallback(async (otherEmail: string) => {
        if (screenPeersRef.current[otherEmail] || !screenStreamRef.current) return;

        try {
            const signalingRef = await addDoc(collection(db, 'voiceSignaling'), {
                from: currentUserEmail,
                to: otherEmail,
                status: 'screen_offer',
                timestamp: serverTimestamp()
            });
            const signalingId = signalingRef.id;
            const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] });

            screenStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, screenStreamRef.current!);
            });

            pc.onicecandidate = (e) => {
                if (e.candidate) {
                    addDoc(collection(db, `voiceSignaling/${signalingId}/iceCandidates`), {
                        candidate: e.candidate.toJSON(),
                        from: currentUserEmail,
                        type: 'screen'
                    });
                }
            };

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            await setDoc(signalingRef, { offer }, { merge: true });

            onSnapshot(signalingRef, async (snap) => {
                const snapData = snap.data();
                if (snapData?.status === 'screen_answered' && snapData.answer) {
                    try { if (pc.signalingState !== 'stable') await pc.setRemoteDescription(new RTCSessionDescription(snapData.answer)); } catch (e) { }
                }
            });

            const iceQuery = query(collection(db, `voiceSignaling/${signalingId}/iceCandidates`), where('from', '!=', currentUserEmail), where('type', '==', 'screen'));
            onSnapshot(iceQuery, (iceSnap) => {
                iceSnap.docChanges().forEach((iceChange) => {
                    if (iceChange.type === 'added') pc.addIceCandidate(new RTCIceCandidate(iceChange.doc.data().candidate)).catch(() => { });
                });
            });

            screenPeersRef.current[otherEmail] = pc;
        } catch (e) { console.error("Screen share error", e); }
    }, [currentUserEmail]);

    const toggleScreenShare = async () => {
        if (isScreenSharing) {
            stopScreenShare();
        } else {
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                screenStreamRef.current = stream;
                setIsScreenSharing(true);
                await setDoc(doc(db, 'voicePresence', meKey), { isScreenSharing: true }, { merge: true });

                stream.getVideoTracks()[0].onended = () => {
                    stopScreenShare();
                };

                const othersQuery = query(collection(db, 'voicePresence'), where('room', '==', currentRoom), where('email', '!=', currentUserEmail));
                const othersSnap = await getDocs(othersQuery);
                othersSnap.forEach((otherDoc) => {
                    initiateScreenShare(otherDoc.data().email);
                });
            } catch (err) {
                console.error("Screen share failed", err);
            }
        }
    };

    const leaveRoom = useCallback(async () => {
        if (!currentRoom) return;

        try {
            // Remove presence
            await deleteDoc(doc(db, 'voicePresence', meKey));

            // Close all peer connections
            Object.values(peersRef.current).forEach((pc: RTCPeerConnection) => pc.close());
            peersRef.current = {};

            // Stop local stream
            localStreamRef.current?.getTracks().forEach(t => t.stop());
            localStreamRef.current = null;

            stopScreenShare();
            setRemoteScreenStreams({});

            if (signalingUnsubRef.current) {
                signalingUnsubRef.current();
                signalingUnsubRef.current = null;
            }

            setRemoteStreams({});
            setCurrentRoom(null);
            setIsMuted(false);
        } catch (err) {
            console.error("Error leaving room:", err);
        }
    }, [currentRoom, meKey, stopScreenShare]);

    useEffect(() => {
        return () => { leaveRoom(); };
    }, [leaveRoom]);

    useEffect(() => {
        if (roomNameOverride) {
            handleRoomSelect(roomNameOverride);
        }
    }, [roomNameOverride]);

    const toggleMute = () => {
        localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
        setIsMuted(prev => !prev);
    };

    const handleRoomSelect = async (roomName: string) => {
        if (currentRoom === roomName) return;
        if (currentRoom) await leaveRoom();

        try {
            console.log("Attempting to join room:", roomName);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStreamRef.current = stream;

            // 1. Set Presence
            await setDoc(doc(db, 'voicePresence', meKey), {
                room: roomName,
                email: currentUserEmail,
                joinedAt: serverTimestamp()
            });

            setCurrentRoom(roomName);
            setIsMuted(false);

            // 2. Clear old signaling data for me
            // (In a real app, you'd want a more robust cleanup)

            // 3. Listen for incoming offers (Signaling)
            const signalingQuery = query(
                collection(db, 'voiceSignaling'),
                where('to', '==', currentUserEmail),
                where('status', 'in', ['offer', 'screen_offer'])
            );

            // Cleanup previous signaling listener if any
            if (signalingUnsubRef.current) signalingUnsubRef.current();

            signalingUnsubRef.current = onSnapshot(signalingQuery, async (snapshot) => {
                snapshot.docChanges().forEach(async (change) => {
                    if (change.type === 'added') {
                        const data = change.doc.data();
                        const signalingId = change.doc.id;

                        if (data.status === 'offer') {
                            const pc = createPeerConnection(data.from, signalingId);
                            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));

                            const answer = await pc.createAnswer();
                            await pc.setLocalDescription(answer);

                            // Update signaling doc with answer
                            await setDoc(doc(db, 'voiceSignaling', signalingId), {
                                answer,
                                status: 'answered'
                            }, { merge: true });

                            // Listen for ICE candidates from remote
                            const iceQuery = query(
                                collection(db, `voiceSignaling/${signalingId}/iceCandidates`),
                                where('from', '!=', currentUserEmail)
                            );
                            onSnapshot(iceQuery, (iceSnap) => {
                                iceSnap.docChanges().forEach((iceChange) => {
                                    if (iceChange.type === 'added') {
                                        const iceData = iceChange.doc.data();
                                        pc.addIceCandidate(new RTCIceCandidate(iceData.candidate));
                                    }
                                });
                            });
                        } else if (data.status === 'screen_offer') {
                            const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] });

                            pc.ontrack = (event) => {
                                setRemoteScreenStreams(prev => ({ ...prev, [data.from]: event.streams[0] }));
                            };

                            pc.onicecandidate = (event) => {
                                if (event.candidate) {
                                    addDoc(collection(db, `voiceSignaling/${signalingId}/iceCandidates`), {
                                        candidate: event.candidate.toJSON(),
                                        from: currentUserEmail,
                                        type: 'screen'
                                    });
                                }
                            };

                            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                            const answer = await pc.createAnswer();
                            await pc.setLocalDescription(answer);

                            await setDoc(doc(db, 'voiceSignaling', signalingId), {
                                answer,
                                status: 'screen_answered'
                            }, { merge: true });

                            const iceQuery = query(collection(db, `voiceSignaling/${signalingId}/iceCandidates`), where('from', '!=', currentUserEmail), where('type', '==', 'screen'));
                            onSnapshot(iceQuery, (iceSnap) => {
                                iceSnap.docChanges().forEach((iceChange) => {
                                    if (iceChange.type === 'added') {
                                        pc.addIceCandidate(new RTCIceCandidate(iceChange.doc.data().candidate)).catch(() => { });
                                    }
                                });
                            });

                            screenPeersRef.current[data.from] = pc;
                        }
                    }
                });
            });

            // 4. Initiate offers to others in the room
            const othersQuery = query(
                collection(db, 'voicePresence'),
                where('room', '==', roomName),
                where('email', '!=', currentUserEmail)
            );

            const othersSnap = await getDocs(othersQuery);
            othersSnap.forEach(async (otherDoc) => {
                const otherEmail = otherDoc.data().email;

                // Avoid double signaling (convention: higher email alphabet initiates)
                if (currentUserEmail > otherEmail) {
                    const signalingRef = await addDoc(collection(db, 'voiceSignaling'), {
                        from: currentUserEmail,
                        to: otherEmail,
                        status: 'offer',
                        timestamp: serverTimestamp()
                    });

                    const signalingId = signalingRef.id;
                    const pc = createPeerConnection(otherEmail, signalingId);

                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);

                    await setDoc(signalingRef, { offer }, { merge: true });

                    // Wait for answer
                    onSnapshot(signalingRef, async (snap) => {
                        const snapData = snap.data();
                        if (snapData?.status === 'answered' && snapData.answer) {
                            await pc.setRemoteDescription(new RTCSessionDescription(snapData.answer));
                        }
                    });

                    // Listen for ICE candidates
                    const iceQuery = query(
                        collection(db, `voiceSignaling/${signalingId}/iceCandidates`),
                        where('from', '!=', currentUserEmail)
                    );
                    onSnapshot(iceQuery, (iceSnap) => {
                        iceSnap.docChanges().forEach((iceChange) => {
                            if (iceChange.type === 'added') {
                                const iceData = iceChange.doc.data();
                                pc.addIceCandidate(new RTCIceCandidate(iceData.candidate));
                            }
                        });
                    });
                }
            });

        } catch (err) {
            console.error("Failed to join voice room:", err);
            alert("Microphone access is required for Voice Chat.");
        }
    };

    // Per-room theming
    const ROOM_THEMES: Record<string, { gradient: string; accent: string; dot: string; border: string; activeBorder: string; }> = {
        'GTA Online': { gradient: 'from-red-500/15 to-red-600/10', accent: 'text-red-300', dot: 'bg-red-400', border: 'border-red-500/10', activeBorder: 'border-red-400/50' },
        'Euro Truck': { gradient: 'from-red-500/15 to-red-600/10', accent: 'text-red-300', dot: 'bg-red-400', border: 'border-red-500/10', activeBorder: 'border-red-400/50' },
        'Call of Duty': { gradient: 'from-red-500/15 to-red-600/10', accent: 'text-red-300', dot: 'bg-red-400', border: 'border-red-500/10', activeBorder: 'border-red-400/50' },
        'Other Games': { gradient: 'from-red-500/15 to-red-600/10', accent: 'text-red-300', dot: 'bg-red-400', border: 'border-red-500/10', activeBorder: 'border-red-400/50' },
    };

    const totalOnline = Object.values(globalRoomState).flat().length;

    return (
        <section className="w-full max-w-5xl mx-auto flex h-[78vh] overflow-hidden rounded-2xl shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #0f0f14 0%, #16101e 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>

            {/* Side Panel */}
            <div className="w-72 flex flex-col flex-shrink-0 border-r border-white/5"
                style={{ background: 'linear-gradient(180deg, #141420 0%, #0e0e18 100%)' }}>

                <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shadow-md">
                        <Volume2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm leading-tight">Voice Channels</h3>
                        <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                            {totalOnline === 0 ? 'Quiet neighborhood' : `${totalOnline} active player${totalOnline !== 1 ? 's' : ''}`}
                        </p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-3 px-3 space-y-2 custom-scrollbar">
                    {ROOMS.map(room => {
                        const theme = ROOM_THEMES[room];
                        const isActive = currentRoom === room;
                        const participants = globalRoomState[room] || [];
                        return (
                            <div key={room}
                                onClick={() => handleRoomSelect(room)}
                                className={`rounded-xl cursor-pointer transition-all duration-300 border overflow-hidden
                                    ${isActive
                                        ? `bg-white/[0.05] ${theme.activeBorder} shadow-md`
                                        : `bg-white/[0.02] ${theme.border} hover:bg-white/[0.05] hover:${theme.activeBorder}`}`}
                            >
                                <div className="flex items-center justify-between px-3 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-1.5 h-1.5 rounded-full ${theme.dot} ${isActive ? 'animate-pulse' : 'opacity-20'}`} />
                                        <span className={`font-bold text-sm tracking-wide ${isActive ? theme.accent : 'text-gray-400'}`}>
                                            {room}
                                        </span>
                                    </div>
                                    {participants.length > 0 && (
                                        <div className={`flex -space-x-2 overflow-hidden`}>
                                            {participants.slice(0, 3).map((email, i) => (
                                                <div key={i} className="w-5 h-5 rounded-full border border-gray-900 bg-gray-800 flex items-center justify-center text-[8px] font-bold text-white">
                                                    {email.charAt(0).toUpperCase()}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {participants.length > 0 && (
                                    <div className="px-3 pb-3 space-y-2 border-t border-white/5 pt-2 bg-black/10">
                                        {participants.map(email => {
                                            const isMe = email === currentUserEmail;
                                            return (
                                                <div key={email} className="flex items-center gap-2.5 group">
                                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold border transition-all
                                                        ${isMe
                                                            ? 'bg-red-600 text-white border-transparent shadow-md'
                                                            : 'bg-white/5 text-gray-400 border-white/5 group-hover:border-white/20'}`}>
                                                        {email.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className={`text-xs truncate max-w-[150px] ${isMe ? 'text-white font-bold' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                                        {email.split('@')[0]}
                                                    </span>
                                                    {isMe && isActive && !isMuted && (
                                                        <div className="flex gap-0.5">
                                                            <div className="w-0.5 h-2 bg-red-500 animate-[bounce_0.8s_infinite]" />
                                                            <div className="w-0.5 h-3 bg-red-500 animate-[bounce_1s_infinite]" />
                                                            <div className="w-0.5 h-2 bg-red-500 animate-[bounce_1.2s_infinite]" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {currentRoom && (() => {
                    const theme = ROOM_THEMES[currentRoom];
                    return (
                        <div className="p-4 border-t border-white/5 bg-black/40 backdrop-blur-sm">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Connected</span>
                                    </div>
                                    <p className={`text-sm font-bold truncate ${theme.accent}`}>{currentRoom}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={toggleMute}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all
                                            ${isMuted
                                                ? 'bg-red-500/20 text-red-500 border border-red-500/40 shadow-md'
                                                : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}`}>
                                        {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                    </button>
                                    <button onClick={leaveRoom}
                                        className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md hover:bg-red-700 transition-all">
                                        <PhoneOff className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-[#0a0a0e]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(120,50,255,0.08),transparent_70%)]" />

                {dbError ? (
                    <div className="relative z-10 flex flex-col items-center text-center px-10 animate-fade-in">
                        <div className="w-24 h-24 rounded-3xl bg-red-500/5 border border-red-500/20 flex items-center justify-center mb-8 shadow-2xl">
                            <WifiOff className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black text-red-500 mb-3 tracking-tight">CONNECTION INTERRUPTED</h2>
                        <p className="text-gray-400 text-base max-w-sm leading-relaxed mb-6">
                            {dbError}
                        </p>
                        <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl font-bold hover:bg-red-500/20 transition-all uppercase text-xs tracking-widest">
                            Retry Connection
                        </button>
                    </div>
                ) : currentRoom ? (() => {
                    const theme = ROOM_THEMES[currentRoom];
                    const participants = globalRoomState[currentRoom] || [];
                    const activeScreenEmail = Object.keys(remoteScreenStreams)[0];
                    const screenToRender = isScreenSharing ? screenStreamRef.current : activeScreenEmail ? remoteScreenStreams[activeScreenEmail] : null;

                    return (
                        <div className="relative z-10 flex flex-col items-center w-full h-full py-6 px-6 animate-fade-in">
                            {/* Header */}
                            <div className="text-center mb-4">
                                <h2 className={`text-3xl font-black mb-2 tracking-tight uppercase italic ${theme.accent}`}>{currentRoom}</h2>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.03] border border-white/10 rounded-full backdrop-blur-md shadow-lg">
                                    <div className={`w-2 h-2 rounded-full ${theme.dot} animate-pulse`} />
                                    <span className="text-xs text-gray-300 font-bold uppercase tracking-wider">
                                        {participants.length} Active Player{participants.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>

                            {/* Main Content Area */}
                            <div className="flex-1 w-full flex flex-col items-center min-h-0">
                                {screenToRender && (
                                    <div className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center p-2 mb-4 animate-[fade-in_0.3s_ease-out] relative group shrink">
                                        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black/50">
                                            <video
                                                autoPlay
                                                playsInline
                                                muted={isScreenSharing}
                                                className="absolute inset-0 w-full h-full object-contain"
                                                ref={el => {
                                                    if (el && el.srcObject !== screenToRender) {
                                                        el.srcObject = screenToRender;
                                                        el.play().catch(e => console.warn("Video auto-play blocked:", e));
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="absolute top-6 left-6 px-3 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider shadow-lg z-20">
                                            {isScreenSharing ? 'Your Screen' : `${activeScreenEmail.split('@')[0]}'s Screen`}
                                        </div>
                                    </div>
                                )}

                                {/* Participants Grid */}
                                <div className={`flex flex-wrap items-center justify-center gap-6 max-w-4xl p-4 shrink-0 overflow-y-auto custom-scrollbar 
                                                ${screenToRender ? 'scale-75 origin-bottom max-h-[150px]' : 'scale-100'}`}>
                                    {/* Local User */}
                                    <div className="flex flex-col items-center gap-3 animate-fade-in text-center relative">
                                        <div className={`relative w-24 h-24 rounded-full border-[3px] ${isMuted ? 'border-red-500/50' : theme.activeBorder} bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-lg z-10`}>
                                            {!isMuted && <AudioWave stream={localStreamRef.current} isMuted={isMuted} activeColor={theme.activeBorder} />}
                                            <span className="text-3xl font-black text-white relative z-10">{currentUserEmail.charAt(0).toUpperCase()}</span>
                                            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#16101e] border border-white/10 flex items-center justify-center z-20 shadow-xl">
                                                {isMuted ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className={`w-4 h-4 ${theme.accent}`} />}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs font-black text-white truncate max-w-[120px]">{currentUserEmail.split('@')[0]}</span>
                                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">You</span>
                                        </div>
                                    </div>

                                    {/* Remote Users */}
                                    {participants.filter(email => email !== currentUserEmail).map(email => (
                                        <div key={email} className="flex flex-col items-center gap-3 animate-fade-in text-center relative">
                                            <div className="relative w-24 h-24 rounded-full border-[3px] border-white/5 bg-white/[0.02] flex items-center justify-center shadow-xl z-10">
                                                {remoteStreams[email] && <AudioWave stream={remoteStreams[email]} isMuted={false} activeColor={theme.activeBorder} />}
                                                <span className="text-3xl font-black text-gray-400 relative z-10">{email.charAt(0).toUpperCase()}</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs font-bold text-gray-300 truncate max-w-[120px]">{email.split('@')[0]}</span>
                                                <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-0.5">Connected</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="mt-4 flex items-center gap-4 bg-black/40 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-2xl shadow-2xl shrink-0">
                                <button onClick={toggleMute}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95
                                         ${isMuted
                                            ? 'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20'
                                            : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 shadow-md'}`}>
                                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>
                                <button onClick={toggleScreenShare}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95
                                         ${isScreenSharing
                                            ? `bg-white/5 ${theme.accent} border ${theme.activeBorder} hover:bg-white/10`
                                            : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 shadow-md'}`}>
                                    {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <MonitorUp className="w-5 h-5" />}
                                </button>
                                <div className="w-px h-8 bg-white/10 mx-2" />
                                <button onClick={leaveRoom}
                                    className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-all duration-300 hover:scale-105 active:scale-95">
                                    <PhoneOff className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Remote Audio Streams */}
                            {Object.entries(remoteStreams).map(([email, stream]) => (
                                <RemoteAudio key={email} email={email} stream={stream} />
                            ))}
                        </div>
                    );
                })() : (
                    <div className="relative z-10 flex flex-col items-center text-center px-10 opacity-60">
                        <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.05] flex items-center justify-center mb-8 shadow-xl relative overflow-hidden group">
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Volume2 className="w-16 h-16 text-gray-700 transition-transform duration-500 group-hover:scale-110 group-hover:text-red-600" />
                        </div>
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mb-3">Communication Hub</p>
                        <h2 className="text-2xl font-black text-white mb-4 tracking-tight">VOICE CHANNELS READY</h2>
                        <p className="text-gray-500 text-base max-w-xs leading-relaxed font-medium">
                            Select an active frequency from the terminal on the left to initiate real-time audio transmission.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default VoiceBox;

