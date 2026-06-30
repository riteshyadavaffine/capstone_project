export type UserRole = 'customer' | 'admin';
export type ConversationStatus = 'open' | 'waiting' | 'escalated' | 'resolved';
export type MessageRole = 'user' | 'assistant' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
}

export interface Message {
  id: string;
  role: MessageRole;
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

export interface DatabaseSchema {
  users: User[];
  conversations: Conversation[];
  settings: Settings;
}

export interface AuthPayload {
  sub: string;
  role: UserRole;
  email: string;
}

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

