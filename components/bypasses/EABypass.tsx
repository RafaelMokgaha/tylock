import React, { useState, useEffect } from 'react';
import NeonButton from '../common/NeonButton';
import type { BypassRequest } from '../../types';

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-3xl font-bold text-pink-400 tracking-widest uppercase mb-8 relative pb-4 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-24 after:h-1 after:bg-pink-500 after:shadow-[0_0_10px_theme(colors.pink.500)]">
        {children}
    </h2>
);

interface EABypassProps {
    userEmail: string;
}

const EABypass: React.FC<EABypassProps> = ({ userEmail }) => {
  const [gameTitle, setGameTitle] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [approvedBypasses, setApprovedBypasses] = useState<BypassRequest[]>([]);

  const getBypassRequests = (): BypassRequest[] => {
    try {
        const requests = localStorage.getItem('bypassRequests');
        return requests ? JSON.parse(requests) : [];
    } catch (error) {
        console.error("Failed to parse bypass requests from localStorage:", error);
        return [];
    }
  };

  useEffect(() => {
    const allRequests = getBypassRequests();
    const filtered = allRequests.filter(req => 
      req.status === 'approved' && 
      req.fileUrl && 
      req.imageUrl &&
      req.gameTitle.startsWith('EA Bypass:')
    );
    setApprovedBypasses(filtered);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameTitle) {
      const requests = getBypassRequests();
      const newRequest: BypassRequest = {
        id: Date.now(),
        userEmail,
        gameTitle: `EA Bypass: ${gameTitle}`,
        timestamp: new Date().toISOString(),
        status: 'pending',
      };
      localStorage.setItem('bypassRequests', JSON.stringify([...requests, newRequest]));

      setSubmitted(true);
      setGameTitle('');
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto">
      <SectionHeader>Available EA Bypasses</SectionHeader>
      
      {approvedBypasses.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {approvedBypasses.map(bypass => (
            <div key={bypass.id} className="group relative aspect-[3/4] overflow-hidden rounded-lg shadow-lg transition-all duration-300 transform hover:-translate-y-2 bg-gray-900">
                <img 
                    src={bypass.imageUrl} 
                    alt={bypass.gameTitle} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-30 group-hover:opacity-50" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-pink-400 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:shadow-[0_0_15px_theme(colors.pink.400)]"></div>
                <div className="relative h-full flex flex-col justify-end text-white p-3 md:p-4">
                     <h3 className="font-bold text-base md:text-lg leading-tight truncate mb-4">{bypass.gameTitle.replace('EA Bypass: ', '')}</h3>
                     {bypass.fileUrl && bypass.fileName && (
                        <a href={bypass.fileUrl} download={bypass.fileName} className="block">
                            <NeonButton size="sm" fullWidth color="pink">Download</NeonButton>
                        </a>
                     )}
                </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800/30 rounded-lg">
            <p className="text-gray-400 text-lg">No EA bypasses are available for download yet.</p>
        </div>
      )}

      <div className="my-12 h-px bg-pink-500/30 w-full"></div>

      <div className="bg-gray-800/50 p-6 sm:p-8 rounded-lg border border-pink-500/30 w-full max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold text-center text-white mb-4">Request a New EA Bypass</h3>
        <p className="text-gray-400 mb-6 text-center">Need a bypass for an EA game? Let us know.</p>
        {submitted ? (
          <div className="flex-grow flex items-center justify-center text-center text-green-400 p-8">
            <p>Thanks! Your request for an EA bypass has been submitted.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="gameTitle" className="block text-pink-300 text-sm font-bold mb-2">
                EA Game Title
              </label>
              <input
                id="gameTitle"
                type="text"
                value={gameTitle}
                onChange={(e) => setGameTitle(e.target.value)}
                placeholder="e.g., Battlefield 2042"
                className="w-full px-4 py-3 bg-gray-900/70 border-2 border-pink-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-300"
              />
            </div>
            <NeonButton type="submit" color="pink" fullWidth>
              Submit Bypass Request
            </NeonButton>
          </form>
        )}
      </div>
    </section>
  );
};

export default EABypass;