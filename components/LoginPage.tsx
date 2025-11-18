import React, { useState, useEffect } from 'react';
import NeonButton from './common/NeonButton';
import UserIcon from './icons/UserIcon';
import LockIcon from './icons/LockIcon';
import LogoIcon from './icons/LogoIcon';
import GoogleIcon from './icons/GoogleIcon'; // Import Google Icon
import GoogleSignInPopup from './common/GoogleSignInPopup'; // Import Popup
import type { User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: { email: string; role: 'user' | 'admin' }) => void;
}

const ADMIN_EMAIL = 'rafaproject06@gmail.com';

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isGooglePopupOpen, setGooglePopupOpen] = useState(false); // State for popup

  useEffect(() => {
    setError('');
    setResetEmailSent(false);
  }, [mode]);
  
  const getUsers = (): User[] => {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  };

  const saveUsers = (users: User[]) => {
    localStorage.setItem('users', JSON.stringify(users));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'forgot') {
        if (!email) {
            setError('Please enter your email address.');
            return;
        }
        // In a real app, this would trigger a password reset email.
        console.log('Password reset requested for:', email);
        setResetEmailSent(true);
        setError('');
        return;
    }

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    if (email.toLowerCase() === ADMIN_EMAIL && mode === 'login') {
        // This is a simplified admin login check. In a real app, password would be verified.
        console.log('Admin logged in');
        setError('');
        onLoginSuccess({ email, role: 'admin' });
        return;
    }

    const users = getUsers();
    const userExists = users.find(user => user.email.toLowerCase() === email.toLowerCase());

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (userExists) {
        setError('An account with this email already exists.');
        return;
      }
      const newUser: User = { email, password }; // In real app, hash password
      saveUsers([...users, newUser]);
      console.log('Account created for:', email);
      setError('');
      onLoginSuccess({ email, role: 'user' });

    } else { // Login mode
      if (!userExists || userExists.password !== password) {
        setError('Invalid email or password.');
        return;
      }
      console.log('Logged in as:', email);
      setError('');
      onLoginSuccess({ email, role: 'user' });
    }
  };
  
  const isLogin = mode === 'login';
  const isSignup = mode === 'signup';

  const renderMainForm = () => (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400">
            <UserIcon className="w-5 h-5" />
          </span>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border-2 border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
          />
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400">
            <LockIcon className="w-5 h-5" />
          </span>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border-2 border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
          />
        </div>
        
        {isSignup && (
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400">
              <LockIcon className="w-5 h-5" />
              </span>
              <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border-2 border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
              />
          </div>
        )}

        {isLogin && (
            <div className="text-right -mt-4">
                <button type="button" onClick={() => setMode('forgot')} className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                    Forgot Password?
                </button>
            </div>
        )}

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <NeonButton type="submit" fullWidth color="cyan">
          {isLogin ? 'Log In' : 'Create Account'}
        </NeonButton>
      </form>

      <div className="my-6 flex items-center">
        <div className="flex-grow border-t border-gray-600"></div>
        <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
        <div className="flex-grow border-t border-gray-600"></div>
      </div>

      <button
        type="button"
        onClick={() => setGooglePopupOpen(true)}
        className="w-full flex justify-center items-center gap-3 px-6 py-3 bg-white/90 hover:bg-white text-gray-800 font-semibold rounded-md transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
      >
        <GoogleIcon className="w-6 h-6" />
        <span>Sign in with Google</span>
      </button>

      <div className="mt-6 text-center">
        <button
          onClick={() => setMode(isLogin ? 'signup' : 'login')}
          className="text-sm text-gray-400 hover:text-cyan-400 transition-colors"
        >
          {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
        </button>
      </div>
    </>
  );

  const renderForgotPassword = () => (
    <>
       <h2 className="text-2xl font-bold text-center text-cyan-400 mb-2">Reset Password</h2>
       <p className="text-center text-gray-400 mb-6">Enter your email to receive a reset link.</p>
       {resetEmailSent ? (
        <div className="text-center text-green-400 p-4 bg-green-500/10 rounded-lg">
            <p>If an account exists for {email}, you will receive a password reset link shortly.</p>
        </div>
       ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400">
                <UserIcon className="w-5 h-5" />
            </span>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border-2 border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
            />
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <NeonButton type="submit" fullWidth color="cyan">
                Send Reset Link
            </NeonButton>
        </form>
       )}
       <div className="mt-6 text-center">
        <button
          onClick={() => setMode('login')}
          className="text-sm text-gray-400 hover:text-cyan-400 transition-colors"
        >
          Back to Login
        </button>
      </div>
    </>
  );

  return (
    <>
      {isGooglePopupOpen && (
        <GoogleSignInPopup
          onClose={() => setGooglePopupOpen(false)}
          onLoginSuccess={onLoginSuccess}
        />
      )}
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="relative bg-gray-900/50 backdrop-blur-sm border-2 border-cyan-500/50 rounded-2xl shadow-[0_0_20px_theme(colors.cyan.500/50%)] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-grid-purple-500/[0.2] [mask-image:linear-gradient(to_bottom,white,transparent,transparent)]"></div>
            <div className="p-8 md:p-12 relative z-10">
              <div className="flex justify-center mb-8">
                <LogoIcon className="w-48 h-auto" />
              </div>
              {mode === 'forgot' ? renderForgotPassword() : renderMainForm()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
