
import React, { useState, useEffect } from 'react';
import NeonButton from './common/NeonButton';
import type { OnlineFixRequest } from '../types';

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-3xl font-bold text-purple-400 tracking-widest uppercase mb-8 relative pb-4 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-24 after:h-1 after:bg-purple-500 after:shadow-[0_0_10px_theme(colors.purple.500)]">
        {children}
    </h2>
);

interface OnlineFixProps {
    userEmail: string;
}

const RequestForm: React.FC<{ userEmail: string; onSubmitted: () => void }> = ({ userEmail, onSubmitted }) => {
    const [gameTitle, setGameTitle] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const getOnlineFixRequests = (): OnlineFixRequest[] => {
        const requests = localStorage.getItem('onlineFixRequests');
        if (!requests) return [];
        try {
            return JSON.parse(requests);
        } catch (error) {
            console.error("Failed to parse onlineFixRequests from localStorage:", error);
            localStorage.removeItem('onlineFixRequests');
            return [];
        }
    };

    const saveOnlineFixRequests = (requests: OnlineFixRequest[]) => {
        localStorage.setItem('onlineFixRequests', JSON.stringify(requests));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (gameTitle) {
            const requests = getOnlineFixRequests();
            const newRequest: OnlineFixRequest = {
                id: Date.now(),
                userEmail,
                gameTitle,
                timestamp: new Date().toISOString(),
                status: 'pending',
            };
            saveOnlineFixRequests([...requests, newRequest]);

            setSubmitted(true);
            setGameTitle('');
            setTimeout(() => {
                setSubmitted(false);
                onSubmitted();
            }, 3000);
        }
    };

    if (submitted) {
        return (
            <div className="flex-grow flex items-center justify-center text-center text-green-400 p-8 bg-gray-900/50 rounded-lg">
                <p>Thanks! Your request for an online fix has been submitted.</p>
            </div>
        );
    }

    return (
        <div className="mt-12">
            <h3 className="text-2xl font-bold text-center text-white mb-4">Request an Online Fix</h3>
            <p className="text-gray-400 mb-6 text-center">Can't find the fix you need? Let us know!</p>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
                <div>
                    <label htmlFor="gameTitleFix" className="block text-purple-300 text-sm font-bold mb-2">
                        Game Title
                    </label>
                    <input
                        id="gameTitleFix"
                        type="text"
                        value={gameTitle}
                        onChange={(e) => setGameTitle(e.target.value)}
                        placeholder="e.g., Elden Ring"
                        className="w-full px-4 py-3 bg-gray-900/70 border-2 border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                    />
                </div>
                <NeonButton type="submit" color="purple" fullWidth>
                    Submit Request
                </NeonButton>
            </form>
        </div>
    );
};


const OnlineFix: React.FC<OnlineFixProps> = ({ userEmail }) => {
  const [approvedFixes, setApprovedFixes] = useState<OnlineFixRequest[]>([]);

  useEffect(() => {
    try {
        const allRequests: OnlineFixRequest[] = JSON.parse(localStorage.getItem('onlineFixRequests') || '[]');
        const filteredFixes = allRequests.filter(req => req.status === 'approved' && req.fileUrl && req.imageUrl);
        setApprovedFixes(filteredFixes);
    } catch (error) {
        console.error("Failed to parse onlineFixRequests from localStorage:", error);
        localStorage.removeItem('onlineFixRequests');
        setApprovedFixes([]);
    }
  }, []);

  const handleRequestSubmitted = () => {
    // This function can be used to show a global notification in the future
    console.log("Online fix request submitted");
  };

  return (
    <section className="w-full max-w-7xl mx-auto">
      <SectionHeader>Available Online Fixes</SectionHeader>
      {approvedFixes.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {approvedFixes.map(fix => (
            <div key={fix.id} className="group relative aspect-[3/4] overflow-hidden rounded-lg shadow-lg transition-all duration-300 transform hover:-translate-y-2 bg-gray-900">
                <img 
                    src={fix.imageUrl} 
                    alt={fix.gameTitle} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-30 group-hover:opacity-50" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-400 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:shadow-[0_0_15px_theme(colors.purple.400)]"></div>
                <div className="relative h-full flex flex-col justify-end text-white p-3 md:p-4">
                     <h3 className="font-bold text-base md:text-lg leading-tight truncate mb-4">{fix.gameTitle}</h3>
                     {fix.fileUrl && fix.fileName && (
                        <a href={fix.fileUrl} download={fix.fileName} className="block">
                            <NeonButton size="sm" fullWidth color="purple">Download</NeonButton>
                        </a>
                     )}
                </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800/30 rounded-lg">
            <p className="text-gray-400 text-lg">No online fixes are available yet.</p>
        </div>
      )}
      <div className="my-12 h-px bg-purple-500/30 w-full"></div>
      <RequestForm userEmail={userEmail} onSubmitted={handleRequestSubmitted} />
    </section>
  );
};

export default OnlineFix;
