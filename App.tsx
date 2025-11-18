
import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import TermsAndConditionsPopup from './components/TermsAndConditionsPopup';
import DonationEmoji from './components/DonationEmoji';
import type { User } from './types';

// Omit password from the user object stored in state/localStorage
interface CurrentUser extends Omit<User, 'password'> {
  role: 'user' | 'admin';
}

const ADMIN_EMAIL = 'rafaproject06@gmail.com';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [newUserForTerms, setNewUserForTerms] = useState<User | null>(null);

  useEffect(() => {
    // Check for a logged-in user in localStorage on initial load
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
      try {
        setCurrentUser(JSON.parse(loggedInUser));
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        // Clear corrupted data
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
    const { password, ...userWithoutPassword } = user;
    const userWithRole: CurrentUser = {
      ...userWithoutPassword,
      role: user.email.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'user',
    };
    setCurrentUser(userWithRole);
    localStorage.setItem('currentUser', JSON.stringify(userWithRole));
  };

  const handleSignupSuccess = (newUser: User) => {
    setNewUserForTerms(newUser);
  };

  const handleAcceptTerms = () => {
    if (newUserForTerms) {
      handleLoginSuccess(newUserForTerms);
      setNewUserForTerms(null);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('welcomePopupShown'); // Clear session storage on logout
  };

  const renderContent = () => {
    if (newUserForTerms) {
      return <TermsAndConditionsPopup onAccept={handleAcceptTerms} />;
    }
    if (!currentUser) {
      return <LoginPage onLoginSuccess={handleLoginSuccess} onSignupSuccess={handleSignupSuccess} />;
    }
    if (currentUser.role === 'admin') {
      return <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />;
    }
    return <Dashboard currentUser={currentUser} onLogout={handleLogout} />;
  };

  return (
    <div 
      className="min-h-screen bg-transparent text-white selection:bg-pink-500 selection:text-white"
    >
      <DonationEmoji />
      {renderContent()}
    </div>
  );
};

export default App;