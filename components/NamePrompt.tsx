import React, { useState, useEffect, useRef } from 'react';
import NeonButton from './common/NeonButton';
import UserIcon from './icons/UserIcon';
import LogoIcon from './icons/LogoIcon';

interface NamePromptProps {
  onNameSubmit: (name: string) => void;
}

const NamePrompt: React.FC<NamePromptProps> = ({ onNameSubmit }) => {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNameSubmit(name.trim());
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center bg-transparent p-4 animate-fade-in"
    >
      <div className="absolute top-8">
        <LogoIcon className="h-12 w-auto" />
      </div>
      <div
        className="relative bg-gray-900/80 backdrop-blur-sm border-2 border-purple-500/50 rounded-2xl shadow-[0_0_20px_theme(colors.purple.500/50%)] w-full max-w-md"
      >
        <div className="p-6 sm:p-8 text-center">
            <h1 
                className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-white mb-2"
                style={{ textShadow: '0 0 8px rgba(192, 132, 252, 0.9), 0 0 20px rgba(192, 132, 252, 0.7)' }}
              >
                Welcome to the Nexus
            </h1>
          
          <p className="text-gray-300 mb-6">
            Please enter your name to join the community.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400/50" />
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name or Nickname"
                className="w-full pl-12 pr-4 py-3 bg-gray-900/70 border-2 border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
              />
            </div>

            <NeonButton type="submit" color="purple" fullWidth disabled={!name.trim()}>
              Continue
            </NeonButton>
          </form>
        </div>
      </div>
       <footer className="absolute bottom-8 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Tylock Games. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default NamePrompt;
