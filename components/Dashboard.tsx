import React, { useState, useEffect } from 'react';
import RequestGames from './RequestGames';
import OnlineFix from './OnlineFix';
import Bypass from './Bypass';
import Help from './Help';
import Inbox from './Inbox';
import Library from './Library';
import Message from './Message';
import AvailableGames from './AvailableGames';
import LogoIcon from './icons/LogoIcon';
import HelpIcon from './icons/HelpIcon';
import InboxIcon from './icons/InboxIcon';
import LibraryIcon from './icons/LibraryIcon';
import MessageIcon from './icons/MessageIcon';
import RequestGameIcon from './icons/RequestGameIcon';
import OnlineFixIcon from './icons/OnlineFixIcon';
import BypassIcon from './icons/BypassIcon';
import AvailableGamesIcon from './icons/AvailableGamesIcon';
import type { User, Message as MessageType } from '../types';

interface DashboardProps {
  onLogout: () => void;
  currentUser: User;
}

type View = 'home' | 'request' | 'fix' | 'bypass' | 'help' | 'inbox' | 'library' | 'message' | 'available';

const HeaderButton: React.FC<{ children: React.ReactNode; icon: React.ReactNode; onClick?: () => void, notificationCount?: number }> = ({ children, icon, onClick, notificationCount = 0 }) => (
  <button onClick={onClick} className="relative flex items-center gap-2.5 text-gray-300 hover:text-white transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-white/10">
    {icon}
    <span className="hidden sm:inline">{children}</span>
    {notificationCount > 0 && (
       <span className="absolute top-1 right-1 flex h-5 w-5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-5 w-5 bg-pink-500 text-xs items-center justify-center font-bold">{notificationCount}</span>
      </span>
    )}
  </button>
);

const ActionButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string; }> = ({ onClick, children, className }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-4 px-8 py-5 rounded-xl text-xl font-bold uppercase tracking-wider transition-all duration-300 transform hover:scale-105 ${className}`}
  >
    {children}
  </button>
);

const Dashboard: React.FC<DashboardProps> = ({ onLogout, currentUser }) => {
  const [activeView, setActiveView] = useState<View>('home');
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    const allMessages: MessageType[] = JSON.parse(localStorage.getItem('messages') || '[]');
    const count = allMessages.filter(msg => msg.to === currentUser.email && !msg.isRead).length;
    setUnreadMessages(count);
  }, [currentUser.email]);

  const handleViewChange = (view: View) => {
    if (view === 'inbox' || view === 'message') {
        const allMessages: MessageType[] = JSON.parse(localStorage.getItem('messages') || '[]');
        const updatedMessages = allMessages.map(msg => 
            msg.to === currentUser.email ? { ...msg, isRead: true } : msg
        );
        localStorage.setItem('messages', JSON.stringify(updatedMessages));
        setUnreadMessages(0);
    }
    setActiveView(view);
  };

  const renderContent = () => {
    let content;
    switch (activeView) {
      case 'request':
        content = <RequestGames userEmail={currentUser.email} />;
        break;
      case 'fix':
        content = <OnlineFix />;
        break;
      case 'bypass':
        content = <Bypass />;
        break;
      case 'help':
        content = <Help />;
        break;
      case 'inbox':
        content = <Inbox userEmail={currentUser.email} />;
        break;
      case 'library':
        content = <Library currentUser={currentUser} />;
        break;
      case 'message':
        content = <Message userEmail={currentUser.email} />;
        break;
      case 'available':
        content = <AvailableGames />;
        break;
      case 'home':
      default:
        return (
          <div className="text-center animate-fade-in max-w-4xl">
            <h1 
              className="text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-wider text-white"
              style={{ textShadow: '0 0 8px rgba(236, 72, 153, 0.9), 0 0 20px rgba(236, 72, 153, 0.7)' }}
            >
              Welcome to Tylock Games
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-300 font-medium">
              What fix or game request do you need?
            </p>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 flex-wrap">
              <ActionButton
                onClick={() => setActiveView('request')}
                className="bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-[0_0_15px_theme(colors.pink.500)] hover:shadow-[0_0_25px_theme(colors.pink.500)] w-full sm:w-auto"
              >
                <RequestGameIcon className="w-7 h-7" />
                <span>Request Game</span>
              </ActionButton>
              <ActionButton
                onClick={() => setActiveView('fix')}
                className="border-2 border-orange-400 text-orange-400 shadow-[0_0_15px_theme(colors.orange.400/50%)] hover:shadow-[0_0_25px_theme(colors.orange.400)] w-full sm:w-auto"
              >
                <OnlineFixIcon className="w-7 h-7" />
                <span>Online Fix</span>
              </ActionButton>
               <ActionButton
                onClick={() => setActiveView('bypass')}
                className="border-2 border-cyan-400 text-cyan-400 shadow-[0_0_15px_theme(colors.cyan.400/50%)] hover:shadow-[0_0_25px_theme(colors.cyan.400)] w-full sm:w-auto"
              >
                <BypassIcon className="w-7 h-7" />
                <span>Bypass</span>
              </ActionButton>
            </div>
          </div>
        );
    }
    
    // Wrapper for non-home views to include a back button
    return (
        <div className="w-full animate-fade-in max-w-7xl mx-auto">
            <button 
                onClick={() => setActiveView('home')} 
                className="mb-8 flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-bold transition-colors duration-300"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back to Home
            </button>
            {content}
        </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b-2 border-purple-500/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <a href="#" aria-label="Dashboard Home" onClick={(e) => { e.preventDefault(); setActiveView('home'); }}>
                <LogoIcon className="h-10 w-auto" />
              </a>
              <span className="text-2xl font-bold tracking-wider text-white hidden md:block">TYLOCK GAMES</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-600 rounded-full bg-black/20">
                  <span className="w-2.5 h-2.5 bg-green-400 rounded-full shadow-[0_0_5px_theme(colors.green.400)]"></span>
                  <span className="font-mono text-sm text-gray-300 truncate max-w-[100px]">{currentUser.email}</span>
              </div>
              <HeaderButton icon={<AvailableGamesIcon className="w-6 h-6" />} onClick={() => handleViewChange('available')}>Games</HeaderButton>
              <HeaderButton icon={<HelpIcon className="w-6 h-6" />} onClick={() => handleViewChange('help')}>Help</HeaderButton>
              <HeaderButton icon={<InboxIcon className="w-6 h-6" />} onClick={() => handleViewChange('inbox')} notificationCount={unreadMessages}>Inbox</HeaderButton>
              <HeaderButton icon={<LibraryIcon className="w-6 h-6" />} onClick={() => handleViewChange('library')}>Library</HeaderButton>
              <HeaderButton icon={<MessageIcon className="w-6 h-6" />} onClick={() => handleViewChange('message')} notificationCount={unreadMessages}>Message</HeaderButton>
              <button onClick={onLogout} className="ml-2 px-3 py-2 text-sm font-bold bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;