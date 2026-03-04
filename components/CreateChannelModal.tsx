import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { X, Hash, Volume2, Plus, Loader2 } from 'lucide-react';

interface CreateChannelModalProps {
    onClose: () => void;
    userEmail: string;
}

const CreateChannelModal: React.FC<CreateChannelModalProps> = ({ onClose, userEmail }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<'text' | 'voice'>('text');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            await addDoc(collection(db, 'channels'), {
                name: name.trim(),
                type,
                createdBy: userEmail,
                timestamp: serverTimestamp()
            });
            onClose();
        } catch (error: any) {
            console.error("Error creating channel:", error);
            alert(`Failed to create channel: ${error.message || "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-nexus-card border border-nexus-border rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tight flex items-center gap-3">
                    <Plus className="w-6 h-6 text-accent" /> Create Channel
                </h2>
                <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Channel Type</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setType('text')}
                            className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${type === 'text' ? 'bg-accent/10 border-accent text-accent' : 'bg-black/20 border-white/5 text-gray-500 hover:border-white/10'}`}
                        >
                            <Hash className="w-6 h-6" />
                            <span className="text-xs font-bold uppercase">Text</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('voice')}
                            className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${type === 'voice' ? 'bg-accent/10 border-accent text-accent' : 'bg-black/20 border-white/5 text-gray-500 hover:border-white/10'}`}
                        >
                            <Volume2 className="w-6 h-6" />
                            <span className="text-xs font-bold uppercase">Voice</span>
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Channel Name</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                            placeholder="new-channel"
                            maxLength={20}
                            className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-5 py-4 text-white font-bold focus:border-accent/50 outline-none transition-all"
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600">
                            {type === 'text' ? <Hash className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </div>
                    </div>
                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest ml-1">Lowercase, no spaces, max 20 chars</p>
                </div>

                <button
                    type="submit"
                    disabled={loading || !name.trim()}
                    className="w-full py-4 bg-accent text-black font-black text-lg italic uppercase tracking-tighter rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-accent/20 hover:shadow-accent/40 transition-all disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Initialize Channel</span>}
                </button>
            </form>
        </div>
    );
};

export default CreateChannelModal;
