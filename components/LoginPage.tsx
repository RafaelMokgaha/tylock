import React, { useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { LogIn, UserPlus, Mail, Lock, User, ArrowRight, Chrome } from 'lucide-react';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            // Sync to Firestore users collection
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                username: user.displayName || user.email?.split('@')[0] || 'user',
                usernameLower: (user.displayName || user.email?.split('@')[0] || 'user').toLowerCase(),
                email: user.email?.toLowerCase() || '',
                displayName: user.displayName || '',
                photoURL: user.photoURL || '',
                updatedAt: serverTimestamp()
            }, { merge: true });
            onLoginSuccess();
        } catch (err: any) {
            console.error("Google Auth error:", err);
            if (err.code === 'auth/unauthorized-domain') {
                setError("This domain is not authorized. Please add 'localhost' to your Firebase Console -> Auth -> Settings -> Authorized Domains.");
            } else {
                setError(err.message || "Google authentication failed.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let user;
            if (isLogin) {
                const result = await signInWithEmailAndPassword(auth, email, password);
                user = result.user;
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // Update display name with username
                await updateProfile(userCredential.user, {
                    displayName: username
                });
                user = userCredential.user;
                // Sync to Firestore users collection
                await setDoc(doc(db, 'users', user.uid), {
                    uid: user.uid,
                    username: username,
                    usernameLower: username.toLowerCase(),
                    email: email.toLowerCase(),
                    displayName: username,
                    photoURL: user.photoURL || '',
                    updatedAt: serverTimestamp()
                });
            }
            onLoginSuccess();
        } catch (err: any) {
            console.error("Auth error:", err);
            setError(err.message || "An error occurred during authentication.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] p-4 font-sans overflow-hidden relative">
            {/* Animated Background Elements */}

            <div className="w-full max-w-[450px] relative z-10">
                <div className="bg-[#121214]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-xl">
                    {/* Logo/Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-2xl mb-4">
                            <LogIn className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h1>
                        <p className="text-gray-500 mt-2 text-sm">
                            {isLogin ? 'Enter your details to access the Nexus' : 'Join the Tylock Games community today'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Username</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-red-500 transition-colors">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="GameMaster99"
                                        className="block w-full pl-12 pr-4 py-4 bg-[#1a1a1e] border border-white/5 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-red-500 transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@nexus.com"
                                    className="block w-full pl-12 pr-4 py-4 bg-[#1a1a1e] border border-white/5 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
                                {isLogin && <button type="button" className="text-xs text-red-500 hover:text-red-400 font-medium transition-colors">Forgot Password?</button>}
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-red-500 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="block w-full pl-12 pr-4 py-4 bg-[#1a1a1e] border border-white/5 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-2xl text-red-500 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <div className="w-1 h-1 bg-red-500 rounded-full mt-1.5 shrink-0"></div>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative group overflow-hidden py-4 bg-red-600 rounded-2xl text-white font-bold text-lg hover:bg-red-500 transform hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <span className="relative flex items-center justify-center gap-2">
                                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                                {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                            </span>
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-8">
                        <div className="flex-1 h-[1px] bg-white/5"></div>
                        <span className="px-4 text-xs font-bold text-gray-600 uppercase tracking-widest">or continue with</span>
                        <div className="flex-1 h-[1px] bg-white/5"></div>
                    </div>

                    {/* Social Auth */}
                    <div className="grid grid-cols-1 gap-4">
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 py-3 bg-[#1a1a1e] border border-white/5 rounded-2xl text-gray-300 hover:bg-[#25252b] hover:border-white/10 transition-all disabled:opacity-50"
                        >
                            <Chrome className="w-5 h-5" />
                            <span className="text-sm font-semibold">{isLogin ? 'Sign In with Google' : 'Sign Up with Google'}</span>
                        </button>
                    </div>

                    <div className="mt-8 text-center text-gray-500 text-sm font-medium">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="ml-2 text-red-500 hover:text-red-400 font-bold hover:underline transition-all"
                        >
                            {isLogin ? 'Sign Up' : 'Log In'}
                        </button>
                    </div>
                </div>

                {/* Brand Info */}
                <div className="text-center mt-8 text-gray-600 text-xs font-bold uppercase tracking-[0.2em]">
                    Powered by <span className="text-gray-400">Tylock Engine</span>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
