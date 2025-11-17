
export interface Game {
  id: number;
  title: string;
  genre: string;
  imageUrl: string;
  rating: number;
}

export interface User {
  email: string;
  password?: string; // Password is not always needed, e.g., when just identifying the user
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

export interface Message {
  id: number;
  from: string; // user email or 'admin'
  to: string; // user email or 'admin'
  content: string;
  timestamp: string;
  isRead: boolean;
}