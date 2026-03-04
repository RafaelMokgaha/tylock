import React, { useState, useEffect } from 'react';
import {
  Users, MessageSquare, ArrowLeft,
  Volume2, Settings, Bell, Mic, Headphones
} from 'lucide-react';
import ProfileModal from './ProfileModal';
import SettingsModal from './SettingsModal';
import RequestGames from './RequestGames';
import OnlineFix from './OnlineFix';
import Bypass from './Bypass';
import Help from './Help';
import Library from './Library';
import Message from './Message';
import Chat from './Chat';
import WelcomePopup from './WelcomePopup';
import AvailableGames from './AvailableGames';
import VoiceBox from './VoiceBox';
import UbisoftBypass from './bypasses/UbisoftBypass';
import EABypass from './bypasses/EABypass';
import RockstarBypass from './bypasses/RockstarBypass';
import OtherBypass from './bypasses/OtherBypass';

import Appreciation from './Appreciation';
import AnnouncementsView from './AnnouncementsView';
import PrivacyPolicy from './PrivacyPolicy';
import LogoIcon from './icons/LogoIcon';
import HelpIcon from './icons/HelpIcon';
import InboxIcon from './icons/InboxIcon';
import LibraryIcon from './icons/LibraryIcon';
import MessageIcon from './icons/MessageIcon';
import VoiceBoxIcon from './icons/VoiceBoxIcon';
import RequestGameIcon from './icons/RequestGameIcon';
import OnlineFixIcon from './icons/OnlineFixIcon';
import BypassIcon from './icons/BypassIcon';
import AvailableGamesIcon from './icons/AvailableGamesIcon';
import HeartIcon from './icons/HeartIcon';
import PrivacyPolicyIcon from './icons/PrivacyPolicyIcon';
import type { User, Message as MessageType } from '../types';

