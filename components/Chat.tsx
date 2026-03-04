import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import {
    collection, addDoc, query, where, orderBy,
    onSnapshot, serverTimestamp, or, and, getDocs
} from 'firebase/firestore';
import { Send, Users, MessageSquare, ArrowLeft } from 'lucide-react';
import type { User, FriendRequest, Friendship } from '../types';
import { deleteDoc, doc, setDoc } from 'firebase/firestore';

interface ChatProps {
    currentUser: Omit<User, 'password'>;
    channelId?: string;
    initialMode?: ChatMode;
    hideSidebar?: boolean;
}

interface Message {
    id: string;
    text: string;
    sender: string;
    senderName: string;
    senderUsername?: string;
    senderPhotoURL?: string;
    createdAt: any;
    to?: string;
}

type ChatMode = 'global' | 'direct' | 'channel';

const Chat: React.FC<ChatProps> = ({ currentUser, channelId, initialMode, hideSidebar }) => {
    const [mode, setMode] = useState<ChatMode>(initialMode || (channelId ? 'channel' : 'global'));
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [dmEmail, setDmEmail] = useState('');
    const [activeDmEmail, setActiveDmEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [friends, setFriends] = useState<string[]>([]);
    const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
    const [friendSearchEmail, setFriendSearchEmail] = useState('');
    const [searchResult, setSearchResult] = useState<{ username: string, email: string, photoURL?: string } | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [userMap, setUserMap] = useState<Record<string, { username: string, photoURL?: string }>>({});
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        setLoading(true);
        setMessages([]);
        let q;

        if (channelId) {
            setMode('channel');
            q = query(
                collection(db, `channelMessages/${channelId}/messages`),
                orderBy('createdAt', 'asc')
            );
        } else if (activeDmEmail || mode === 'direct') {
            // Direct messages: where the conversation is between the two users
            if (!activeDmEmail) {
                setLoading(false);
                return;
            }
            // Use a consistent conversationId as a subcollection path to avoid indexing issues
            const conversationId = [currentUser.email, activeDmEmail].sort().join('--');
            q = query(
                collection(db, `directMessages/${conversationId}/messages`),
                orderBy('createdAt', 'asc')
            );
        } else if (mode === 'global') {
            q = query(
                collection(db, 'globalChat'),
                orderBy('createdAt', 'asc')
            );
        } else {
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs: Message[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Message));
            setMessages(msgs);
            setLoading(false);
        }, (error) => {
            console.error("Firestore error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [mode, activeDmEmail, currentUser.email]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = newMessage.trim();
        if (!text) return;

        const payload: any = {
            text,
            sender: currentUser.email,
            senderName: currentUser.name,
            senderUsername: currentUser.username,
            senderPhotoURL: currentUser.photoURL,
            createdAt: serverTimestamp(),
        };

        if (mode === 'channel' && channelId) {
            await addDoc(collection(db, `channelMessages/${channelId}/messages`), payload);
        } else if (mode === 'direct' && activeDmEmail) {
            payload.to = activeDmEmail;
            const conversationId = [currentUser.email, activeDmEmail].sort().join('--');
            await addDoc(collection(db, `directMessages/${conversationId}/messages`), payload);
        } else if (mode === 'global') {
            await addDoc(collection(db, 'globalChat'), payload);
        }
        setNewMessage('');
    };

    const startDm = () => {
        const email = dmEmail.trim().toLowerCase();
        if (!email || email === currentUser.email) return;
        setActiveDmEmail(email);
        setDmEmail('');
    };

    // Friend System Logic
    useEffect(() => {
        if (!currentUser.email) return;

        // Fetch Friendships
        const fq = query(
            collection(db, 'friendships'),
            where('users', 'array-contains', currentUser.email)
        );
        const unsubFriends = onSnapshot(fq, (snapshot) => {
            const friendEmails = snapshot.docs.map(doc => {
                const data = doc.data() as Friendship;
                return data.users.find(u => u !== currentUser.email) || '';
            }).filter(u => u !== '');
            setFriends(friendEmails);
        });

        // Fetch Pending Requests
        const rq = query(
            collection(db, 'friendRequests'),
            where('to', '==', currentUser.email),
            where('status', '==', 'pending')
        );
        const unsubRequests = onSnapshot(rq, (snapshot) => {
            const requests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as FriendRequest));
            setPendingRequests(requests);
        });

        return () => {
            unsubFriends();
            unsubRequests();
        };
    }, [currentUser.email]);

    // Mark current DM as read
    useEffect(() => {
        if (mode === 'direct' && activeDmEmail && currentUser.uid) {
            const conversationId = [currentUser.email, activeDmEmail].sort().join('--');
            setDoc(doc(db, `conversations/${conversationId}/metadata`, currentUser.uid), {
                lastRead: serverTimestamp()
            }, { merge: true });
        }
    }, [mode, activeDmEmail, currentUser.uid, currentUser.email]);

    // Track unread messages for all friends
    useEffect(() => {
        if (friends.length === 0 || !currentUser.uid) return;

        const unsubscribes: (() => void)[] = [];
        const msgUnsubs: Record<string, () => void> = {};

        friends.forEach(friendEmail => {
            const conversationId = [currentUser.email, friendEmail].sort().join('--');

            // Listen for user's lastRead
            const unsubMeta = onSnapshot(doc(db, `conversations/${conversationId}/metadata`, currentUser.uid), (snap) => {
                const lastRead = snap.data()?.lastRead?.toDate() || new Date(0);

                // Cleanup previous message listener for this friend
                if (msgUnsubs[friendEmail]) {
                    msgUnsubs[friendEmail]();
                }

                // Listen for messages after lastRead
                const mq = query(
                    collection(db, `directMessages/${conversationId}/messages`),
                    where('createdAt', '>', lastRead),
                    where('sender', '!=', currentUser.email)
                );

                msgUnsubs[friendEmail] = onSnapshot(mq, (msgSnap) => {
                    setUnreadCounts(prev => ({
                        ...prev,
                        [friendEmail]: msgSnap.size
                    }));
                });
            });
            unsubscribes.push(unsubMeta);
        });

        return () => {
            unsubscribes.forEach(unsub => unsub());
            Object.values(msgUnsubs).forEach(unsub => unsub());
        };
    }, [friends, currentUser.uid, currentUser.email]);

    // Fetch User metadata (usernames/photos) for friends
    useEffect(() => {
        if (friends.length === 0) return;

        const q = query(
            collection(db, 'users'),
            where('email', 'in', friends)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const map: Record<string, { username: string, photoURL?: string }> = {};
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                map[data.email] = {
                    username: data.username,
                    photoURL: data.photoURL
                };
            });
            setUserMap(prev => ({ ...prev, ...map }));
        });

        return () => unsub();
    }, [friends]);

    // Live User Search Logic
    useEffect(() => {
        const queryText = friendSearchEmail.trim();
        if (!queryText || queryText === currentUser.username) {
            setSearchResult(null);
            setIsSearching(false);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setIsSearching(true);
            try {
                const uq = query(
                    collection(db, 'users'),
                    where('usernameLower', '==', queryText.toLowerCase())
                );
                const snapshot = await getDocs(uq);
                if (!snapshot.empty) {
                    const data = snapshot.docs[0].data();
                    setSearchResult({
                        username: data.username,
                        email: data.email,
                        photoURL: data.photoURL
                    });
                } else {
                    setSearchResult(null);
                }
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setIsSearching(false);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [friendSearchEmail, currentUser.username]);

    const sendFriendRequest = async () => {
        const target = searchResult;
        if (!target) return;

        if (target.email === currentUser.email) {
            alert('You cannot add yourself!');
            return;
        }

        try {
            // Check if already friends
            if (friends.includes(target.email)) {
                alert('You are already friends!');
                return;
            }

            // Send request
            await addDoc(collection(db, 'friendRequests'), {
                from: currentUser.email,
                fromName: currentUser.username,
                to: target.email,
                toName: target.username,
                status: 'pending',
                timestamp: serverTimestamp()
            });
            setFriendSearchEmail('');
            setSearchResult(null);
            alert(`Friend request sent to ${target.username}!`);
        } catch (error) {
            console.error("Error sending friend request:", error);
            alert('Failed to send request.');
        }
    };

    const handleFriendRequest = async (request: FriendRequest, accept: boolean) => {
        try {
            if (accept) {
                // Update request status
                await setDoc(doc(db, 'friendRequests', request.id), {
                    ...request,
                    status: 'accepted'
                });

                // Create friendship
                await addDoc(collection(db, 'friendships'), {
                    users: [currentUser.email, request.from],
                    timestamp: serverTimestamp()
                });
            } else {
                // Deny/Delete request
                await deleteDoc(doc(db, 'friendRequests', request.id));
            }
        } catch (error) {
            console.error("Error handling friend request:", error);
        }
    };

    const formatTime = (ts: any) => {
        if (!ts?.toDate) return '';
        return ts.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <section className="bg-[#121214]/80 rounded-xl border border-white/5 w-full max-w-4xl mx-auto flex h-[75vh] overflow-hidden shadow-2xl">
            {/* Sidebar */}
            {!hideSidebar && (
                <div className="w-56 bg-[#1a1a1e] flex flex-col border-r border-white/5 flex-shrink-0">
                    <div className="p-4 border-b border-white/5">
                        <h3 className="font-bold text-white text-sm tracking-widest uppercase">Chat</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">

                        {/* Friend Requests Section */}
                        {pendingRequests.length > 0 && (
                            <div className="px-1 mb-4">
                                <p className="px-2 text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </span>
                                    Pending Requests
                                </p>
                                {pendingRequests.map(req => (
                                    <div key={req.id} className="bg-black/20 rounded p-2 text-xs mb-1">
                                        <p className="text-gray-300 font-bold truncate mb-1">{req.fromName || req.from}</p>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleFriendRequest(req, true)}
                                                className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded py-0.5 hover:bg-red-500/30 transition-colors"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleFriendRequest(req, false)}
                                                className="flex-1 bg-white/5 text-gray-500 border border-white/10 rounded py-0.5 hover:bg-white/10 transition-colors"
                                            >
                                                Hide
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Friends List */}
                        <div className="pb-1">
                            <p className="px-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Friends</p>
                        </div>
                        {friends.length === 0 ? (
                            <p className="px-3 text-[10px] text-gray-500 italic">No friends yet</p>
                        ) : (
                            friends.map(email => (
                                <button
                                    key={email}
                                    onClick={() => { setMode('direct'); setActiveDmEmail(email); }}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors
                                      ${activeDmEmail === email ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
                                >
                                    <div className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                        {userMap[email]?.photoURL ? (
                                            <img src={userMap[email]?.photoURL} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <span className="text-[10px] font-bold text-red-400 capitalize">
                                                {(userMap[email]?.username || email).charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <span className="truncate flex-1 text-left">{userMap[email]?.username || email.split('@')[0]}</span>
                                    {unreadCounts[email] > 0 && (
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white animate-in zoom-in duration-300">
                                            {unreadCounts[email]}
                                        </span>
                                    )}
                                </button>
                            ))
                        )}

                        <div className="pt-4 pb-1 mt-auto">
                            <p className="px-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">Find Friends</p>
                            <div className="px-1 space-y-2">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={friendSearchEmail}
                                        onChange={e => setFriendSearchEmail(e.target.value)}
                                        placeholder="Enter username..."
                                        className="w-full bg-black/30 border border-white/10 rounded px-2 py-1.5 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-red-500/50"
                                    />
                                    {isSearching && (
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                            <div className="w-3 h-3 border border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>

                                {searchResult ? (
                                    <div className="p-2 bg-red-500/10 border border-red-500/20 rounded flex items-center gap-2 animate-in fade-in duration-300">
                                        <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center overflow-hidden">
                                            {searchResult.photoURL ? (
                                                <img src={searchResult.photoURL} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <span className="text-[10px] font-bold text-red-400 capitalize">{searchResult.username.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-bold text-white truncate">{searchResult.username}</p>
                                        </div>
                                        <button
                                            onClick={sendFriendRequest}
                                            className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-[9px] font-black uppercase rounded transition-colors whitespace-nowrap"
                                        >
                                            Add
                                        </button>
                                    </div>
                                ) : friendSearchEmail.trim() && !isSearching && (
                                    <p className="text-[9px] text-gray-600 px-1 italic">User not found...</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {mode === 'direct' ? (
                            <>
                                <button onClick={() => { setMode('global'); }} className="text-gray-500 hover:text-white transition-colors">
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                                <MessageSquare className="w-4 h-4 text-red-400" />
                                <span className="font-bold text-white text-sm">
                                    {activeDmEmail ? (userMap[activeDmEmail]?.username || activeDmEmail.split('@')[0]) : 'Direct Message'}
                                </span>
                            </>
                        ) : (
                            <>
                                <div className="relative">
                                    <Users className="w-4 h-4 text-red-400" />
                                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </span>
                                </div>
                                <span className="font-bold text-white text-sm">Community Chat</span>
                            </>
                        )}
                    </div>
                    {mode === 'global' && (
                        <div className="bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live community</span>
                        </div>
                    )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                            <MessageSquare className="w-12 h-12 text-gray-600 mb-3" />
                            <p className="text-gray-500 text-sm">No messages yet. Say hello!</p>
                        </div>
                    ) : (
                        messages.map(msg => {
                            const isMe = msg.sender === currentUser.email;
                            return (
                                <div key={msg.id} className={`flex items-start gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className="w-7 h-7 rounded-full bg-red-500/20 border border-red-500/30 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                        {msg.senderPhotoURL ? (
                                            <img src={msg.senderPhotoURL} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <span className="text-[10px] font-bold text-red-400 capitalize">
                                                {(msg.senderName || msg.sender).charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                        <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <span className="text-xs font-bold text-gray-300">
                                                {isMe ? 'You' : (msg.senderName || msg.sender.split('@')[0])}
                                                {msg.senderUsername && (
                                                    <span className="text-[10px] text-gray-500 ml-1 font-normal opacity-70">@{msg.senderUsername}</span>
                                                )}
                                            </span>
                                            <span className="text-[10px] text-gray-600">{formatTime(msg.createdAt)}</span>
                                        </div>
                                        <div className={`px-3 py-2 rounded-xl text-sm ${isMe
                                            ? 'bg-red-500/20 border border-red-500/20 text-white rounded-tr-sm'
                                            : 'bg-white/5 border border-white/5 text-gray-300 rounded-tl-sm'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                {(mode === 'global' || activeDmEmail) && (
                    <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-black/20 flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            placeholder={mode === 'global' ? 'Message the community...' : `Message ${activeDmEmail?.split('@')[0]}...`}
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="p-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex-shrink-0"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
};

export default Chat;

