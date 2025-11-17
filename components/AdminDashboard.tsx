import React, { useState, useEffect, useRef } from 'react';
import type { User, GameRequest, Message } from '../types';
import LogoIcon from './icons/LogoIcon';
import NeonButton from './common/NeonButton';

interface AdminDashboardProps {
  onLogout: () => void;
  currentUser: User;
}

type AdminView = 'requests' | 'messages';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, currentUser }) => {
  const [view, setView] = useState<AdminView>('requests');
  const [gameRequests, setGameRequests] = useState<GameRequest[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [approvingRequestId, setApprovingRequestId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load data from localStorage on mount
    const storedRequests = JSON.parse(localStorage.getItem('gameRequests') || '[]');
    const storedMessages = JSON.parse(localStorage.getItem('messages') || '[]');
    setGameRequests(storedRequests.sort((a: GameRequest, b: GameRequest) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    setMessages(storedMessages);
  }, []);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedUser]);


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

    const newReply: Message = {
      id: Date.now(),
      from: 'admin',
      to: selectedUser,
      content: replyContent,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    const updatedMessages = [...messages, newReply];
    setMessages(updatedMessages);
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
    setReplyContent('');
  };

  const triggerFileUpload = (requestId: number) => {
    setApprovingRequestId(requestId);
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !approvingRequestId) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const fileUrl = loadEvent.target?.result as string;
      
      // FIX: Explicitly cast 'approved' to the literal type 'approved' to match the GameRequest['status'] type.
      // This resolves the TypeScript error where 'approved' was inferred as a generic string.
      const updatedRequests = gameRequests.map(req =>
        req.id === approvingRequestId 
        ? { ...req, status: 'approved' as 'approved', fileName: file.name, fileUrl } 
        : req
      );
      setGameRequests(updatedRequests.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      localStorage.setItem('gameRequests', JSON.stringify(updatedRequests));
      setApprovingRequestId(null);
    };
    reader.readAsDataURL(file);
    event.target.value = ''; // Reset file input
  };

  const renderRequests = () => (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold text-pink-400 tracking-widest uppercase">Game Requests</h2>
       <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        />
      {gameRequests.length > 0 ? (
        <ul className="bg-black/20 p-4 rounded-lg max-h-[60vh] overflow-y-auto">
          {gameRequests.map(req => (
            <li key={req.id} className="p-4 border-b border-pink-500/20 flex justify-between items-center gap-4">
              <div>
                <p className="font-bold text-lg text-white">{req.gameTitle}</p>
                <p className="text-sm text-gray-400">Requested by: <span className="text-pink-400">{req.userEmail}</span></p>
                <p className="text-xs text-gray-500">{new Date(req.timestamp).toLocaleString()}</p>
              </div>
              <div className="text-right flex-shrink-0">
                {req.status === 'pending' ? (
                  <NeonButton color="cyan" size="sm" onClick={() => triggerFileUpload(req.id)}>Approve</NeonButton>
                ) : (
                  <span className="px-3 py-1.5 text-sm font-bold text-green-400 border-2 border-green-400/50 rounded-full bg-green-500/10">
                    Approved
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No game requests yet.</p>
      )}
    </div>
  );

  const renderMessages = () => (
    <div className="h-full flex flex-col">
      <h2 className="text-3xl font-bold text-cyan-400 tracking-widest uppercase mb-4">User Messages</h2>
      <div className="flex-grow flex gap-4 overflow-hidden">
        {/* Conversation List */}
        <div className="w-1/3 bg-black/20 p-2 rounded-lg overflow-y-auto">
          {Object.keys(conversations).map(email => (
            <div
              key={email}
              onClick={() => setSelectedUser(email)}
              className={`p-3 rounded-lg cursor-pointer ${selectedUser === email ? 'bg-cyan-500/30' : 'hover:bg-gray-700/50'}`}
            >
              <p className="font-bold text-white truncate">{email}</p>
              <p className="text-sm text-gray-400 truncate">{conversations[email].slice(-1)[0].content}</p>
            </div>
          ))}
        </div>
        
        {/* Message View */}
        <div className="w-2/3 flex flex-col bg-black/20 p-4 rounded-lg">
          {selectedUser ? (
            <>
              <div className="flex-grow overflow-y-auto mb-4">
                {conversations[selectedUser]
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
              <form onSubmit={handleReply} className="flex gap-2">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Reply to ${selectedUser}...`}
                  className="flex-grow px-4 py-2 bg-gray-900/70 border-2 border-cyan-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <NeonButton type="submit" color="cyan" size="md">Reply</NeonButton>
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

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b-2 border-purple-500/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <LogoIcon className="h-10 w-auto" />
              <span className="text-2xl font-bold tracking-wider text-white hidden md:block">ADMIN PANEL</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm text-gray-300">{currentUser.email}</span>
              <button onClick={onLogout} className="px-3 py-2 text-sm font-bold bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8">
        <aside className="md:w-64 flex-shrink-0">
          <nav className="flex md:flex-col gap-2">
            <button onClick={() => setView('requests')} className={`w-full text-left p-4 rounded-lg font-bold transition-colors ${view === 'requests' ? 'bg-pink-500/80 text-white' : 'bg-gray-800/50 hover:bg-gray-700/50'}`}>
              Game Requests
            </button>
            <button onClick={() => setView('messages')} className={`w-full text-left p-4 rounded-lg font-bold transition-colors ${view === 'messages' ? 'bg-cyan-500/80 text-white' : 'bg-gray-800/50 hover:bg-gray-700/50'}`}>
              Messages
            </button>
          </nav>
        </aside>
        <div className="flex-grow" style={{maxHeight: '75vh'}}>
          {view === 'requests' ? renderRequests() : renderMessages()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;