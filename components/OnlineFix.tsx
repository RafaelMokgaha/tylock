import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import NeonButton from './common/NeonButton';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, orderBy } from 'firebase/firestore';

interface OnlineFixProps {
    userEmail: string;
}

const RequestForm: React.FC<{ userEmail: string; onSubmitted: () => void }> = ({ userEmail, onSubmitted }) => {
    const [gameTitle, setGameTitle] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const title = gameTitle.trim();
        if (!title) return;

        setLoading(true);
        try {
            await addDoc(collection(db, 'onlineFixRequests'), {
                userEmail,
                gameTitle: title,
                timestamp: serverTimestamp(),
                status: 'pending',
            });

            setSubmitted(true);
            setGameTitle('');
            setTimeout(() => {
                setSubmitted(false);
                onSubmitted();
            }, 3000);
        } catch (error) {
            console.error("Failed to submit online fix request:", error);
            alert("Failed to submit request.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-12 bg-red-500/10 rounded-2xl border border-red-500/20 animate-fade-in mt-12">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <Plus className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Request Successful!</h3>
                <p className="text-gray-400">Thanks! Your request for an online fix has been submitted.</p>
            </div>
        );
    }

    return (
        <div className="mt-20 bg-[#121214]/60 backdrop-blur-xl border border-white/5 p-10 rounded-3xl max-w-2xl mx-auto shadow-2xl">
            <h3 className="text-2xl font-bold text-center text-white mb-2">Request an Online Fix</h3>
            <p className="text-gray-500 mb-8 text-center">Can't find the fix you need? Let our team know!</p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <label htmlFor="gameTitleFix" className="text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1">
                        Game Title
                    </label>
                    <input
                        id="gameTitleFix"
                        type="text"
                        required
                        disabled={loading}
                        value={gameTitle}
                        onChange={(e) => setGameTitle(e.target.value)}
                        placeholder="e.g., Elden Ring"
                        className="w-full px-4 py-4 bg-[#1a1a1e] border border-white/5 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all font-bold text-lg disabled:opacity-50"
                    />
                </div>
                <NeonButton type="submit" color="red" fullWidth disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Fix Request'}
                </NeonButton>
            </form>
        </div>
    );
};

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-3xl font-bold text-red-400 tracking-widest uppercase mb-8 relative pb-4 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-24 after:h-1 after:bg-red-500">
        {children}
    </h2>
);

const OnlineFix: React.FC<OnlineFixProps> = ({ userEmail }) => {
    const [approvedFixes, setApprovedFixes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, 'onlineFixRequests'),
            where('status', '==', 'approved'),
            orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fixes = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setApprovedFixes(fixes.filter((f: any) => f.fileUrl && f.imageUrl));
            setLoading(false);
        }, (error) => {
            console.error("Firestore error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleRequestSubmitted = () => {
        console.log("Online fix request submitted");
    };

    return (
        <section className="w-full max-w-7xl mx-auto animate-fade-in">
            <SectionHeader>Available Online Fixes</SectionHeader>
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : approvedFixes.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {approvedFixes.map(fix => (
                        <div key={fix.id} className="group relative aspect-[3/4] overflow-hidden rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-[#121214]">
                            <img
                                src={fix.imageUrl}
                                alt={fix.gameTitle}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-60 group-hover:opacity-80"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                            <div className="absolute inset-0 border-2 border-transparent group-hover:border-red-500 rounded-xl transition-all duration-300"></div>
                            <div className="relative h-full flex flex-col justify-end text-white p-6">
                                <h3 className="font-bold text-lg leading-tight mb-4">{fix.gameTitle}</h3>
                                {fix.fileUrl && fix.fileName && (
                                    <a href={fix.fileUrl} download={fix.fileName} className="block">
                                        <NeonButton size="sm" fullWidth color="red">Download Fix</NeonButton>
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-[#121214]/40 rounded-3xl border border-white/5">
                    <p className="text-gray-500 text-lg">No approved fixes available yet.</p>
                </div>
            )}
            <div className="my-16 h-px bg-white/5 w-full"></div>
            <RequestForm userEmail={userEmail} onSubmitted={handleRequestSubmitted} />
        </section>
    );
};

export default OnlineFix;


