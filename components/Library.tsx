
import React, { useState, useEffect } from 'react';
import type { User, GameRequest } from '../types';
import NeonButton from './common/NeonButton';

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-3xl md:text-4xl font-bold text-yellow-400 tracking-widest uppercase mb-8 relative pb-4 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-24 after:h-1 after:bg-yellow-500 after:shadow-[0_0_10px_theme(colors.yellow.500)]">
        {children}
    </h2>
);

const StatusBadge: React.FC<{ status: 'pending' | 'approved' }> = ({ status }) => {
    const isApproved = status === 'approved';
    const baseClasses = 'px-3 py-1 text-sm font-bold rounded-full uppercase tracking-wider';
    const colorClasses = isApproved 
        ? 'bg-green-500/20 text-green-400' 
        : 'bg-yellow-500/20 text-yellow-400';

    return (
        <span className={`${baseClasses} ${colorClasses}`}>
            {status}
        </span>
    );
};

interface LibraryProps {
  currentUser: Omit<User, 'password'>;
}

const Library: React.FC<LibraryProps> = ({ currentUser }) => {
  const [userRequests, setUserRequests] = useState<GameRequest[]>([]);

  useEffect(() => {
    let allRequests: GameRequest[] = [];
    try {
        allRequests = JSON.parse(localStorage.getItem('gameRequests') || '[]');
    } catch (error) {
        console.error("Failed to parse game requests from localStorage:", error);
    }
    const filteredRequests = allRequests
      .filter(req => req.userEmail === currentUser.email)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setUserRequests(filteredRequests);
  }, [currentUser.email]);

  return (
    <section className="w-full max-w-4xl mx-auto">
      <SectionHeader>My Game Requests</SectionHeader>
      {userRequests.length > 0 ? (
        <div className="space-y-4">
            {userRequests.map(request => (
                <div key={request.id} className="bg-gray-800/50 p-4 rounded-lg border border-purple-500/20 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all hover:border-purple-500/50">
                    <div className="flex-grow">
                        <h3 className="text-xl font-semibold text-white">{request.gameTitle}</h3>
                        <p className="text-sm text-gray-400">Requested on {new Date(request.timestamp).toLocaleDateString()}</p>
                    </div>
                    <div className="flex-shrink-0 self-end sm:self-center">
                        {request.status === 'approved' && request.fileUrl && request.fileName ? (
                            <a href={request.fileUrl} download={request.fileName}>
                                <NeonButton color="green" size="sm">Download</NeonButton>
                            </a>
                        ) : (
                             <StatusBadge status={request.status} />
                        )}
                    </div>
                </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800/30 rounded-lg">
            <p className="text-gray-400 text-lg">You haven't requested any games yet.</p>
            <p className="text-gray-500 text-sm mt-2">Use the "Request Game" button on the home page to add one!</p>
        </div>
      )}
    </section>
  );
};

export default Library;