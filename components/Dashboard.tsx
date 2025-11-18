
import React, { useState, useEffect } from 'react';
import RequestGames from './RequestGames';
import OnlineFix from './OnlineFix';
import Bypass from './Bypass';
import Help from './Help';
import Inbox from './Inbox';
import Library from './Library';
import Message from './Message';
import WelcomePopup from './WelcomePopup';
import AvailableGames from './AvailableGames';
import UbisoftBypass from './bypasses/UbisoftBypass';
import EABypass from './bypasses/EABypass';
import RockstarBypass from './bypasses/RockstarBypass';
import OtherBypass from './bypasses/OtherBypass';
import Appreciation from './Appreciation';
import LogoIcon from './icons/LogoIcon';
import HelpIcon from './icons/HelpIcon';
import InboxIcon from './icons/InboxIcon';
import LibraryIcon from './icons/LibraryIcon';
import MessageIcon from './icons/MessageIcon';
import RequestGameIcon from './icons/RequestGameIcon';
import OnlineFixIcon from './icons/OnlineFixIcon';
import BypassIcon from './icons/BypassIcon';
import AvailableGamesIcon from './icons/AvailableGamesIcon';
import HeartIcon from './icons/HeartIcon';
import type { User, Message as MessageType } from '../types';

interface DashboardProps {
  currentUser: Omit<User, 'password'>;
  onLogout: () => void;
}

type View = 'home' | 'request' | 'fix' | 'bypass' | 'help' | 'inbox' | 'library' | 'message' | 'available' | 'ubisoftBypass' | 'eaBypass' | 'rockstarBypass' | 'otherBypass' | 'appreciation';

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

