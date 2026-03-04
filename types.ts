export interface Game {
  id: number;
  title: string;
  genre: string;
  imageUrl: string;
  rating: number;
}

export interface User {
  name: string;
  username: string;
  dob: string; // Date of Birth
  email: string;
  password: string;
  photoURL?: string;
}

export interface GameRequest {
  id: number;
  userEmail: string;
  gameTitle: string;
  timestamp: string;
  status: 'pending' | 'approved';
  fileName?: string;
  fileUrl?: string;
}

export interface OnlineFixRequest {
  id: number;
  userEmail: string;
  gameTitle: string;
  timestamp: string;
  status: 'pending' | 'approved';
  fileName?: string;
  fileUrl?: string;
  imageUrl?: string;
}

export interface BypassRequest {
  id: number;
  userEmail: string;
  gameTitle: string;
  timestamp: string;
  status: 'pending' | 'approved';
  fileName?: string;
  fileUrl?: string;
  imageUrl?: string;
}

export interface Message {
  id: number;
  from: string; // user email or 'admin'
  to: string; // user email or 'admin'
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface VisitorLog {
  id: number;
  timestamp: string;
  username: string;
}

export interface Announcement {
  id?: string;
  content: string;
  type: 'info' | 'warning' | 'critical';
  timestamp: any;
  active: boolean;
}

export interface Channel {
  id?: string;
  name: string;
  type: 'text' | 'voice';
  createdBy: string;
  timestamp: any;
}
export interface FriendRequest {
  id: string;
  from: string; // sender email
  fromName: string;
  to: string; // receiver email
  toName: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: any;
}

export interface Friendship {
  id: string;
  users: string[]; // [email1, email2]
  timestamp: any;
}
