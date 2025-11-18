import React, { useState } from 'react';
import NeonButton from './common/NeonButton';
import type { GameRequest } from '../types';

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-3xl font-bold text-pink-400 tracking-widest uppercase mb-8 relative pb-4 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-24 after:h-1 after:bg-pink-500 after:shadow-[0_0_10px_theme(colors.pink.500)]">
        {children}
    </h2>
);

interface RequestGamesProps {
    userEmail: string;
}

const RequestGames: React.FC<RequestGamesProps> = ({ userEmail }) => {
  const [gameTitle, setGameTitle] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const getGameRequests = (): GameRequest[] => {
    const requests = localStorage.getItem('gameRequests');
    if (!requests) return [];
    try {
        return JSON.parse(requests);
    } catch (error) {
        console.error("Failed to parse gameRequests from localStorage:", error);
        localStorage.removeItem('gameRequests');
        return [];
    }
  };

  const saveGameRequests = (requests: GameRequest[]) => {
    localStorage.setItem('gameRequests', JSON.stringify(requests));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameTitle) {
      const requests = getGameRequests();
      const newRequest: GameRequest = {
        id: Date.now(),
        userEmail,
        gameTitle,
        timestamp: new Date().toISOString(),
        status: 'pending',
      };
      saveGameRequests([...requests, newRequest]);

      setSubmitted(true);
      setGameTitle('');
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <section className="bg-gray-800/50 p-6 sm:p-8 rounded-lg border border-pink-500/30 h-full flex flex-col w-full max-w-2xl mx-auto">
      <SectionHeader>Request a Game</SectionHeader>
      <p className="text-gray-400 mb-6">Can't find what you're looking for? Let us know!</p>
      {submitted ? (
        <div className="flex-grow flex items-center justify-center text-center text-green-400">
          <p>Thanks! Your request has been submitted and is now pending approval.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 flex-grow flex flex-col">
          <div className="flex-grow">
            <label htmlFor="gameTitle" className="block text-purple-300 text-sm font-bold mb-2">
              Game Title
            </label>
            <input
              id="gameTitle"
              type="text"
              value={gameTitle}
              onChange={(e) => setGameTitle(e.target.value)}
              placeholder="e.g., Starfield 2"
              className="w-full px-4 py-3 bg-gray-900/70 border-2 border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
            />
          </div>
          <NeonButton type="submit" color="pink">
            Submit Request
          </NeonButton>
        </form>
      )}
    </section>
  );
};

export default RequestGames;
