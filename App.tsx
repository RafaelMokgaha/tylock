
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import { Loader2 } from 'lucide-react';
import type { User } from './types';

const ADMIN_EMAILS = ['rafaproject06@gmail.com', 'admin226@gmail.com'];

const App: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [firestoreUser, setFirestoreUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('nexus-theme') || 'phantom');

  const THEMES: any = {
    phantom: { accent: '#dc2626', bg: '#0a0a0b', card: '#121214', border: 'rgba(255,255,255,0.06)' },
    oceanic: { accent: '#cc0000', bg: '#0a0a0b', card: '#121214', border: 'rgba(255,255,255,0.06)' },
    emerald: { accent: '#b91c1c', bg: '#0a0a0b', card: '#121214', border: 'rgba(255,255,255,0.06)' },
    sunset: { accent: '#991b1b', bg: '#0a0a0b', card: '#121214', border: 'rgba(255,255,255,0.06)' },
    midnight: { accent: '#7f1d1d', bg: '#0a0a0b', card: '#121214', border: 'rgba(255,255,255,0.06)' },
  };

  useEffect(() => {
    const activeTheme = THEMES[theme] || THEMES.phantom;
    const root = document.documentElement;
    root.style.setProperty('--accent', activeTheme.accent);
    root.style.setProperty('--nexus-bg', activeTheme.bg);
    root.style.setProperty('--nexus-card', activeTheme.card);
    root.style.setProperty('--nexus-border', activeTheme.border);
    localStorage.setItem('nexus-theme', theme);
  }, [theme]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);

      if (authUser) {
        // Fetch extra metadata from Firestore
        const unsubDoc = onSnapshot(doc(db, 'users', authUser.uid), async (snapshot) => {
          if (snapshot.exists()) {
            setFirestoreUser(snapshot.data());
          } else {
            // Auto-sync for users who don't have a document yet
            const username = authUser.displayName || authUser.email?.split('@')[0] || 'user';
            await setDoc(doc(db, 'users', authUser.uid), {
              uid: authUser.uid,
              username: username,
              usernameLower: username.toLowerCase(),
              email: authUser.email?.toLowerCase() || '',
              displayName: authUser.displayName || '',
              photoURL: authUser.photoURL || '',
              updatedAt: serverTimestamp()
            });
          }
        });
      } else {
        setFirestoreUser(null);
      }

      setLoading(false);

      // Sync admin status
      if (authUser?.email && ADMIN_EMAILS.includes(authUser.email)) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setIsAdmin(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
      </div>
    );
  }

  const renderContent = () => {
    if (isAdmin) {
      const adminUser: Omit<User, 'password'> = {
        name: user?.displayName || 'Admin',
        username: 'admin',
        email: user?.email || 'admin@tylock.com',
        dob: '',
        photoURL: user?.photoURL || undefined
      };
      return <AdminDashboard currentUser={adminUser} onLogout={handleLogout} />;
    }

    if (!user) {
      return <LoginPage onLoginSuccess={() => { }} />;
    }

    const currentUser: Omit<User, 'password'> = {
      name: firestoreUser?.displayName || user.displayName || 'User',
      username: firestoreUser?.username || user.email?.split('@')[0] || 'user',
      email: user.email || '',
      dob: '',
      photoURL: firestoreUser?.photoURL || user.photoURL || undefined
    };

    return <Dashboard
      currentUser={currentUser}
      currentTheme={theme}
      onThemeChange={setTheme}
    />;
  };

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-red-600 selection:text-white">
      {renderContent()}
    </div>
  );
};

export default App;
