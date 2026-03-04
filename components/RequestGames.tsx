import React, { useState } from 'react';
import { Gamepad2, Plus } from 'lucide-react';
import NeonButton from './common/NeonButton';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface RequestGamesProps {
  userEmail: string;
}

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-3xl font-bold text-red-400 tracking-widest uppercase mb-8 relative pb-4 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-24 after:h-1 after:bg-red-500">
    {children}
  </h2>
);

const RequestGames: React.FC<RequestGamesProps> = ({ userEmail }) => {
  const [gameTitle, setGameTitle] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = gameTitle.trim();
    if (!title) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'gameRequests'), {
        userEmail,
        gameTitle: title,
        timestamp: serverTimestamp(),
        status: 'pending',
      });

      setSubmitted(true);
      setGameTitle('');
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error("Failed to submit game request:", error);
      alert("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#121214]/60 backdrop-blur-xl border border-white/5 p-6 sm:p-10 flex flex-col w-full max-w-3xl mx-auto animate-fade-in shadow-2xl rounded-3xl">
      <SectionHeader>Request a Game</SectionHeader>
      <p className="text-gray-400 mb-8">Can't find what you're looking for? Let us know!</p>

      {submitted ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-12 bg-red-500/10 rounded-2xl border border-red-500/20">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Request Received!</h3>
          <p className="text-gray-400">Our team has been notified. We'll check the vaults for your request.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 flex-grow flex flex-col">
          <div className="space-y-4">
            <label htmlFor="gameTitle" className="text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1">
              Game Title
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-red-500 transition-colors">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <input
                id="gameTitle"
                type="text"
                required
                disabled={loading}
                value={gameTitle}
                onChange={(e) => setGameTitle(e.target.value)}
                placeholder="e.g., Grand Theft Auto VI"
                className="w-full pl-14 pr-6 py-4 bg-[#1a1a1e] border border-white/5 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all font-bold text-lg disabled:opacity-50"
              />
            </div>
          </div>
          <NeonButton type="submit" color="red" size="md" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </NeonButton>
        </form>
      )}
    </section>
  );
};

export default RequestGames;


