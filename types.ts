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