interface DashboardProps {
  currentUser: Omit<User, 'password'>;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

type View = 'home' | 'request' | 'fix' | 'bypass' | 'help' | 'private_message' | 'community_chat' | 'library' | 'message' | 'voice' | 'available' | 'ubisoftBypass' | 'eaBypass' | 'rockstarBypass' | 'otherBypass' | 'appreciation' | 'announcements' | 'privacy';

const SidebarButton: React.FC<{ children: React.ReactNode; icon: React.ReactNode; onClick?: () => void, notificationCount?: number, isActive?: boolean, hasNew?: boolean }> = ({ children, icon, onClick, notificationCount = 0, isActive = false, hasNew = false }) => (
  <button
    onClick={onClick}
    className={`relative flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-300 font-bold tracking-wide ${isActive ? 'bg-accent/20 text-accent border border-accent/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
  >
    {icon}
    <span className="relative">
      {children}
      {hasNew && (
        <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      )}
    </span>
    {notificationCount > 0 && (
      <span className="absolute top-1/2 -translate-y-1/2 right-4 flex h-6 w-6">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent/40 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-6 w-6 bg-accent text-xs items-center justify-center font-bold text-white">{notificationCount}</span>
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
      title: "FC 26 IS AVAILABLE",
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
    <div className="w-full max-w-5xl mx-auto mb-12 relative overflow-hidden rounded-lg border border-red-500/30 bg-black/30">
      <div className="absolute top-2 left-4 text-sm font-bold tracking-widest text-red-400 z-20">
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
            >
              {ad.title}
            </p>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-30" aria-label="Previous Ad">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-30" aria-label="Next Ad">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Indicator Dots */}
      <div className="absolute bottom-4 right-4 flex space-x-2 z-30">
        {ads.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-red-400 scale-110' : 'bg-gray-600/50 hover:bg-gray-500/50'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs, writeBatch } from 'firebase/firestore';

const Dashboard: React.FC<DashboardProps> = ({ currentUser, currentTheme, onThemeChange }) => {
  const [activeView, setActiveView] = useState<View>('home');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [localUser, setLocalUser] = useState(currentUser);


  useEffect(() => {
    // Check if the welcome popup has been shown ever (using localStorage)
    if (!localStorage.getItem('welcomePopupShown')) {
      setShowWelcome(true);
    }

    // Listen for unread messages (support messages)
    const q = query(
      collection(db, 'helpMessages'),
      where('to', '==', currentUser.email),
      where('isRead', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadMessages(snapshot.size);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser.email]);

  const handleCloseWelcomePopup = () => {
    setShowWelcome(false);
    localStorage.setItem('welcomePopupShown', 'true');
  };

  const handleViewChange = async (view: View) => {
    if (view === 'message') {
      // Mark all support messages to this user as read
      try {
        const q = query(
          collection(db, 'helpMessages'),
          where('to', '==', currentUser.email),
          where('isRead', '==', false)
        );
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.docs.forEach((msgDoc) => {
          batch.update(msgDoc.ref, { isRead: true });
        });
        await batch.commit();
      } catch (error) {
        console.error("Failed to mark messages as read:", error);
      }
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
      case 'message':
        content = <Message userEmail={currentUser.email} />;
        break;
      case 'voice':
        content = <VoiceBox currentUserEmail={currentUser.email} />;
        break;
      case 'bypass':
        content = <Bypass onNavigate={setActiveView} />;
        break;
      case 'help':
        content = <Help />;
        break;
      case 'library':
        content = <Library currentUser={currentUser} />;
        break;
      case 'private_message':
        content = <Chat currentUser={currentUser} initialMode="direct" />;
        break;
      case 'community_chat':
        content = <Chat currentUser={currentUser} initialMode="global" hideSidebar={true} />;
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
      case 'announcements':
        content = <AnnouncementsView />;
        break;
      case 'privacy':
        content = <PrivacyPolicy />;
        break;
      case 'home':
      default:
        return (
          <div className="text-center animate-fade-in w-full">
            <div className="max-w-4xl mx-auto mb-12">
              <h1
                className="text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-wider text-white"
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
                  className="bg-red-600 hover:bg-red-500 text-white w-full sm:w-auto"
                >
                  <RequestGameIcon className="w-7 h-7" />
                  <span>Request Game</span>
                </ActionButton>
                <ActionButton
                  onClick={() => setActiveView('fix')}
                  className="bg-red-600 hover:bg-red-500 text-white w-full sm:w-auto"
                >
                  <OnlineFixIcon className="w-7 h-7" />
                  <span>Online Fix</span>
                </ActionButton>
                <ActionButton
                  onClick={() => setActiveView('bypass')}
                  className="bg-red-600 hover:bg-red-500 text-white w-full sm:w-auto"
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
          className="mb-8 flex items-center gap-2 text-red-400 hover:text-red-300 font-bold transition-colors duration-300"
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
    <div className="min-h-screen flex bg-transparent">
      {showWelcome && <WelcomePopup onClose={handleCloseWelcomePopup} />}

      {/* Sidebar */}
      <aside className="w-64 fixed left-0 top-0 h-screen bg-[#121214]/90 backdrop-blur-xl border-r border-white/5 z-50 flex flex-col transition-all duration-300 shadow-2xl">
        <div className="p-6 flex items-center gap-4 border-b border-white/5">
          <LogoIcon className="h-8 w-auto text-red-500" />
          <span className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-500 uppercase">Tylock</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 scrollbar-thin scrollbar-thumb-red-500/20 scrollbar-track-transparent">
          <SidebarButton isActive={activeView === 'home'} icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>} onClick={() => handleViewChange('home')}>Home</SidebarButton>
          <SidebarButton isActive={activeView === 'announcements'} icon={<Bell className="w-6 h-6" />} onClick={() => handleViewChange('announcements')}>Announcements</SidebarButton>
          <SidebarButton isActive={activeView === 'library'} icon={<LibraryIcon className="w-6 h-6" />} onClick={() => handleViewChange('library')}>Library</SidebarButton>

          <div className="pt-6 pb-2">
            <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Gaming Community</p>
          </div>
          <SidebarButton isActive={activeView === 'voice'} icon={<VoiceBoxIcon className="w-6 h-6" />} onClick={() => handleViewChange('voice')}>Voice Box</SidebarButton>
          <SidebarButton isActive={activeView === 'private_message'} icon={<MessageIcon className="w-6 h-6" />} onClick={() => handleViewChange('private_message')}>Chat</SidebarButton>
          <SidebarButton isActive={activeView === 'community_chat'} icon={<Users className="w-6 h-6" />} onClick={() => handleViewChange('community_chat')}>Community Chat</SidebarButton>



          <div className="pt-6 pb-2">
            <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Support</p>
          </div>
          <SidebarButton isActive={activeView === 'message'} icon={<InboxIcon className="w-6 h-6" />} onClick={() => handleViewChange('message')} notificationCount={unreadMessages}>Help Chat</SidebarButton>
          <SidebarButton isActive={activeView === 'help'} icon={<HelpIcon className="w-6 h-6" />} onClick={() => handleViewChange('help')}>Help Center</SidebarButton>
          <SidebarButton isActive={activeView === 'appreciation'} icon={<HeartIcon className="w-6 h-6" />} onClick={() => handleViewChange('appreciation')}>Appreciation</SidebarButton>
        </div>

        <div className="p-4 border-t border-white/5 space-y-4 bg-gradient-to-b from-transparent to-black/20">
          <div className="flex items-center gap-2">
            <div
              onClick={() => setShowProfile(true)}
              className="flex-1 flex items-center gap-3 px-3 py-3 bg-[#1a1a1e] rounded-xl border border-white/5 shadow-inner cursor-pointer hover:bg-white/5 transition-colors"
            >
              <div className="relative">
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 border-2 border-[#121214] rounded-full z-10"></span>
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-accent/20 to-red-500/20 flex items-center justify-center border border-accent/30 overflow-hidden">
                  {localUser.photoURL ? (
                    <img src={localUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-accent text-sm">{localUser.username.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0 pr-1">
                <p className="text-sm font-bold text-white truncate leading-none mb-1">{localUser.name}</p>
                <p className="text-[9px] font-black uppercase tracking-wider text-red-400 opacity-80">Online</p>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(true)}
              className="p-3 bg-[#1a1a1e] rounded-xl border border-white/5 hover:border-accent/40 hover:bg-accent/5 text-gray-500 hover:text-accent transition-all group"
              title="Global Settings"
            >
              <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
            </button>
          </div>

          <div className="flex justify-center items-center py-2 text-gray-500 hover:text-white transition-colors cursor-pointer" onClick={() => handleViewChange('privacy')}>
            <PrivacyPolicyIcon className="w-4 h-4 mr-2" />
            <span className="text-xs font-bold uppercase tracking-widest">Privacy Policy</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col relative w-[calc(100%-16rem)] overflow-x-hidden">
        <div className="flex-grow p-4 md:p-10 mb-8 flex items-start justify-center">
          <div className="w-full max-w-7xl">
            {renderContent()}
          </div>
        </div>

        <footer className="w-full mt-auto py-6 border-t border-white/5 bg-black/10 backdrop-blur-sm">
          <div className="container mx-auto px-8 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">
            <p className="opacity-50">
              &copy; {new Date().getFullYear()} Tylock Games. All rights reserved.
            </p>
          </div>
        </footer>
      </main>


      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <ProfileModal
            currentUser={localUser}
            onUpdate={(updated) => setLocalUser(updated)}
            onClose={() => setShowProfile(false)}
          />
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <SettingsModal
            onClose={() => setShowSettings(false)}
            currentTheme={currentTheme}
            onThemeChange={onThemeChange}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;

