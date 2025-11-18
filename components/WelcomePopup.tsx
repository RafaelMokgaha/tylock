
import React from 'react';
import NeonButton from './common/NeonButton';

interface WelcomePopupProps {
  onClose: () => void;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-gray-900/80 backdrop-blur-sm border-2 border-pink-500/50 rounded-2xl shadow-[0_0_20px_theme(colors.pink.500/50%)] w-full max-w-lg transform transition-all duration-300 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-pink-400 mb-2 tracking-wider">
            Congratulations!
          </h2>
          <p className="text-lg text-white mb-4">Welcome to our gaming community!</p>
          
          <p className="text-gray-300 mb-6">
            You now have access to our exclusive game library and can request your favorite games. Our team will review your requests and provide download files through your Library and Inbox.
          </p>

          <div className="text-left bg-black/20 p-4 rounded-lg border border-purple-500/20">
            <h3 className="font-bold text-purple-300 text-lg mb-3">Getting Started:</h3>
            <ul className="space-y-2 text-gray-300 list-disc list-inside">
              <li>Submit game requests via the home page.</li>
              <li>Check your <strong>Library</strong> for approved game downloads.</li>
              <li>Check your <strong>Inbox</strong> for notifications from the admin.</li>
              <li>Join our Discord for support (link in the Help section).</li>
            </ul>
          </div>

          <div className="mt-8">
            <NeonButton color="pink" onClick={onClose}>
              Let's Go!
            </NeonButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;
