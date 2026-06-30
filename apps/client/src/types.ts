export type UserRole = 'customer' | 'admin';
export type ConversationStatus = 'open' | 'waiting' | 'escalated' | 'resolved';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'admin';
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  subject: string;
  status: ConversationStatus;
  escalated: boolean;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export interface Settings {
  systemPrompt: string;
  escalationKeywords: string[];
  supportEmail: string;
}

export interface AuthState {
  token: string;
  user: User;
}

