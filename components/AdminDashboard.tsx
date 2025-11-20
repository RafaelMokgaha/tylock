
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { User, GameRequest, Message, OnlineFixRequest, BypassRequest, VisitorLog } from '../types';
import LogoIcon from './icons/LogoIcon';
import NeonButton from './common/NeonButton';
import AnalyticsIcon from './icons/AnalyticsIcon';

interface AdminDashboardProps {
  onLogout: () => void;
  currentUser: Omit<User, 'password'>;
}

type AdminView = 'requests' | 'messages' | 'onlineFixes' | 'bypassRequests' | 'visitorLogs';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, currentUser }) => {
  const [view, setView] = useState<AdminView>('requests');
  const [gameRequests, setGameRequests] = useState<GameRequest[]>([]);
  const [onlineFixRequests, setOnlineFixRequests] = useState<OnlineFixRequest[]>([]);
  const [bypassRequests, setBypassRequests] = useState<BypassRequest[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  
  // Game request approval state
  const [approvingRequestId, setApprovingRequestId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Online fix approval state
  const [approvingFixId, setApprovingFixId] = useState<number | null>(null);
  const [fixFile, setFixFile] = useState<File | null>(null);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const [artworkUrl, setArtworkUrl] = useState('');

  // Bypass request approval state
  const [approvingBypassId, setApprovingBypassId] = useState<number | null>(null);
  const [bypassFile, setBypassFile] = useState<File | null>(null);
  const [bypassArtworkFile, setBypassArtworkFile] = useState<File | null>(null);
  const [bypassArtworkPreview, setBypassArtworkPreview] = useState<string | null>(null);
  const [bypassArtworkUrl, setBypassArtworkUrl] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getStoredData = <T,>(key: string): T[] => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Failed to parse ${key} from localStorage:`, error);
      return [];
    }
  };

  // Polling function to keep data fresh
  const refreshData = useCallback(() => {
    const storedRequests = getStoredData<GameRequest>('gameRequests');
    const storedFixRequests = getStoredData<OnlineFixRequest>('onlineFixRequests');
    const storedBypassRequests = getStoredData<BypassRequest>('bypassRequests');
    const storedMessages = getStoredData<Message>('messages');
    const storedLogs = getStoredData<VisitorLog>('visitorLogs');

    const sortDesc = (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();

    setGameRequests(prev => {
        const sorted = [...storedRequests].sort(sortDesc);
        return JSON.stringify(prev) === JSON.stringify(sorted) ? prev : sorted;
    });

    setOnlineFixRequests(prev => {
        const sorted = [...storedFixRequests].sort(sortDesc);
        return JSON.stringify(prev) === JSON.stringify(sorted) ? prev : sorted;
    });

    setBypassRequests(prev => {
        const sorted = [...storedBypassRequests].sort(sortDesc);
        return JSON.stringify(prev) === JSON.stringify(sorted) ? prev : sorted;
    });

    setMessages(prev => {
        return JSON.stringify(prev) === JSON.stringify(storedMessages) ? prev : storedMessages;
    });

    setVisitorLogs(prev => {
        const sorted = [...storedLogs].sort(sortDesc);
        return JSON.stringify(prev) === JSON.stringify(sorted) ? prev : sorted;
    });
    
    setLastRefreshed(new Date());
  }, []);

  useEffect(() => {
    refreshData(); // Initial load
    const intervalId = setInterval(refreshData, 2000); // Poll every 2 seconds

    // Listen for storage changes in other tabs
    const handleStorageChange = (e: StorageEvent) => {
        refreshData();
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
        clearInterval(intervalId);
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshData]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedUser]);

  // Simulation Helper for Testing
  const simulateIncomingData = () => {
    const randomId = Math.floor(Math.random() * 1000);
    
    // Simulate Visitor
    const newLog: VisitorLog = {
        id: Date.now(),
        username: `TestUser_${randomId}`,
        timestamp: new Date().toISOString()
    };
    const currentLogs = getStoredData<VisitorLog>('visitorLogs');
    localStorage.setItem('visitorLogs', JSON.stringify([...currentLogs, newLog]));

    // Simulate Request
    const newReq: GameRequest = {
        id: Date.now(),
        userEmail: `TestUser_${randomId}@example.com`,
        gameTitle: `Simulated Request ${randomId}`,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    const currentReqs = getStoredData<GameRequest>('gameRequests');
    localStorage.setItem('gameRequests', JSON.stringify([...currentReqs, newReq]));

    refreshData();
    alert(`Simulated "TestUser_${randomId}" login and request. Check logs and requests tab.`);
  };

  const sendApprovalNotification = (userEmail: string, content: string) => {
    const allMessages = getStoredData<Message>('messages');
    const newMessage: Message = {
        id: Date.now(),
        from: 'admin',
        to: userEmail,
        content,
        timestamp: new Date().toISOString(),
        isRead: false,
    };
    const updatedMessages = [...allMessages, newMessage];
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
    refreshData(); 
  };

  const conversations = messages.reduce((acc, msg) => {
    const otherParty = msg.from === 'admin' ? msg.to : msg.from;
    if (!acc[otherParty]) {
      acc[otherParty] = [];
    }
    acc[otherParty].push(msg);
    return acc;
  }, {} as Record<string, Message[]>);

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedUser) return;

    const allMessages = getStoredData<Message>('messages');
    const newReply: Message = {
      id: Date.now(),
      from: 'admin',
      to: selectedUser,
      content: replyContent,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    const updatedMessages = [...allMessages, newReply];
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
    setReplyContent('');
    refreshData();
  };

  const triggerFileUpload = (requestId: number) => {
    setApprovingRequestId(requestId);
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !approvingRequestId) return;

    const fileUrl = URL.createObjectURL(file);
    const currentReqs = getStoredData<GameRequest>('gameRequests');
      
    const updatedRequests = currentReqs.map(req =>
      req.id === approvingRequestId 
      ? { ...req, status: 'approved' as 'approved', fileName: file.name, fileUrl } 
      : req
    );
    
    localStorage.setItem('gameRequests', JSON.stringify(updatedRequests));

    const approvedRequest = updatedRequests.find(req => req.id === approvingRequestId);
    if (approvedRequest) {
      sendApprovalNotification(
        approvedRequest.userEmail,
        `Your game request for "${approvedRequest.gameTitle}" has been approved! You can now download it from your Library.`
      );
    }
    
    setApprovingRequestId(null);
    event.target.value = '';
    refreshData();
  };

  const handleArtworkUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setArtworkUrl(e.target.value);
    if (e.target.value) {
      setArtworkFile(null);
      setArtworkPreview(null);
    }
  };

  const handleArtworkChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setArtworkFile(file);
      setArtworkPreview(URL.createObjectURL(file));
      setArtworkUrl('');
    }
  };

  const handleConfirmFixApproval = () => {
    if (!fixFile || !approvingFixId || (!artworkPreview && !artworkUrl.trim())) return;

    try {
      const fileUrl = URL.createObjectURL(fixFile);
      const imageUrl = artworkPreview || artworkUrl;
      const currentReqs = getStoredData<OnlineFixRequest>('onlineFixRequests');

      const finalUpdatedRequests = currentReqs.map(req =>
        req.id === approvingFixId 
        ? { ...req, status: 'approved' as 'approved', fileName: fixFile.name, fileUrl, imageUrl }
        : req
      );
      
      localStorage.setItem('onlineFixRequests', JSON.stringify(finalUpdatedRequests));
      
      const approvedRequest = finalUpdatedRequests.find(req => req.id === approvingFixId);
      if (approvedRequest) {
        sendApprovalNotification(
          approvedRequest.userEmail,
          `Your request for an Online Fix for "${approvedRequest.gameTitle}" has been approved! It is now available on the Online Fix page.`
        );
      }

      setApprovingFixId(null);
      setFixFile(null);
      setArtworkFile(null);
      setArtworkPreview(null);
      setArtworkUrl('');
      refreshData();
    } catch (error) {
      console.error("Error creating object URLs:", error);
    }
  };

  const handleBypassArtworkUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBypassArtworkUrl(e.target.value);
    if (e.target.value) {
      setBypassArtworkFile(null);
      setBypassArtworkPreview(null);
    }
  };
  
  const handleBypassArtworkChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBypassArtworkFile(file);
      setBypassArtworkPreview(URL.createObjectURL(file));
      setBypassArtworkUrl('');
    }
  };
  
  const handleConfirmBypassApproval = () => {
    if (!bypassFile || !approvingBypassId || (!bypassArtworkPreview && !bypassArtworkUrl.trim())) return;

    try {
      const fileUrl = URL.createObjectURL(bypassFile);
      const imageUrl = bypassArtworkPreview || bypassArtworkUrl;
      const currentReqs = getStoredData<BypassRequest>('bypassRequests');
      
      const finalUpdatedRequests = currentReqs.map(req =>
        req.id === approvingBypassId 
        ? { ...req, status: 'approved' as 'approved', fileName: bypassFile.name, fileUrl, imageUrl }
        : req
      );
      localStorage.setItem('bypassRequests', JSON.stringify(finalUpdatedRequests));
      
      const approvedRequest = finalUpdatedRequests.find(req => req.id === approvingBypassId);
      if (approvedRequest) {
        let category = "Bypass section";
        let cleanTitle = approvedRequest.gameTitle;
      
        if (cleanTitle.startsWith('Ubisoft Bypass: ')) {
            category = "Ubisoft Bypass page";
            cleanTitle = cleanTitle.replace('Ubisoft Bypass: ', '');
        } else if (cleanTitle.startsWith('EA Bypass: ')) {
            category = "EA Bypass page";
            cleanTitle = cleanTitle.replace('EA Bypass: ', '');
        } else if (cleanTitle.startsWith('Rockstar Bypass: ')) {
            category = "Rockstar Bypass page";
            cleanTitle = cleanTitle.replace('Rockstar Bypass: ', '');
        } else if (cleanTitle.startsWith('Other Bypass: ')) {
            category = "Other Bypass page";
            cleanTitle = cleanTitle.replace('Other Bypass: ', '');
        }
        
        sendApprovalNotification(
            approvedRequest.userEmail,
            `Your Bypass request for "${cleanTitle}" has been approved! It is now available on the ${category}.`
        );
      }

      setApprovingBypassId(null);
      setBypassFile(null);
      setBypassArtworkFile(null);
      setBypassArtworkPreview(null);
      setBypassArtworkUrl('');
      refreshData();
    } catch (error) {
      console.error("Error creating object URLs:", error);
    }
  };

    const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to delete all visitor logs? This action cannot be undone.')) {
        try {
            localStorage.removeItem('visitorLogs');
            setVisitorLogs([]);
            refreshData();
        } catch (error) {
            console.error("Failed to clear visitor logs from localStorage:", error);
        }
    }
  };

  const renderRequests = () => (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold text-pink-400 tracking-widest uppercase">Game Requests</h2>
       <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} />
      {gameRequests.length > 0 ? (
        <ul className="bg-black/20 p-4 rounded-lg max-h-[60vh] overflow-y-auto">
          {gameRequests.map(req => (
            <li key={req.id} className="p-4 border-b border-pink-500/20 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="flex-grow w-full">
                <p className="font-bold text-lg text-white">{req.gameTitle}</p>
                <p className="text-sm text-gray-400">Requested by: <span className="text-pink-400">{req.userEmail}</span></p>
                <p className="text-xs text-gray-500">{new Date(req.timestamp).toLocaleString()}</p>
              </div>
              <div className="flex-shrink-0 w-full sm:w-auto">
                {req.status === 'pending' ? (
                  <NeonButton color="cyan" size="sm" onClick={() => triggerFileUpload(req.id)} fullWidth>Approve</NeonButton>
                ) : (
                  <div className="text-right">
                    <span className="px-3 py-1.5 text-sm font-bold text-green-400 border-2 border-green-400/50 rounded-full bg-green-500/10 inline-block">Approved</span>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="bg-black/20 p-6 rounded-lg text-center">
            <p className="text-gray-400 mb-4">No game requests yet.</p>
            <p className="text-sm text-gray-500">Tip: Try using the "Simulate Data" button to verify the panel works.</p>
        </div>
      )}
    </div>
  );

  const renderOnlineFixRequests = () => (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold text-purple-400 tracking-widest uppercase">Online Fix Requests</h2>
      {onlineFixRequests.length > 0 ? (
        <ul className="bg-black/20 p-4 rounded-lg max-h-[60vh] overflow-y-auto">
          {onlineFixRequests.map(req => (
            <li key={req.id} className="p-4 border-b border-purple-500/20 transition-all duration-300">
              {approvingFixId === req.id ? (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <p className="font-bold text-lg text-white">{req.gameTitle}</p>
                    <p className="text-sm text-gray-400">Approving request from: <span className="text-purple-400">{req.userEmail}</span></p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 items-start">
                    <div>
                      <label className="block text-purple-300 text-sm font-bold mb-2">Upload ZIP File</label>
                      <label htmlFor={`fix-file-upload-${req.id}`} className="w-full cursor-pointer bg-gray-700/50 p-3 rounded-lg border-2 border-dashed border-purple-500/30 text-center text-gray-400 hover:bg-gray-700 hover:border-purple-500 transition-colors">Click to select ZIP</label>
                      <input id={`fix-file-upload-${req.id}`} type="file" accept=".zip,.rar,.7z" className="hidden" onChange={(e) => setFixFile(e.target.files?.[0] || null)} />
                      {fixFile && <p className="text-xs text-green-400 mt-2 truncate font-mono" title={fixFile.name}>Selected: {fixFile.name}</p>}
                    </div>
                    <div>
                      <label className="block text-purple-300 text-sm font-bold mb-2">Artwork</label>
                      <label htmlFor={`artwork-upload-${req.id}`} className="w-full cursor-pointer bg-gray-700/50 p-3 rounded-lg border-2 border-dashed border-purple-500/30 text-center text-gray-400 hover:bg-gray-700 hover:border-purple-500 transition-colors block mb-2">
                        {artworkFile ? artworkFile.name : 'Upload Image'}
                      </label>
                      <input id={`artwork-upload-${req.id}`} type="file" accept="image/*" className="hidden" onChange={handleArtworkChange} />
                      <div className="text-center text-gray-500 my-2">OR</div>
                      <input
                        type="text"
                        placeholder="Paste image URL"
                        value={artworkUrl}
                        onChange={handleArtworkUrlChange}
                        className="w-full px-3 py-2 bg-gray-700/50 border-2 border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                      />
                      {(artworkPreview || artworkUrl) && (
                        <img 
                          src={artworkPreview || artworkUrl} 
                          alt="Artwork preview" 
                          className="mt-2 h-32 w-auto object-cover rounded-md border-2 border-purple-500/50" 
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          onLoad={(e) => { e.currentTarget.style.display = 'block'; }}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <NeonButton color="green" onClick={handleConfirmFixApproval} disabled={!fixFile || (!artworkFile && !artworkUrl.trim())}>Confirm & Approve</NeonButton>
                    <button onClick={() => setApprovingFixId(null)} className="px-6 py-3 text-base bg-transparent border-2 border-red-400 text-red-400 rounded-md font-bold uppercase tracking-wider transition-all duration-300 hover:bg-red-400 hover:text-gray-900">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex-grow w-full">
                    <p className="font-bold text-lg text-white">{req.gameTitle}</p>
                    <p className="text-sm text-gray-400">Requested by: <span className="text-purple-400">{req.userEmail}</span></p>
                    <p className="text-xs text-gray-500">{new Date(req.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="flex-shrink-0 w-full sm:w-auto">
                    {req.status === 'pending' ? (
                      <NeonButton color="purple" size="sm" onClick={() => { setApprovingFixId(req.id); setFixFile(null); setArtworkFile(null); setArtworkPreview(null); setArtworkUrl(''); }} fullWidth>Approve</NeonButton>
                    ) : (
                      <div className="text-right">
                        <span className="px-3 py-1.5 text-sm font-bold text-green-400 border-2 border-green-400/50 rounded-full bg-green-500/10 inline-block">Approved</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No online fix requests yet.</p>
      )}
    </div>
  );

  const renderBypassRequests = () => (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold text-green-400 tracking-widest uppercase">Bypass Requests</h2>
      {bypassRequests.length > 0 ? (
        <ul className="bg-black/20 p-4 rounded-lg max-h-[60vh] overflow-y-auto">
          {bypassRequests.map(req => (
            <li key={req.id} className="p-4 border-b border-green-500/20 transition-all duration-300">
              {approvingBypassId === req.id ? (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <p className="font-bold text-lg text-white">{req.gameTitle}</p>
                    <p className="text-sm text-gray-400">Approving request from: <span className="text-green-400">{req.userEmail}</span></p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 items-start">
                    <div>
                      <label className="block text-green-300 text-sm font-bold mb-2">Upload ZIP File</label>
                      <label htmlFor={`bypass-file-upload-${req.id}`} className="w-full cursor-pointer bg-gray-700/50 p-3 rounded-lg border-2 border-dashed border-green-500/30 text-center text-gray-400 hover:bg-gray-700 hover:border-green-500 transition-colors">Click to select ZIP</label>
                      <input id={`bypass-file-upload-${req.id}`} type="file" accept=".zip,.rar,.7z" className="hidden" onChange={(e) => setBypassFile(e.target.files?.[0] || null)} />
                      {bypassFile && <p className="text-xs text-cyan-400 mt-2 truncate font-mono" title={bypassFile.name}>Selected: {bypassFile.name}</p>}
                    </div>
                    <div>
                      <label className="block text-green-300 text-sm font-bold mb-2">Artwork</label>
                      <label htmlFor={`bypass-artwork-upload-${req.id}`} className="w-full cursor-pointer bg-gray-700/50 p-3 rounded-lg border-2 border-dashed border-green-500/30 text-center text-gray-400 hover:bg-gray-700 hover:border-green-500 transition-colors block mb-2">
                        {bypassArtworkFile ? bypassArtworkFile.name : 'Upload Image'}
                      </label>
                      <input id={`bypass-artwork-upload-${req.id}`} type="file" accept="image/*" className="hidden" onChange={handleBypassArtworkChange} />
                      <div className="text-center text-gray-500 my-2">OR</div>
                      <input
                        type="text"
                        placeholder="Paste image URL"
                        value={bypassArtworkUrl}
                        onChange={handleBypassArtworkUrlChange}
                        className="w-full px-3 py-2 bg-gray-700/50 border-2 border-green-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                      />
                      {(bypassArtworkPreview || bypassArtworkUrl) && (
                        <img 
                          src={bypassArtworkPreview || bypassArtworkUrl} 
                          alt="Artwork preview" 
                          className="mt-2 h-32 w-auto object-cover rounded-md border-2 border-green-500/50" 
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          onLoad={(e) => { e.currentTarget.style.display = 'block'; }}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <NeonButton color="green" onClick={handleConfirmBypassApproval} disabled={!bypassFile || (!bypassArtworkFile && !bypassArtworkUrl.trim())}>Confirm & Approve</NeonButton>
                    <button onClick={() => setApprovingBypassId(null)} className="px-6 py-3 text-base bg-transparent border-2 border-red-400 text-red-400 rounded-md font-bold uppercase tracking-wider transition-all duration-300 hover:bg-red-400 hover:text-gray-900">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex-grow w-full">
                    <p className="font-bold text-lg text-white">{req.gameTitle}</p>
                    <p className="text-sm text-gray-400">Requested by: <span className="text-green-400">{req.userEmail}</span></p>
                    <p className="text-xs text-gray-500">{new Date(req.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="flex-shrink-0 w-full sm:w-auto">
                    {req.status === 'pending' ? (
                      <NeonButton color="green" size="sm" onClick={() => { setApprovingBypassId(req.id); setBypassFile(null); setBypassArtworkFile(null); setBypassArtworkPreview(null); setBypassArtworkUrl(''); }} fullWidth>Approve</NeonButton>
                    ) : (
                      <div className="text-right">
                        <span className="px-3 py-1.5 text-sm font-bold text-cyan-400 border-2 border-cyan-400/50 rounded-full bg-cyan-500/10 inline-block">Approved</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No bypass requests yet.</p>
      )}
    </div>
  );

  const renderMessages = () => (
    <div className="h-full flex flex-col">
      <h2 className="text-3xl font-bold text-cyan-400 tracking-widest uppercase mb-4">User Messages</h2>
      <div className="flex-grow flex flex-col lg:flex-row gap-4 overflow-hidden">
        <div className="w-full lg:w-1/3 bg-black/20 p-2 rounded-lg overflow-y-auto h-48 lg:h-auto flex-shrink-0">
          {Object.keys(conversations).length > 0 ? (
            Object.keys(conversations).map(email => (
                <div
                key={email}
                onClick={() => setSelectedUser(email)}
                className={`p-3 rounded-lg cursor-pointer ${selectedUser === email ? 'bg-cyan-500/30' : 'hover:bg-gray-700/50'}`}
                >
                <p className="font-bold text-white truncate">{email}</p>
                <p className="text-sm text-gray-400 truncate">{conversations[email].slice(-1)[0].content}</p>
                </div>
            ))
          ) : (
            <p className="text-gray-400 p-4">No messages yet.</p>
          )}
        </div>
        <div className="w-full lg:w-2/3 flex flex-col bg-black/20 p-4 rounded-lg flex-grow">
          {selectedUser ? (
            <>
              <div className="flex-grow overflow-y-auto mb-4">
                {[...conversations[selectedUser]]
                    .sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                    .map(msg => (
                    <div key={msg.id} className={`flex ${msg.from === 'admin' ? 'justify-end' : 'justify-start'} mb-4`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${msg.from === 'admin' ? 'bg-purple-800' : 'bg-gray-700'}`}>
                        <p className="text-white">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.from === 'admin' ? 'text-right' : 'text-left'} text-gray-400`}>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleReply} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Reply to ${selectedUser}...`}
                  className="flex-grow w-full px-4 py-2 bg-gray-900/70 border-2 border-cyan-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <div className="w-full sm:w-auto flex-shrink-0">
                    <NeonButton type="submit" color="cyan" size="md" fullWidth>Reply</NeonButton>
                </div>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">Select a conversation to view messages.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderVisitorLogs = () => (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-yellow-400 tracking-widest uppercase">Visitor Logs</h2>
            <div className="flex gap-2">
                 <NeonButton color="cyan" size="sm" onClick={simulateIncomingData}>
                    Simulate Visitor
                </NeonButton>
                {visitorLogs.length > 0 && (
                    <NeonButton color="red" size="sm" onClick={handleClearLogs}>
                        Clear Logs
                    </NeonButton>
                )}
            </div>
        </div>
        {visitorLogs.length > 0 ? (
            <ul className="bg-black/20 p-4 rounded-lg max-h-[60vh] overflow-y-auto">
                {visitorLogs.map(log => (
                    <li key={log.id} className="p-3 border-b border-yellow-500/20 flex justify-between items-center gap-4">
                        <p className="font-bold text-white">{log.username}</p>
                        <p className="text-sm text-gray-400">{new Date(log.timestamp).toLocaleString()}</p>
                    </li>
                ))}
            </ul>
        ) : (
            <div className="bg-black/20 p-6 rounded-lg text-center">
                 <p className="text-gray-400">No visitor logs yet.</p>
                 <p className="text-sm text-gray-500 mt-2">Click "Simulate Visitor" to test this panel.</p>
            </div>
        )}
    </div>
  );

  const renderCurrentView = () => {
    switch(view) {
        case 'requests': return renderRequests();
        case 'onlineFixes': return renderOnlineFixRequests();
        case 'bypassRequests': return renderBypassRequests();
        case 'messages': return renderMessages();
        case 'visitorLogs': return renderVisitorLogs();
        default: return renderRequests();
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b-2 border-purple-500/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <LogoIcon className="h-10 w-auto" />
              <div className="hidden md:block">
                  <span className="text-2xl font-bold tracking-wider text-white block">ADMIN PANEL</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
                <button 
                    onClick={refreshData} 
                    className="text-xs text-cyan-400 border border-cyan-500/30 px-2 py-1 rounded hover:bg-cyan-900/30 transition-colors flex items-center gap-1"
                    title="Force refresh data from local storage"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                   Force Refresh
                </button>
              <span className="font-mono text-sm text-gray-300 hidden sm:inline">{currentUser.email}</span>
              <button onClick={onLogout} className="px-3 py-2 text-sm font-bold bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8">
        <aside className="md:w-64 flex-shrink-0">
          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
            <button onClick={() => setView('requests')} className={`w-full text-left p-4 rounded-lg font-bold transition-colors flex-shrink-0 whitespace-nowrap ${view === 'requests' ? 'bg-pink-500/80 text-white' : 'bg-gray-800/50 hover:bg-gray-700/50'}`}>
              Game Requests
            </button>
            <button onClick={() => setView('onlineFixes')} className={`w-full text-left p-4 rounded-lg font-bold transition-colors flex-shrink-0 whitespace-nowrap ${view === 'onlineFixes' ? 'bg-purple-500/80 text-white' : 'bg-gray-800/50 hover:bg-gray-700/50'}`}>
              Online Fix Requests
            </button>
            <button onClick={() => setView('bypassRequests')} className={`w-full text-left p-4 rounded-lg font-bold transition-colors flex-shrink-0 whitespace-nowrap ${view === 'bypassRequests' ? 'bg-green-500/80 text-white' : 'bg-gray-800/50 hover:bg-gray-700/50'}`}>
              Bypass Requests
            </button>
            <button onClick={() => setView('messages')} className={`w-full text-left p-4 rounded-lg font-bold transition-colors flex-shrink-0 whitespace-nowrap ${view === 'messages' ? 'bg-cyan-500/80 text-white' : 'bg-gray-800/50 hover:bg-gray-700/50'}`}>
              Messages
            </button>
            <button onClick={() => setView('visitorLogs')} className={`relative w-full text-left p-4 rounded-lg font-bold transition-colors flex-shrink-0 whitespace-nowrap ${view === 'visitorLogs' ? 'bg-yellow-500/80 text-white' : 'bg-gray-800/50 hover:bg-gray-700/50'}`}>
              <div className="flex items-center gap-2">
                  <AnalyticsIcon className="w-5 h-5" />
                  <span>Visitor Logs</span>
                  {visitorLogs.length > 0 && (
                    <span className="absolute top-2 right-2 flex h-5 w-5">
                      <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-xs items-center justify-center font-bold">{visitorLogs.length}</span>
                    </span>
                  )}
              </div>
            </button>
          </nav>
          
          <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg text-xs text-gray-400 hidden md:block">
            <p className="font-bold text-blue-400 mb-2">Local Mode Info:</p>
            <p>This admin panel uses <strong>browser storage</strong>.</p>
            <p className="mt-2">You will only see requests made from <strong>this specific computer and browser</strong>.</p>
            <p className="mt-2">Requests from other devices will not appear here unless a backend server is connected.</p>
            <div className="mt-3">
                 <button onClick={simulateIncomingData} className="text-cyan-400 hover:underline font-bold">Simulate Data</button>
                 <span className="mx-1">to test.</span>
            </div>
          </div>
        </aside>
        <div className="flex-grow" style={{maxHeight: '75vh'}}>
          {renderCurrentView()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
