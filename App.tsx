import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import type { User } from './types';

interface CurrentUser extends User {
  role: 'user' | 'admin';
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    // Check for a logged-in user in localStorage on initial load
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
      setCurrentUser(JSON.parse(loggedInUser));
    }
  }, []);

  const handleLoginSuccess = (user: CurrentUser) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const renderContent = () => {
    if (!currentUser) {
      return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }
    if (currentUser.role === 'admin') {
      return <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />;
    }
    return <Dashboard currentUser={currentUser} onLogout={handleLogout} />;
  };

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-pink-500 selection:text-white">
      {renderContent()}
    </div>
  );
};

export default App;
