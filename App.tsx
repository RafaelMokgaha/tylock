
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import AdminLoginModal from './components/AdminLoginModal';
import type { User } from './types';

const ADMIN_EMAIL = 'rafaproject06@gmail.com';
const ADMIN_CODE = '1622';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Omit<User, 'password'> | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  useEffect(() => {
    try {
      // Check for an existing user profile in localStorage for persistence
      let storedUser = localStorage.getItem('currentUser');
      let user: User;

      if (storedUser) {
        user = JSON.parse(storedUser);
      } else {
        // If no user exists, create a new anonymous guest user
        const guestId = `guest_${Date.now()}`;
        user = {
          name: 'Gamer',
          username: `user_${Date.now().toString().slice(-6)}`,
          email: `${guestId}@tylock.games`,
          dob: '',
          password: '', // Not used for guests
        };
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
      setCurrentUser(user);

      // Check sessionStorage for a persistent admin session
      const isAdminSessionActive = sessionStorage.getItem('isAdmin');
      if (isAdminSessionActive === 'true') {
        setIsAdmin(true);
      }

    } catch (error) {
      console.error("Failed to initialize user session:", error);
      // Clear potentially corrupted storage
      localStorage.removeItem('currentUser');
      sessionStorage.removeItem('isAdmin');
    }
  }, []);

  const handleAdminLoginRequest = () => {
    setShowAdminLogin(true);
  };

  const handleAdminLoginSubmit = (code: string) => {
    if (code.toLowerCase() === ADMIN_EMAIL || code === ADMIN_CODE) {
      try {
        sessionStorage.setItem('isAdmin', 'true');
        setIsAdmin(true);
        alert('Admin access granted.');
      } catch (error)
      {
        console.error("Could not save admin session:", error);
        alert("Admin login failed. Could not save your session. Please ensure your browser allows website data/cookies.");
      }
    } else {
      alert('Incorrect code or email.');
    }
    setShowAdminLogin(false); // Close modal after attempt
  };

  const handleAdminLogout = () => {
    try {
      sessionStorage.removeItem('isAdmin');
    } catch (error) {
      console.error("Could not remove admin session item:", error);
    }
    setIsAdmin(false);
  };

  const renderContent = () => {
    if (!currentUser) {
      // Show a loading state or a fallback while the user is being initialized
      return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
    }
    
    if (isAdmin) {
      return <AdminDashboard currentUser={currentUser} onLogout={handleAdminLogout} />;
    }
    
    return <Dashboard currentUser={currentUser} onAdminLoginRequest={handleAdminLoginRequest} />;
  };

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-pink-500 selection:text-white">
      {showAdminLogin && (
        <AdminLoginModal 
          onClose={() => setShowAdminLogin(false)} 
          onSubmit={handleAdminLoginSubmit} 
        />
      )}
      {renderContent()}
    </div>
  );
};

export default App;
