
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import TermsAndConditionsPopup from './components/TermsAndConditionsPopup';
import type { User } from './types';

const ADMIN_EMAIL = 'rafaproject06@gmail.com';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<Omit<User, 'password'> | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // For T&C flow after signup
  const [showTerms, setShowTerms] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('currentUser');
      if (storedUser) {
        const user: User = JSON.parse(storedUser);
        setCurrentUser(user);
        setIsLoggedIn(true);
        if (user.email.toLowerCase() === ADMIN_EMAIL) {
          setIsAdmin(true);
        }
      }
    } catch (error) {
      console.error("Failed to parse user from sessionStorage:", error);
      sessionStorage.removeItem('currentUser');
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
    try {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentUser(user);
        setIsLoggedIn(true);
        if (user.email.toLowerCase() === ADMIN_EMAIL) {
          setIsAdmin(true);
        }
    } catch (error) {
        console.error("Could not save session storage item:", error);
        alert("Login failed. Could not save your session. Please ensure your browser allows website data/cookies and try again.");
    }
  };
  
  const handleSignupSuccess = (user: User) => {
    // Don't log in immediately, show T&C first
    setPendingUser(user);
    setShowTerms(true);
  };
  
  const handleAcceptTerms = () => {
    if (pendingUser) {
        handleLoginSuccess(pendingUser);
    }
    setShowTerms(false);
    setPendingUser(null);
  };

  const handleLogout = () => {
    try {
        sessionStorage.removeItem('currentUser');
    } catch (error) {
        console.error("Could not remove session storage item:", error);
    }
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsAdmin(false);
  };

  const renderContent = () => {
    if (showTerms && pendingUser) {
        return <TermsAndConditionsPopup onAccept={handleAcceptTerms} />;
    }
    
    if (isLoggedIn && currentUser) {
      if (isAdmin) {
        return <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />;
      }
      return <Dashboard currentUser={currentUser} onLogout={handleLogout} />;
    }
    
    return <LoginPage onLoginSuccess={handleLoginSuccess} onSignupSuccess={handleSignupSuccess} />;
  };

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-pink-500 selection:text-white">
      {renderContent()}
    </div>
  );
};

export default App;