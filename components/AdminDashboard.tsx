import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';
import type { User, GameRequest, Message, OnlineFixRequest, BypassRequest, VisitorLog } from '../types';
import LogoIcon from './icons/LogoIcon';
import NeonButton from './common/NeonButton';
import { Megaphone, Trash2, CheckCircle, XCircle } from 'lucide-react';

const ADMIN_EMAILS = ['rafaproject06@gmail.com', 'admin226@gmail.com'];

interface AdminDashboardProps {
  onLogout: () => void;
  currentUser: Omit<User, 'password'>;
}

type AdminView = 'requests' | 'messages' | 'onlineFixes' | 'bypassRequests' | 'announcements';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, currentUser }) => {
  const [view, setView] = useState<AdminView>('requests');
  const [gameRequests, setGameRequests] = useState<any[]>([]);
  const [onlineFixRequests, setOnlineFixRequests] = useState<any[]>([]);
  const [bypassRequests, setBypassRequests] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ content: '', type: 'info' as 'info' | 'warning' | 'critical' });
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Game request approval state
  const [approvingRequestId, setApprovingRequestId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Online fix approval state
  const [approvingFixId, setApprovingFixId] = useState<string | null>(null);
  const [fixFile, setFixFile] = useState<File | null>(null);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const [artworkUrl, setArtworkUrl] = useState('');

  // Bypass request approval state
  const [approvingBypassId, setApprovingBypassId] = useState<string | null>(null);
  const [bypassFile, setBypassFile] = useState<File | null>(null);
  const [bypassArtworkFile, setBypassArtworkFile] = useState<File | null>(null);
  const [bypassArtworkPreview, setBypassArtworkPreview] = useState<string | null>(null);
  const [bypassArtworkUrl, setBypassArtworkUrl] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Real-time Firestore Listeners
  useEffect(() => {
    const unsubRequests = onSnapshot(query(collection(db, 'gameRequests'), orderBy('timestamp', 'desc')), (snapshot) => {
      setGameRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubFixes = onSnapshot(query(collection(db, 'onlineFixRequests'), orderBy('timestamp', 'desc')), (snapshot) => {
      setOnlineFixRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubBypass = onSnapshot(query(collection(db, 'bypassRequests'), orderBy('timestamp', 'desc')), (snapshot) => {
      setBypassRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubMessages = onSnapshot(query(collection(db, 'helpMessages'), orderBy('timestamp', 'asc')), (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubAnnouncements = onSnapshot(query(collection(db, 'announcements'), orderBy('timestamp', 'desc')), (snapshot) => {
      setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubRequests();
      unsubFixes();
      unsubBypass();
      unsubMessages();
      unsubAnnouncements();
    };
  }, []);

  const refreshData = () => {
    setLastRefreshed(new Date());
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedUser]);

  // Group messages by user email into conversations
  const conversations: Record<string, any[]> = {};
  messages.forEach(msg => {
    const isAdmin = ADMIN_EMAILS.includes(msg.from) || msg.from === 'admin';
    const userEmail = isAdmin ? msg.to : msg.from;
    const ticketId = msg.ticketId || `TCK-${userEmail?.replace(/[@.]/g, '-')}`;

    if (userEmail && !ADMIN_EMAILS.includes(userEmail) && userEmail !== 'admin') {
      if (!conversations[userEmail]) conversations[userEmail] = [];
      conversations[userEmail].push({ ...msg, ticketId });
    }
  });

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedUser) return;
    const ticketId = conversations[selectedUser]?.[0]?.ticketId || `TCK-${selectedUser.replace(/[@.]/g, '-')}`;

    try {
      await addDoc(collection(db, 'helpMessages'), {
        from: currentUser.email,
        to: selectedUser,
        ticketId: ticketId,
        content: replyContent.trim(),
        timestamp: serverTimestamp(),
        isRead: false,
      });
      setReplyContent('');
    } catch (error) {
      console.error('Failed to send reply:', error);
    }
  };

  const sendApprovalNotification = async (userEmail: string, content: string) => {
    try {
      await addDoc(collection(db, 'helpMessages'), {
        from: 'admin',
        to: userEmail,
        content,
        timestamp: serverTimestamp(),
        isRead: false,
      });
    } catch (error) {
      console.error("Failed to send approval notification:", error);
    }
  };




  const triggerFileUpload = (requestId: string) => {
    setApprovingRequestId(requestId);
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !approvingRequestId) return;

    // In a real app, you would upload to Supabase Storage here and get a public URL
    // For this migration, we'll use a placeholder URL as before but update Firestore
    const fileUrl = "https://placeholder-url.com/" + file.name;

    try {
      const requestRef = doc(db, 'gameRequests', approvingRequestId);
      await updateDoc(requestRef, {
        status: 'approved',
        fileName: file.name,
        fileUrl: fileUrl
      });

      const approvedRequest = gameRequests.find(req => req.id === approvingRequestId);
      if (approvedRequest) {
        sendApprovalNotification(
          approvedRequest.userEmail,
          `Your game request for "${approvedRequest.gameTitle}" has been approved! You can now download it from your Library.`
        );
      }
    } catch (error) {
      console.error("Failed to approve game request:", error);
    } finally {
      setApprovingRequestId(null);
      event.target.value = '';
    }
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

  const handleConfirmFixApproval = async () => {
    if (!fixFile || !approvingFixId || (!artworkPreview && !artworkUrl.trim())) return;

    try {
      const fileUrl = "https://placeholder-fix-url.com/" + fixFile.name;
      const imageUrl = artworkPreview || artworkUrl;

      const requestRef = doc(db, 'onlineFixRequests', approvingFixId);
      await updateDoc(requestRef, {
        status: 'approved',
        fileName: fixFile.name,
        fileUrl,
        imageUrl
      });

      const approvedRequest = onlineFixRequests.find(req => req.id === approvingFixId);
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
    } catch (error) {
      console.error("Error approving online fix:", error);
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

  const handleConfirmBypassApproval = async () => {
    if (!bypassFile || !approvingBypassId || (!bypassArtworkPreview && !bypassArtworkUrl.trim())) return;

    try {
      const fileUrl = "https://placeholder-bypass-url.com/" + bypassFile.name;
      const imageUrl = bypassArtworkPreview || bypassArtworkUrl;

      const requestRef = doc(db, 'bypassRequests', approvingBypassId);
      await updateDoc(requestRef, {
        status: 'approved',
        fileName: bypassFile.name,
        fileUrl,
        imageUrl
      });

      const approvedRequest = bypassRequests.find(req => req.id === approvingBypassId);
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
    } catch (error) {
      console.error("Error approving bypass request:", error);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.content.trim()) return;

    try {
      await addDoc(collection(db, 'announcements'), {
        content: newAnnouncement.content,
        type: newAnnouncement.type,
        timestamp: serverTimestamp(),
        active: true
      });
      setNewAnnouncement({ content: '', type: 'info' });
    } catch (error) {
      console.error("Failed to create announcement:", error);
    }
  };

  const toggleAnnouncement = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'announcements', id), { active: !currentStatus });
    } catch (error) {
      console.error("Failed to toggle announcement:", error);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (window.confirm('Delete this announcement?')) {
      try {
        await deleteDoc(doc(db, 'announcements', id));
      } catch (error) {
        console.error("Failed to delete announcement:", error);
      }
    }
  };

  const renderRequests = () => (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold text-red-400 tracking-widest uppercase">Game Requests</h2>
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} />
      {gameRequests.length > 0 ? (
        <ul className="bg-black/20 p-4 rounded-lg max-h-[60vh] overflow-y-auto">
          {gameRequests.map(req => (
            <li key={req.id} className="p-4 border-b border-red-500/20 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="flex-grow w-full">
                <p className="font-bold text-lg text-white">{req.gameTitle}</p>
                <p className="text-sm text-gray-400">Requested by: <span className="text-red-400">{req.userEmail}</span></p>
                <p className="text-xs text-gray-500">
                  {req.timestamp?.toDate ? new Date(req.timestamp.toDate()).toLocaleString() : 'Loading...'}
                </p>
              </div>
              <div className="flex-shrink-0 w-full sm:w-auto">
                {req.status === 'pending' ? (
                  <NeonButton color="cyan" size="sm" onClick={() => triggerFileUpload(req.id)} fullWidth>Approve</NeonButton>
                ) : (
                  <div className="text-right">
                    <span className="px-3 py-1.5 text-sm font-bold text-red-400 border-2 border-red-400/50 rounded-full bg-red-500/10 inline-block">Approved</span>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="bg-black/20 p-6 rounded-lg text-center">
          <p className="text-gray-400 mb-4">No game requests yet.</p>
        </div>
      )}
    </div>
  );

  const renderOnlineFixRequests = () => (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold text-red-400 tracking-widest uppercase">Online Fix Requests</h2>
      {onlineFixRequests.length > 0 ? (
        <ul className="bg-black/20 p-4 rounded-lg max-h-[60vh] overflow-y-auto">
          {onlineFixRequests.map(req => (
            <li key={req.id} className="p-4 border-b border-red-500/20 transition-all duration-300">
              {approvingFixId === req.id ? (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <p className="font-bold text-lg text-white">{req.gameTitle}</p>
                    <p className="text-sm text-gray-400">Approving request from: <span className="text-red-400">{req.userEmail}</span></p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 items-start">
                    <div>
                      <label className="block text-red-300 text-sm font-bold mb-2">Upload ZIP File</label>
                      <label htmlFor={`fix-file-upload-${req.id}`} className="w-full cursor-pointer bg-gray-700/50 p-3 rounded-lg border-2 border-dashed border-red-500/30 text-center text-gray-400 hover:bg-gray-700 hover:border-red-500 transition-colors">Click to select ZIP</label>
                      <input id={`fix-file-upload-${req.id}`} type="file" accept=".zip,.rar,.7z" className="hidden" onChange={(e) => setFixFile(e.target.files?.[0] || null)} />
                      {fixFile && <p className="text-xs text-red-400 mt-2 truncate font-mono" title={fixFile.name}>Selected: {fixFile.name}</p>}
                    </div>
                    <div>
                      <label className="block text-red-300 text-sm font-bold mb-2">Artwork</label>
                      <label htmlFor={`artwork-upload-${req.id}`} className="w-full cursor-pointer bg-gray-700/50 p-3 rounded-lg border-2 border-dashed border-red-500/30 text-center text-gray-400 hover:bg-gray-700 hover:border-red-500 transition-colors block mb-2">
                        {artworkFile ? artworkFile.name : 'Upload Image'}
                      </label>
                      <input id={`artwork-upload-${req.id}`} type="file" accept="image/*" className="hidden" onChange={handleArtworkChange} />
                      <div className="text-center text-gray-500 my-2">OR</div>
                      <input
                        type="text"
                        placeholder="Paste image URL"
                        value={artworkUrl}
                        onChange={handleArtworkUrlChange}
                        className="w-full px-3 py-2 bg-gray-700/50 border-2 border-red-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300"
                      />
                      {(artworkPreview || artworkUrl) && (
                        <img
                          src={artworkPreview || artworkUrl}
                          alt="Artwork preview"
                          className="mt-2 h-32 w-auto object-cover rounded-md border-2 border-red-500/50"
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
                    <p className="text-sm text-gray-400">Requested by: <span className="text-red-400">{req.userEmail}</span></p>
                    <p className="text-xs text-gray-500">
                      {req.timestamp?.toDate ? new Date(req.timestamp.toDate()).toLocaleString() : 'Loading...'}
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-full sm:w-auto">
                    {req.status === 'pending' ? (
                      <NeonButton color="purple" size="sm" onClick={() => { setApprovingFixId(req.id); setFixFile(null); setArtworkFile(null); setArtworkPreview(null); setArtworkUrl(''); }} fullWidth>Approve</NeonButton>
                    ) : (
                      <div className="text-right">
                        <span className="px-3 py-1.5 text-sm font-bold text-red-400 border-2 border-red-400/50 rounded-full bg-red-500/10 inline-block">Approved</span>
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
      <h2 className="text-3xl font-bold text-red-400 tracking-widest uppercase">Bypass Requests</h2>
      {bypassRequests.length > 0 ? (
        <ul className="bg-black/20 p-4 rounded-lg max-h-[60vh] overflow-y-auto">
          {bypassRequests.map(req => (
            <li key={req.id} className="p-4 border-b border-red-500/20 transition-all duration-300">
              {approvingBypassId === req.id ? (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <p className="font-bold text-lg text-white">{req.gameTitle}</p>
                    <p className="text-sm text-gray-400">Approving request from: <span className="text-red-400">{req.userEmail}</span></p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 items-start">
                    <div>
                      <label className="block text-red-300 text-sm font-bold mb-2">Upload ZIP File</label>
                      <label htmlFor={`bypass-file-upload-${req.id}`} className="w-full cursor-pointer bg-gray-700/50 p-3 rounded-lg border-2 border-dashed border-red-500/30 text-center text-gray-400 hover:bg-gray-700 hover:border-red-500 transition-colors">Click to select ZIP</label>
                      <input id={`bypass-file-upload-${req.id}`} type="file" accept=".zip,.rar,.7z" className="hidden" onChange={(e) => setBypassFile(e.target.files?.[0] || null)} />
                      {bypassFile && <p className="text-xs text-red-400 mt-2 truncate font-mono" title={bypassFile.name}>Selected: {bypassFile.name}</p>}
                    </div>
                    <div>
                      <label className="block text-red-300 text-sm font-bold mb-2">Artwork</label>
                      <label htmlFor={`bypass-artwork-upload-${req.id}`} className="w-full cursor-pointer bg-gray-700/50 p-3 rounded-lg border-2 border-dashed border-red-500/30 text-center text-gray-400 hover:bg-gray-700 hover:border-red-500 transition-colors block mb-2">
                        {bypassArtworkFile ? bypassArtworkFile.name : 'Upload Image'}
                      </label>
                      <input id={`bypass-artwork-upload-${req.id}`} type="file" accept="image/*" className="hidden" onChange={handleBypassArtworkChange} />
                      <div className="text-center text-gray-500 my-2">OR</div>
                      <input
                        type="text"
                        placeholder="Paste image URL"
                        value={bypassArtworkUrl}
                        onChange={handleBypassArtworkUrlChange}
                        className="w-full px-3 py-2 bg-gray-700/50 border-2 border-red-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300"
                      />
                      {(bypassArtworkPreview || bypassArtworkUrl) && (
                        <img
                          src={bypassArtworkPreview || bypassArtworkUrl}
                          alt="Artwork preview"
                          className="mt-2 h-32 w-auto object-cover rounded-md border-2 border-red-500/50"
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
                    <p className="text-sm text-gray-400">Requested by: <span className="text-red-400">{req.userEmail}</span></p>
                    <p className="text-xs text-gray-500">
                      {req.timestamp?.toDate ? new Date(req.timestamp.toDate()).toLocaleString() : 'Loading...'}
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-full sm:w-auto">
                    {req.status === 'pending' ? (
                      <NeonButton color="green" size="sm" onClick={() => { setApprovingBypassId(req.id); setBypassFile(null); setBypassArtworkFile(null); setBypassArtworkPreview(null); setBypassArtworkUrl(''); }} fullWidth>Approve</NeonButton>
                    ) : (
                      <div className="text-right">
                        <span className="px-3 py-1.5 text-sm font-bold text-red-400 border-2 border-red-400/50 rounded-full bg-red-500/10 inline-block">Approved</span>
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
    <div className="h-full flex flex-col gap-4">
      <h2 className="text-2xl font-black text-white uppercase tracking-wide flex items-center gap-3">
        <span className="w-2 h-7 bg-red-600 rounded-full inline-block" />
        User Support Messages
      </h2>
      <div className="flex-grow flex flex-col lg:flex-row gap-4 overflow-hidden min-h-0">

        {/* User list */}
        <div className="w-full lg:w-1/3 bg-black/30 rounded-xl border border-red-900/20 overflow-y-auto flex-shrink-0">
          {Object.keys(conversations).length > 0 ? (
            Object.keys(conversations).map(email => {
              const lastMsg = conversations[email].slice(-1)[0];
              const unread = conversations[email].filter(m => !ADMIN_EMAILS.includes(m.from) && m.from !== 'admin' && !m.isRead).length;
              return (
                <div
                  key={email}
                  onClick={() => setSelectedUser(email)}
                  className={`p-4 border-b border-white/5 cursor-pointer transition-all ${selectedUser === email
                    ? 'bg-red-700/30 border-l-4 border-l-red-600'
                    : 'hover:bg-white/5 border-l-4 border-l-transparent'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-white text-sm truncate max-w-[75%]">{email}</p>
                    {unread > 0 && (
                      <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{unread}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{lastMsg.content}</p>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center h-full p-8">
              <p className="text-gray-500 text-sm">No user messages yet.</p>
            </div>
          )}
        </div>

        {/* Chat area */}
        <div className="w-full lg:w-2/3 flex flex-col bg-black/20 rounded-xl border border-red-900/20 overflow-hidden">
          {selectedUser ? (
            <>
              <div className="px-4 py-3 border-b border-red-900/20 bg-red-900/10">
                <p className="text-sm font-bold text-white">Conversation with: <span className="text-red-400">{selectedUser}</span></p>
              </div>
              <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {[...conversations[selectedUser]]
                  .sort((a, b) => {
                    const at = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
                    const bt = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
                    return at - bt;
                  })
                  .map(msg => {
                    const isAdmin = ADMIN_EMAILS.includes(msg.from) || msg.from === 'admin';
                    return (
                      <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] px-4 py-2.5 rounded-xl ${isAdmin
                          ? 'bg-red-700 text-white rounded-tr-sm'
                          : 'bg-gray-800 text-gray-100 border border-white/5 rounded-tl-sm'
                          }`}>
                          {isAdmin && <p className="text-[10px] text-red-200 font-bold uppercase tracking-widest mb-1">You (Admin)</p>}
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-[10px] opacity-40 mt-1 text-right">
                            {msg.timestamp?.toDate ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleReply} className="p-4 border-t border-red-900/20 flex gap-3">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Reply to ${selectedUser}...`}
                  className="flex-grow px-4 py-3 bg-black/40 border border-red-900/30 rounded-xl text-white focus:outline-none focus:border-red-600/50 transition-all text-sm placeholder-gray-600"
                />
                <button
                  type="submit"
                  disabled={!replyContent.trim()}
                  className="px-6 py-3 bg-red-700 hover:bg-red-600 disabled:opacity-40 text-white font-bold rounded-xl transition-all text-sm flex-shrink-0"
                >
                  Send Reply
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full p-8">
              <p className="text-gray-500 text-sm">← Select a user to view their messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch (view) {
      case 'requests': return renderRequests();
      case 'onlineFixes': return renderOnlineFixRequests();
      case 'bypassRequests': return renderBypassRequests();
      case 'messages': return renderMessages();
      case 'announcements': return renderAnnouncements();
      default: return renderRequests();
    }
  }

  const renderAnnouncements = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-red-400 tracking-widest uppercase">Global Announcements</h2>

      <form onSubmit={handleCreateAnnouncement} className="bg-black/20 p-6 rounded-xl border border-red-500/20 space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Announcement Content</label>
          <textarea
            value={newAnnouncement.content}
            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
            className="w-full px-4 py-3 bg-gray-900/50 border-2 border-red-500/20 rounded-xl text-white focus:outline-none focus:border-red-500 transition-all h-24 resize-none"
            placeholder="Type your global announcement here..."
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow">
            <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Type</label>
            <select
              value={newAnnouncement.type}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value as any })}
              className="w-full px-4 py-3 bg-gray-900/50 border-2 border-red-500/20 rounded-xl text-white focus:outline-none focus:border-red-500 transition-all appearance-none"
            >
              <option value="info">Info (Blue)</option>
              <option value="warning">Warning (Yellow)</option>
              <option value="critical">Critical (Red)</option>
            </select>
          </div>
          <div className="flex items-end">
            <NeonButton type="submit" color="orange" size="md" fullWidth>Publish Announcement</NeonButton>
          </div>
        </div>
      </form>

      <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
        {announcements.map(ann => (
          <div key={ann.id} className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${ann.active ? 'bg-red-500/10 border-red-500/30' : 'bg-gray-800/10 border-white/5 opacity-60'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${ann.type === 'critical' ? 'bg-red-500/20 text-red-400' : ann.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-medium">{ann.content}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">
                  {ann.timestamp?.toDate ? ann.timestamp.toDate().toLocaleString() : 'Just now'} • {ann.type}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toggleAnnouncement(ann.id, ann.active)} className={`p-2 rounded-lg transition-colors ${ann.active ? 'text-red-400 hover:bg-red-400/10' : 'text-gray-500 hover:bg-gray-500/10'}`}>
                {ann.active ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </button>
              <button onClick={() => deleteAnnouncement(ann.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b-2 border-red-500/30">
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
                className="text-xs text-red-400 border border-red-500/30 px-2 py-1 rounded hover:bg-red-900/30 transition-colors flex items-center gap-1"
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
            <button onClick={() => setView('requests')} className={`w-full text-left p-4 rounded-lg font-bold transition-colors flex-shrink-0 whitespace-nowrap ${view === 'requests' ? 'bg-red-500/80 text-white' : 'bg-gray-800/50 hover:bg-gray-700/50'}`}>
              Game Requests
            </button>
            <button onClick={() => setView('onlineFixes')} className={`w-full text-left p-4 rounded-lg font-bold transition-colors flex-shrink-0 whitespace-nowrap ${view === 'onlineFixes' ? 'bg-red-500/80 text-white' : 'bg-gray-800/50 hover:bg-gray-700/50'}`}>
              Online Fix Requests
            </button>
            <button onClick={() => setView('bypassRequests')} className={`w-full text-left p-4 rounded-lg font-bold transition-colors flex-shrink-0 whitespace-nowrap ${view === 'bypassRequests' ? 'bg-red-500/80 text-white' : 'bg-gray-800/50 hover:bg-gray-700/50'}`}>
              Bypass Requests
            </button>
            <button onClick={() => setView('messages')} className={`w-full text-left p-4 rounded-lg font-bold transition-colors flex-shrink-0 whitespace-nowrap ${view === 'messages' ? 'bg-red-500/80 text-white' : 'bg-gray-800/50 hover:bg-gray-700/50'}`}>
              Messages
            </button>
            <button onClick={() => setView('announcements')} className={`w-full text-left p-4 rounded-lg font-bold transition-colors flex-shrink-0 whitespace-nowrap flex items-center gap-2 ${view === 'announcements' ? 'bg-red-500/80 text-white' : 'bg-gray-800/50 hover:bg-gray-700/50'}`}>
              <Megaphone className="w-5 h-5" />
              <span>Announcements</span>
            </button>
          </nav>
        </aside>
        <div className="flex-grow" style={{ maxHeight: '75vh' }}>
          {renderCurrentView()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

