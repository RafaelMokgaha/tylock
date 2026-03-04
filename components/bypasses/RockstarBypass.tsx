import React, { useState, useEffect } from 'react';
import NeonButton from '../common/NeonButton';
import { db } from '../../lib/firebase';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, orderBy } from 'firebase/firestore';

interface RockstarBypassProps {
  userEmail: string;
}

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-3xl font-bold text-red-400 tracking-widest uppercase mb-8 relative pb-4 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-24 after:h-1 after:bg-red-500">
    {children}
  </h2>
);

const RockstarBypass: React.FC<RockstarBypassProps> = ({ userEmail }) => {
  const [gameTitle, setGameTitle] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [approvedBypasses, setApprovedBypasses] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'bypassRequests'),
      where('status', '==', 'approved'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allBypasses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      const filtered = allBypasses.filter((req: any) =>
        req.fileUrl &&
        req.imageUrl &&
        req.gameTitle.startsWith('Rockstar Bypass:')
      );
      setApprovedBypasses(filtered);
      setFetching(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setFetching(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = gameTitle.trim();
    if (!title) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'bypassRequests'), {
        userEmail,
        gameTitle: `Rockstar Bypass: ${title}`,
        timestamp: serverTimestamp(),
        status: 'pending',
      });

      setSubmitted(true);
      setGameTitle('');
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error("Failed to submit Rockstar bypass request:", error);
      alert("Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto">
      <SectionHeader>Available Rockstar Bypasses</SectionHeader>

      {fetching ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : approvedBypasses.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {approvedBypasses.map(bypass => (
            <div key={bypass.id} className="group relative aspect-[3/4] overflow-hidden rounded-lg shadow-lg transition-all duration-300 transform hover:-translate-y-2 bg-gray-900">
              <img
                src={bypass.imageUrl}
                alt={bypass.gameTitle}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-30 group-hover:opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-red-400 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-md"></div>
              <div className="relative h-full flex flex-col justify-end text-white p-3 md:p-4">
                <h3 className="font-bold text-base md:text-lg leading-tight truncate mb-4">{bypass.gameTitle.replace('Rockstar Bypass: ', '')}</h3>
                {bypass.fileUrl && bypass.fileName && (
                  <a href={bypass.fileUrl} download={bypass.fileName} className="block">
                    <NeonButton size="sm" fullWidth color="purple">Download</NeonButton>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800/30 rounded-lg">
          <p className="text-gray-400 text-lg">No Rockstar bypasses are available for download yet.</p>
        </div>
      )}

      <div className="my-12 h-px bg-red-500/30 w-full"></div>

      <div className="bg-gray-800/50 p-6 sm:p-8 rounded-lg border border-red-500/30 w-full max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold text-center text-white mb-4">Request a New Rockstar Bypass</h3>
        <p className="text-gray-400 mb-6 text-center">Need a bypass for a Rockstar game? Let us know.</p>
        {submitted ? (
          <div className="flex-grow flex items-center justify-center text-center text-red-400 p-8">
            <p>Thanks! Your request for a Rockstar bypass has been submitted.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="gameTitle" className="block text-red-300 text-sm font-bold mb-2">
                Rockstar Game Title
              </label>
              <input
                id="gameTitle"
                type="text"
                required
                disabled={loading}
                value={gameTitle}
                onChange={(e) => setGameTitle(e.target.value)}
                placeholder="e.g., Grand Theft Auto VI"
                className="w-full px-4 py-3 bg-gray-900/70 border-2 border-red-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 disabled:opacity-50"
              />
            </div>
            <NeonButton type="submit" color="purple" fullWidth disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Bypass Request'}
            </NeonButton>
          </form>
        )}
      </div>
    </section>
  );
};

export default RockstarBypass;

