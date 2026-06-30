import type { AuthState, Conversation, Settings, User } from '../types';

const API_BASE = '/api';

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const data = (await response.json().catch(() => ({}))) as { message?: string } & T;

  if (!response.ok) {
    throw new ApiError(data.message ?? 'Something went wrong. Please try again.');
  }

  return data;
}

export async function login(email: string, password: string): Promise<AuthState> {
  return request<AuthState>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchMe(token: string): Promise<{ user: User }> {
  return request('/auth/me', {}, token);
}

export async function fetchConversations(token: string): Promise<{ items: Conversation[] }> {
  return request('/conversations', {}, token);
}

export async function createConversation(token: string, subject: string): Promise<{ conversation: Conversation }> {
  return request('/conversations', {
    method: 'POST',
    body: JSON.stringify({ subject }),
  }, token);
}

export async function sendMessage(token: string, conversationId: string, content: string): Promise<{ conversation: Conversation }> {
  return request(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  }, token);
}

export async function escalateConversation(token: string, conversationId: string): Promise<{ conversation: Conversation }> {
  return request(`/conversations/${conversationId}/escalate`, {
    method: 'POST',
  }, token);
}

export async function updateConversationStatus(token: string, conversationId: string, status: Conversation['status']): Promise<{ conversation: Conversation }> {
  return request(`/conversations/${conversationId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }, token);
}

export async function fetchAdminSettings(token: string): Promise<{ settings: Settings }> {
  return request('/admin/settings', {}, token);
}

export async function updateAdminSettings(token: string, settings: Settings): Promise<{ settings: Settings; message: string }> {
  return request('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  }, token);
}

export async function fetchEscalatedConversations(token: string): Promise<{ items: Conversation[] }> {
  return request('/admin/conversations', {}, token);
}

