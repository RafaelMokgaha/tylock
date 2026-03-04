import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { Megaphone, AlertTriangle, Info, Bell } from 'lucide-react';

const AnnouncementsView: React.FC = () => {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'announcements'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const activeAnnouncements = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as any))
                .filter(ann => ann.active === true);

            // Sort by descending timestamp
            activeAnnouncements.sort((a, b) => {
                const timeA = a.timestamp?.toMillis() || 0;
                const timeB = b.timestamp?.toMillis() || 0;
                return timeB - timeA;
            });

            setAnnouncements(activeAnnouncements);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching announcements:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <h2 className="text-3xl font-bold text-red-400 tracking-widest uppercase mb-8 relative pb-4 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-24 after:h-1 after:bg-red-500">
            {children}
        </h2>
    );

    return (
        <section className="w-full max-w-7xl mx-auto animate-fade-in">
            <SectionHeader>Announcements</SectionHeader>
            <p className="text-gray-400 mb-8">Stay updated with the latest news, updates, and maintenance schedules from the Tylock Team.</p>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : announcements.length > 0 ? (
                <div className="space-y-4">
                    {announcements.map((ann) => {
                        const Icon = ann.type === 'critical' ? AlertTriangle : ann.type === 'warning' ? Bell : Info;
                        const bgColor = ann.type === 'critical' ? 'bg-red-500/10' : ann.type === 'warning' ? 'bg-red-500/10' : 'bg-red-500/10';
                        const borderColor = ann.type === 'critical' ? 'border-red-500/30' : ann.type === 'warning' ? 'border-red-500/30' : 'border-red-500/30';
                        const textColor = ann.type === 'critical' ? 'text-red-400' : ann.type === 'warning' ? 'text-red-400' : 'text-red-400';
                        const iconBg = ann.type === 'critical' ? 'bg-red-500/20' : ann.type === 'warning' ? 'bg-red-500/20' : 'bg-red-500/20';

                        return (
                            <div key={ann.id} className={`p-6 rounded-2xl border ${borderColor} ${bgColor} flex gap-5 items-start transition-all duration-300 hover:scale-[1.01]`}>
                                <div className={`p-3 rounded-xl ${iconBg} ${textColor} shrink-0`}>
                                    <Icon className="w-8 h-8" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className={`font-bold uppercase tracking-wider ${textColor}`}>
                                            {ann.type === 'critical' ? 'CRITICAL UPDATE' : ann.type === 'warning' ? 'WARNING' : 'INFORMATION'}
                                        </h3>
                                        <span className="text-xs font-bold text-gray-500 bg-black/30 px-2 py-1 rounded-md">
                                            {ann.timestamp?.toDate ? ann.timestamp.toDate().toLocaleDateString() : 'Just now'}
                                        </span>
                                    </div>
                                    <p className="text-gray-200 text-lg leading-relaxed">{ann.content}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20 bg-[#121214]/60 backdrop-blur-xl rounded-3xl border border-white/5">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 mb-6">
                        <Megaphone className="w-10 h-10 text-red-500/50" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No active announcements</h3>
                    <p className="text-gray-500 text-lg">Check back later for updates and news.</p>
                </div>
            )}
        </section>
    );
};

export default AnnouncementsView;

