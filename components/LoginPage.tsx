
import React, { useState, useEffect } from 'react';
import NeonButton from './common/NeonButton';
import UserIcon from './icons/UserIcon';
import LockIcon from './icons/LockIcon';
import LogoIcon from './icons/LogoIcon';
import CalendarIcon from './icons/CalendarIcon'; // New icon
import type { User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onSignupSuccess: (user: User) => void;
}

const ADMIN_EMAIL = 'rafaproject06@gmail.com';

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onSignupSuccess }) => {
  // Common state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  
  // Login state
  const [identifier, setIdentifier] = useState(''); // Can be username or email

  // Signup state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState(''); // Also used for 'forgot password'

  // Forgot password state
  const [resetEmailSent, setResetEmailSent] = useState(false);

  useEffect(() => {
    setError('');
    setResetEmailSent(false);
  }, [mode]);
  
  const getUsers = (): User[] => {
    try {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    } catch (error) {
        console.error("Failed to parse users from localStorage:", error);
        return [];
    }
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
        console.log('Password reset requested for:', email);
        setResetEmailSent(true);
        setError('');
        return;
    }

    if (mode === 'signup') {
        if (!name || !username || !dob || !email || !password || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        const users = getUsers();
        if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
            setError('An account with this email already exists.');
            return;
        }
        if (users.some(user => user.username.toLowerCase() === username.toLowerCase())) {
            setError('This username is already taken.');
            return;
        }
        const newUser: User = { name, username, dob, email, password };
        saveUsers([...users, newUser]);
        console.log('Account created for:', email);
        setError('');
        onSignupSuccess(newUser); // Trigger the T&C flow
        return;
    }

    // Login mode
    if (!identifier || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    if (identifier.toLowerCase() === ADMIN_EMAIL) {
        console.log('Admin logged in');
        setError('');
        const adminUser: User = {
            name: 'Admin',
            username: 'admin',
            dob: 'N/A',
            email: ADMIN_EMAIL,
            password: '', // Password not checked for admin in this simplified version
        };
        onLoginSuccess(adminUser);
        return;
    }

    const users = getUsers();
    const user = users.find(u => 
        (u.email.toLowerCase() === identifier.toLowerCase() || u.username.toLowerCase() === identifier.toLowerCase())
    );

    if (!user || user.password !== password) {
      setError('Invalid username/email or password.');
      return;
    }
    console.log('Logged in as:', user.email);
    setError('');
    onLoginSuccess(user);
  };
  
  const isLogin = mode === 'login';
  const isSignup = mode === 'signup';

  const renderMainForm = () => (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {isLogin && (
            <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400">
                <UserIcon className="w-5 h-5" />
            </span>
            <input
                type="text"
                placeholder="Username or Email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border-2 border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
            />
            </div>
        )}

        {isSignup && (
            <>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400"><UserIcon className="w-5 h-5" /></span>
                    <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border-2 border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300" />
                </div>
                 <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400"><UserIcon className="w-5 h-5" /></span>
                    <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border-2 border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300" />
                </div>
                 <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400"><CalendarIcon className="w-5 h-5" /></span>
                    <input type="date" placeholder="Date of Birth" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border-2 border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300" />
                </div>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400"><UserIcon className="w-5 h-5" /></span>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border-2 border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300" />
                </div>
            </>
        )}
        
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="relative bg-gray-900/50 backdrop-blur-sm border-2 border-cyan-500/50 rounded-2xl shadow-[0_0_20px_theme(colors.cyan.500/50%)] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-grid-purple-500/[0.2] [mask-image:linear-gradient(to_bottom,white,transparent,transparent)]"></div>
            <div className="p-6 sm:p-8 md:p-12 relative z-10">
              <div className="flex justify-center mb-6 sm:mb-8">
                <LogoIcon className="w-32 sm:w-48 h-auto" />
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