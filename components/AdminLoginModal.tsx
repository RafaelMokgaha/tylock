
import React, { useState, useEffect, useRef } from 'react';
import NeonButton from './common/NeonButton';
import LockIcon from './icons/LockIcon';

interface AdminLoginModalProps {
  onClose: () => void;
  onSubmit: (code: string) => void;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onClose, onSubmit }) => {
  const [code, setCode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the input field when the modal opens
    inputRef.current?.focus();

    // Handle Escape key press
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onSubmit(code.trim());
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative bg-gray-900/80 backdrop-blur-sm border-2 border-cyan-500/50 rounded-2xl shadow-[0_0_20px_theme(colors.cyan.500/50%)] w-full max-w-md transform transition-all duration-300 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400 tracking-wider">
              Admin Access
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <p className="text-gray-300 mb-6">
            Please enter the admin access code or email to proceed.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400/50" />
              <input
                ref={inputRef}
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Access Code or Email"
                className="w-full pl-12 pr-4 py-3 bg-gray-900/70 border-2 border-cyan-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
              />
            </div>

            <NeonButton type="submit" color="cyan" fullWidth>
              Login
            </NeonButton>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginModal;
