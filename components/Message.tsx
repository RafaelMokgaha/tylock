import React, { useState, useEffect, useRef } from 'react';
import { Send, ShieldCheck, Clock, HelpCircle, FileText, User, Activity, CheckCircle2, Trash2 } from 'lucide-react';
import { db } from '../lib/firebase';
import {
    collection, addDoc, query, where, onSnapshot,
    serverTimestamp, orderBy, or
} from 'firebase/firestore';

interface MessageProps {
    userEmail: string;
}

const ADMIN_EMAIL = 'admin226@gmail.com';

const Message: React.FC<MessageProps> = ({ userEmail }) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Generate a stable ticket ID from email for querying
    const stableTicketId = userEmail ? `TCK-${userEmail.replace(/[@.]/g, '-')}` : null;
    const displayTicketId = `TK-${userEmail ? userEmail.split('@')[0].toUpperCase() : 'GUEST'}-${Math.floor(Date.now() / 1000000)}`;

    useEffect(() => {
        if (!userEmail || !stableTicketId) return;

        // Using a single field for query to avoid complex 'or' assertions in some Firestore SDK versions
        const q = query(
            collection(db, 'helpMessages'),
            where('ticketId', '==', stableTicketId),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);
            setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }, (err) => {
            console.error('Help chat snapshot error:', err);
            setSendError('Failed to load messages. Please check your connection.');
        });

        return () => unsubscribe();
    }, [userEmail, stableTicketId]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const content = newMessage.trim();
        if (!content || !userEmail || !stableTicketId) {
            if (!userEmail) setSendError('You must be logged in to send messages.');
            return;
        }
        setLoading(true);
        setSendError(null);
        try {
            console.log('Sending message from:', userEmail, 'Ticket:', stableTicketId);
            await addDoc(collection(db, 'helpMessages'), {
                from: userEmail,
                to: ADMIN_EMAIL,
                ticketId: stableTicketId,
                content,
                timestamp: serverTimestamp(),
                isRead: false,
            });
            setNewMessage('');
        } catch (err: any) {
            console.error('Send failed details:', err);
            setSendError(`Failed to send: ${err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (ts: any) =>
        ts?.toDate ? ts.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...';

    const formatDate = (ts: any) =>
        ts?.toDate ? ts.toDate().toLocaleDateString() : 'Today';

    return (
        <div className="w-full h-full flex flex-col lg:flex-row bg-[#080808] border border-red-900/20 rounded-2xl overflow-hidden shadow-2xl"
            style={{ height: 'calc(100vh - 160px)', minHeight: '600px' }}>

            {/* ── Left Sidebar (Case Info) ── */}
            <div className="w-full lg:w-72 bg-[#0c0c0c] border-r border-red-900/10 p-6 flex flex-col gap-8 flex-shrink-0">
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-white font-black text-sm uppercase tracking-wider">Support Portal</h2>
                            <p className="text-[10px] text-red-500 font-bold tracking-[0.2em] uppercase">Security Hub</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-3 bg-red-900/5 border border-red-900/20 rounded-xl">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Case ID</span>
                                <span className="text-white font-bold text-sm tracking-widest">{displayTicketId}</span>
                            </div>
                        </div>

                        <div className="space-y-3 px-1">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                    <Activity className="w-3 h-3 text-red-500" /> Status
                                </span>
                                <span className="text-[10px] bg-red-900/40 text-red-400 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Active</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                    <User className="w-3 h-3 text-red-500" /> Agent
                                </span>
                                <span className="text-[10px] text-gray-300 font-bold">Admin Specialist</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-red-900/10">
                    <div className="flex items-center gap-3 p-4 bg-black/40 rounded-2xl border border-white/5">
                        <HelpCircle className="w-5 h-5 text-red-500" />
                        <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                            Our support team is available 24/7. Describe your issue in detail.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Main Chat Area ── */}
            <div className="flex-1 flex flex-col bg-[#050505]">
                {/* Header Strip */}
                <div className="px-6 py-4 border-b border-red-900/10 bg-[#0a0a0a] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-red-500" />
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Case Discussion</h3>
                    </div>
                    <div className="flex items-center gap-2 opacity-60">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Encrypted Session</span>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-6 p-12 text-center">
                            <div className="w-24 h-24 rounded-3xl bg-red-900/5 border border-red-900/10 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent" />
                                <ShieldCheck className="w-10 h-10 text-red-700 relative z-10" />
                            </div>
                            <div className="max-w-xs">
                                <p className="text-white font-black text-lg uppercase tracking-tight mb-2">Initialize Contact</p>
                                <p className="text-gray-500 text-sm">Submit your query below to begin the official support process.</p>
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, idx) => {
                            const isUser = msg.from === userEmail;
                            const showDate = idx === 0 || formatDate(messages[idx - 1]?.timestamp) !== formatDate(msg.timestamp);

                            return (
                                <div key={msg.id} className="space-y-4">
                                    {showDate && (
                                        <div className="flex items-center justify-center">
                                            <span className="px-4 py-1 bg-white/5 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                                                {formatDate(msg.timestamp)}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`flex-shrink-0 mt-1 ${isUser ? 'hidden md:block' : ''}`}>
                                            {isUser ? (
                                                <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center font-bold text-gray-400">
                                                    {userEmail.charAt(0).toUpperCase()}
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-900/30">
                                                    <ShieldCheck className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>

                                        <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
                                            <div className={`flex items-center gap-2 mb-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${isUser ? 'text-gray-500' : 'text-red-500'}`}>
                                                    {isUser ? 'Authorized User' : 'System Administrator'}
                                                </span>
                                                {!isUser && <CheckCircle2 className="w-3 h-3 text-red-500" />}
                                                <span className="text-[10px] text-gray-700 font-bold">{formatTime(msg.timestamp)}</span>
                                            </div>

                                            <div className={`px-5 py-3.5 text-sm leading-relaxed ${isUser
                                                ? 'bg-[#151515] text-gray-200 border border-white/5 rounded-2xl rounded-tr-sm'
                                                : 'bg-red-900/10 text-white border border-red-900/20 rounded-2xl rounded-tl-sm'
                                                }`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* Error Display */}
                {sendError && (
                    <div className="mx-6 mb-4 p-3 bg-red-950/30 border border-red-500/30 rounded-xl flex items-center justify-between text-xs text-red-400 font-bold uppercase tracking-wider animate-shake">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                            {sendError}
                        </div>
                        <button
                            onClick={() => setSendError(null)}
                            className="hover:text-white transition-colors p-1"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Input */}
                <form
                    onSubmit={handleSend}
                    className="p-6 bg-[#0a0a0a] border-t border-red-900/10"
                >
                    <div className="flex gap-4 items-center bg-[#111111] border border-red-900/10 rounded-2xl p-2 pl-5 focus-within:border-red-600/30 transition-all shadow-inner">
                        <input
                            type="text"
                            value={newMessage}
                            disabled={loading}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your official support request..."
                            className="flex-1 bg-transparent py-4 text-white text-sm placeholder-gray-600 focus:outline-none"
                        />
                        <button
                            type="submit"
                            disabled={loading || !newMessage.trim()}
                            className="w-14 h-14 bg-red-600 hover:bg-red-500 disabled:opacity-20 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-red-900/20 active:scale-95 flex-shrink-0"
                        >
                            <Send className="w-5 h-5 shadow-sm" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Message;

