
import React, { useState, useEffect } from 'react';
import type { GameRequest } from '../types';
import NeonButton from './common/NeonButton';

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-3xl md:text-4xl font-bold text-cyan-400 tracking-widest uppercase mb-8 relative pb-4 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-24 after:h-1 after:bg-cyan-500 after:shadow-[0_0_10px_theme(colors.cyan.500)]">
        {children}
    </h2>
);

const AvailableGames: React.FC = () => {
  const [approvedGames, setApprovedGames] = useState<GameRequest[]>([]);

  useEffect(() => {
    let allRequests: GameRequest[] = [];
    try {
        allRequests = JSON.parse(localStorage.getItem('gameRequests') || '[]');
    } catch (error) {
        console.error("Failed to parse game requests from localStorage:", error);
    }
    const filteredGames = allRequests.filter(req => req.status === 'approved' && req.fileUrl);
    setApprovedGames(filteredGames);
  }, []);

  return (
    <section>
      <SectionHeader>Available Games</SectionHeader>
      {approvedGames.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {approvedGames.map(game => (
            <div key={game.id} className="group relative aspect-[3/4] overflow-hidden rounded-lg shadow-lg transition-all duration-300 transform hover:-translate-y-2 bg-gray-900">
                <img 
                    src={`https://picsum.photos/seed/${game.id}/600/800`} 
                    alt={game.gameTitle} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-30 group-hover:opacity-50" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-400 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:shadow-[0_0_15px_theme(colors.cyan.400)]"></div>
                <div className="relative h-full flex flex-col justify-end text-white p-3 md:p-4">
                     <h3 className="font-bold text-base md:text-lg leading-tight truncate mb-4">{game.gameTitle}</h3>
                     {game.fileUrl && game.fileName && (
                        <a href={game.fileUrl} download={game.fileName} className="block">
                            <NeonButton size="sm" fullWidth color="cyan">Download</NeonButton>
                        </a>
                     )}
                </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800/30 rounded-lg">
            <p className="text-gray-400 text-lg">No games are available for download yet.</p>
            <p className="text-gray-500 text-sm mt-2">Check back later!</p>
        </div>
      )}
    </section>
  );
};

export default AvailableGames;