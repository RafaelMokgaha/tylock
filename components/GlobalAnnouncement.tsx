import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { Megaphone, X, Bell, AlertTriangle, Info } from 'lucide-react';

const GlobalAnnouncement: React.FC = () => {
    const [announcement, setAnnouncement] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, 'announcements')
            // Removed compound query requiring composite index to prevent silent failures
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                // Get all active announcements
                const activeAnnouncements = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() } as any))
                    .filter(ann => ann.active === true);

                // Sort by timestamp descending
                activeAnnouncements.sort((a, b) => {
                    const timeA = a.timestamp?.toMillis() || 0;
                    const timeB = b.timestamp?.toMillis() || 0;
                    return timeB - timeA; // Descending
                });

                if (activeAnnouncements.length > 0) {
                    setAnnouncement(activeAnnouncements[0]);
                    setIsVisible(true);
                } else {
                    setAnnouncement(null);
                }
            } else {
                setAnnouncement(null);
            }
        }, (error) => {
            console.error("Error fetching announcements:", error);
        });

        return () => unsubscribe();
    }, []);

    if (!announcement || !isVisible) return null;

    const bgColor = announcement.type === 'critical' ? 'bg-red-600/90' : announcement.type === 'warning' ? 'bg-red-600/90' : 'bg-red-600/90';
    const Icon = announcement.type === 'critical' ? AlertTriangle : announcement.type === 'warning' ? Bell : Info;

    return (
        <div className={`relative w-full ${bgColor} backdrop-blur-md px-4 py-3 flex items-center justify-center gap-3 text-white font-bold text-sm md:text-base z-[100] border-b border-white/10 shadow-lg animate-in slide-in-from-top duration-500`}>
            <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 animate-pulse" />
                <span className="tracking-wide">{announcement.content}</span>
            </div>
            <button
                onClick={() => setIsVisible(false)}
                className="absolute right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Close Announcement"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default GlobalAnnouncement;

