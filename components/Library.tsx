
import React, { useState, useEffect } from 'react';
import type { User, GameRequest } from '../types';
import NeonButton from './common/NeonButton';

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-3xl font-bold text-red-400 tracking-widest uppercase mb-8 relative pb-4 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-24 after:h-1 after:bg-red-500">
    {children}
  </h2>
);

const StatusBadge: React.FC<{ status: 'pending' | 'approved' }> = ({ status }) => {
  const isApproved = status === 'approved';
  const baseClasses = 'px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-[0.2em]';
  const colorClasses = isApproved
    ? 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-md'
    : 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-md';

  return (
    <span className={`${baseClasses} ${colorClasses} animate-pulse`}>
      {status}
    </span>
  );
};

interface LibraryProps {
  currentUser: Omit<User, 'password'>;
}

import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

const Library: React.FC<LibraryProps> = ({ currentUser }) => {
  const [userRequests, setUserRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'gameRequests'),
      where('userEmail', '==', currentUser.email),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserRequests(requests);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error in Library:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser.email]);

  return (
    <section className="w-full max-w-5xl mx-auto animate-fade-in">
      <SectionHeader>Library</SectionHeader>
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
        </div>
      ) : userRequests.length > 0 ? (
        <div className="space-y-4">
          {userRequests.map(request => (
            <div key={request.id} className="bg-[#121214]/60 backdrop-blur-xl border border-white/5 p-6 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-6 transition-all hover:border-red-500/40 group">
              <div className="flex-grow space-y-1">
                <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-red-400 transition-colors">{request.gameTitle}</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                  Requested on {request.timestamp?.toDate ? new Date(request.timestamp.toDate()).toLocaleDateString() : '...'}
                </p>
              </div>
              <div className="flex-shrink-0 self-end sm:self-center">
                {request.status === 'approved' && request.fileUrl && request.fileName ? (
                  <a href={request.fileUrl} download={request.fileName}>
                    <NeonButton color="cyan" size="sm">Download Now</NeonButton>
                  </a>
                ) : (
                  <StatusBadge status={request.status} />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#121214]/60 backdrop-blur-xl border border-white/5 rounded-3xl">
          <p className="text-gray-500 text-lg">Your library is currently empty. Start hunting!</p>
          <p className="text-white/20 text-xs font-bold uppercase tracking-widest mt-4">Use the "Request Game" button above</p>
        </div>
      )}
    </section>
  );
};

export default Library;