const AdSlider: React.FC = () => {
    const ads = [
      {
        title: "FC 26 IS NOT AVAILABLE",
        imageUrl: "https://static.wixstatic.com/media/a827d0_6e20907f3d6640d8bcb5320b54972418~mv2.png"
      },
      {
        title: "THE CREW 2 IS AVAILABLE",
        imageUrl: "https://static.wixstatic.com/media/a827d0_b281146c6d614808baec4bd45f2f7c4d~mv2.jpg"
      },
      {
        title: "ASSASSIN'S CREED SHADOWS AVAILABLE",
        imageUrl: "https://static.wixstatic.com/media/a827d0_c283a5321813454d9a0493dceb3409a6~mv2.jpg/v1/fill/w_644,h_301,al_c,lg_1,q_80,enc_auto/header%20(1).jpg"
      }
    ];
    const [currentSlide, setCurrentSlide] = useState(0);
  
    useEffect(() => {
      const slideInterval = setInterval(() => {
        setCurrentSlide(prevSlide => (prevSlide + 1) % ads.length);
      }, 5000); // Change slide every 5 seconds
  
      return () => clearInterval(slideInterval);
    }, [ads.length]);
  
    const goToSlide = (index: number) => {
      setCurrentSlide(index);
    };
  
    const nextSlide = () => {
       setCurrentSlide(prevSlide => (prevSlide + 1) % ads.length);
    };
  
    const prevSlide = () => {
      setCurrentSlide(prevSlide => (prevSlide - 1 + ads.length) % ads.length);
    };
  
    return (
      <div className="w-full max-w-5xl mx-auto mb-12 relative overflow-hidden rounded-lg border-2 border-cyan-500/30 bg-black/30 shadow-[0_0_15px_theme(colors.cyan.500/50%)]">
        <div className="absolute top-2 left-4 text-sm font-bold tracking-widest text-cyan-400 z-20">
          LATEST NEWS:
        </div>
        <div className="relative aspect-video w-full flex overflow-hidden">
          {ads.map((ad, index) => (
            <div
              key={index}
              className="absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out"
              style={{ opacity: index === currentSlide ? 1 : 0 }}
            >
              <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              <p 
                className="absolute bottom-4 left-4 md:bottom-6 md:left-6 text-xl md:text-3xl lg:text-4xl font-bold uppercase tracking-wider text-white"
                style={{ textShadow: '0 0 8px rgba(0, 255, 255, 0.9), 0 0 20px rgba(0, 255, 255, 0.7)' }}
              >
                {ad.title}
              </p>
            </div>
          ))}
        </div>
        
        {/* Navigation Arrows */}
         <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-30" aria-label="Previous Ad">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-cyan-400">
             <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
           </svg>
         </button>
         <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-30" aria-label="Next Ad">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-cyan-400">
             <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
           </svg>
         </button>
  
        {/* Indicator Dots */}
        <div className="absolute bottom-4 right-4 flex space-x-2 z-30">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-cyan-400 shadow-[0_0_5px_theme(colors.cyan.400)] scale-110' : 'bg-gray-600/50 hover:bg-gray-500/50'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ currentUser, onLogout }) => {
  const [activeView, setActiveView] = useState<View>('home');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Check if the welcome popup has been shown in this session
    if (!sessionStorage.getItem('welcomePopupShown')) {
      setShowWelcome(true);
    }

    let allMessages: MessageType[] = [];
    try {
        allMessages = JSON.parse(localStorage.getItem('messages') || '[]');
    } catch (error) {
        console.error("Failed to parse messages from localStorage:", error);
    }
    const count = allMessages.filter(msg => msg.to === currentUser.email && !msg.isRead).length;
    setUnreadMessages(count);
  }, [currentUser.email]);

  const handleCloseWelcomePopup = () => {
    setShowWelcome(false);
    sessionStorage.setItem('welcomePopupShown', 'true');
  };

  const handleViewChange = (view: View) => {
    if (view === 'inbox' || view === 'message') {
        let allMessages: MessageType[] = [];
        try {
            allMessages = JSON.parse(localStorage.getItem('messages') || '[]');
        } catch (error) {
            console.error("Failed to parse messages from localStorage:", error);
        }
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
        content = <OnlineFix userEmail={currentUser.email} />;
        break;
      case 'bypass':
        content = <Bypass onNavigate={setActiveView} />;
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
      case 'ubisoftBypass':
        content = <UbisoftBypass userEmail={currentUser.email} />;
        break;
      case 'eaBypass':
        content = <EABypass userEmail={currentUser.email} />;
        break;
      case 'rockstarBypass':
        content = <RockstarBypass userEmail={currentUser.email} />;
        break;
      case 'otherBypass':
        content = <OtherBypass userEmail={currentUser.email} />;
        break;
      case 'appreciation':
        content = <Appreciation />;
        break;
      case 'home':
      default:
        return (
          <div className="text-center animate-fade-in w-full">
            <div className="max-w-4xl mx-auto mb-12">
              <h1 
                className="text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-wider text-white"
                style={{ textShadow: '0 0 8px rgba(236, 72, 153, 0.9), 0 0 20px rgba(236, 72, 153, 0.7)' }}
              >
                Welcome, {currentUser.name}!
              </h1>
              <p className="mt-4 text-lg md:text-xl text-gray-300 font-medium">
                What fix or game request do you need?
              </p>
            </div>
            <AdSlider />
            <div className="max-w-4xl mx-auto">
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
          </div>
        );
    }
    
    const isBypassSubView = ['ubisoftBypass', 'eaBypass', 'rockstarBypass', 'otherBypass'].includes(activeView);
    const backTarget: View = isBypassSubView ? 'bypass' : 'home';
    const backText = backTarget === 'bypass' ? 'Bypasses' : 'Home';
    
    // Wrapper for non-home views to include a back button
    return (
        <div className="w-full animate-fade-in max-w-7xl mx-auto">
            <button 
                onClick={() => setActiveView(backTarget)} 
                className="mb-8 flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-bold transition-colors duration-300"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back to {backText}
            </button>
            {content}
        </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
       {showWelcome && <WelcomePopup onClose={handleCloseWelcomePopup} />}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b-2 border-purple-500/30">
        <div className="container mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-4">
              <a href="#" aria-label="Dashboard Home" onClick={(e) => { e.preventDefault(); setActiveView('home'); }}>
                <LogoIcon className="h-10 w-auto" />
              </a>
              <span className="text-2xl font-bold tracking-wider text-white hidden md:block">TYLOCK GAMES</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-600 rounded-full bg-black/20">
                  <span className="w-2.5 h-2.5 bg-green-400 rounded-full shadow-[0_0_5px_theme(colors.green.400)] flex-shrink-0"></span>
                  <span className="font-mono text-sm text-gray-300 hidden sm:inline truncate max-w-[100px]">{currentUser.username}</span>
              </div>
              <HeaderButton icon={<HelpIcon className="w-6 h-6" />} onClick={() => handleViewChange('help')}>Help</HeaderButton>
              <HeaderButton icon={<HeartIcon className="w-6 h-6" />} onClick={() => handleViewChange('appreciation')}>Appreciation</HeaderButton>
              <HeaderButton icon={<InboxIcon className="w-6 h-6" />} onClick={() => handleViewChange('inbox')} notificationCount={unreadMessages}>Inbox</HeaderButton>
              <HeaderButton icon={<LibraryIcon className="w-6 h-6" />} onClick={() => handleViewChange('library')}>Library</HeaderButton>
              <HeaderButton icon={<MessageIcon className="w-6 h-6" />} onClick={() => handleViewChange('message')} notificationCount={unreadMessages}>Message</HeaderButton>
              <button onClick={onLogout} className="ml-2 px-3 py-1.5 text-sm font-bold bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
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
