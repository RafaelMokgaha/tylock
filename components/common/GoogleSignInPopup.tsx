import React from 'react';
import UserIcon from '../icons/UserIcon';
import type { User } from '../../types';

interface GoogleSignInPopupProps {
  onClose: () => void;
  onLoginSuccess: (user: { email: string; role: 'user' | 'admin' }) => void;
}

const dummyUsers = [
  { name: 'Alex Ryder', email: 'alex.ryder@example.com' },
  { name: 'NeonGamer77', email: 'neongamer77@example.com' },
  { name: 'CyberPlayerX', email: 'cyberplayerx@example.com' },
];

const GoogleSignInPopup: React.FC<GoogleSignInPopupProps> = ({ onClose, onLoginSuccess }) => {
    
  const getUsers = (): User[] => {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  };

  const saveUsers = (users: User[]) => {
    localStorage.setItem('users', JSON.stringify(users));
  };

  const handleUserSelect = (selectedUser: { name: string; email: string }) => {
    const users = getUsers();
    const userExists = users.find(user => user.email.toLowerCase() === selectedUser.email.toLowerCase());

    if (!userExists) {
        // If user doesn't exist, create a new account for them
        // FIX: The User type requires properties `name`, `username`, `dob`, and `password`. Added these with sensible defaults for a Google Sign-In user.
        const newUser: User = {
            name: selectedUser.name,
            username: selectedUser.email.split('@')[0],
            dob: '',
            email: selectedUser.email,
            password: '', // No password needed for Google Sign-In
        };
        saveUsers([...users, newUser]);
        console.log('New account created via Google Sign-In for:', selectedUser.email);
    } else {
        console.log('Logged in via Google Sign-In as:', selectedUser.email);
    }
    
    onLoginSuccess({ email: selectedUser.email, role: 'user' });
    onClose();
  };

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="bg-gray-900 border-2 border-cyan-500/50 rounded-2xl shadow-[0_0_20px_theme(colors.cyan.500/50%)] w-full max-w-sm m-4 transform transition-all duration-300 animate-slide-up"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the popup
      >
        <div className="p-8">
          <h2 className="text-2xl font-bold text-center text-white mb-2">Sign in with Google</h2>
          <p className="text-center text-gray-400 mb-6 text-sm">Choose an account to continue</p>
          <div className="space-y-3">
            {dummyUsers.map((user) => (
              <button 
                key={user.email} 
                onClick={() => handleUserSelect(user)}
                className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/50 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/30 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-purple-300"/>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-white">{user.name}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
              </button>
            ))}
          </div>
           <div className="mt-8 text-center">
                <button
                onClick={onClose}
                className="text-sm text-gray-400 hover:text-cyan-400 transition-colors"
                >
                Cancel
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleSignInPopup;