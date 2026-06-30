import { nanoid } from 'nanoid';
import { db } from '../db.js';
import type { Conversation, SafeUser } from '../types.js';
import { HttpError } from '../utils/httpError.js';
import { generateAssistantReply } from './aiService.js';

function now() {
  return new Date().toISOString();
}

function matchesConversationAccess(conversation: Conversation, user: SafeUser) {
  return user.role === 'admin' || conversation.userId === user.id;
}

export function listConversations(user: SafeUser) {
  return db.data.conversations
    .filter((conversation) => matchesConversationAccess(conversation, user))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export function createConversation(user: SafeUser, subject: string) {
  const conversation: Conversation = {
    id: nanoid(),
    userId: user.id,
    subject,
    status: 'open',
    escalated: false,
    createdAt: now(),
    updatedAt: now(),
    messages: [],
  };

  db.data.conversations.unshift(conversation);
  db.write();
  return conversation;
}

export function getConversationById(user: SafeUser, conversationId: string) {
  const conversation = db.data.conversations.find((item) => item.id === conversationId);

  if (!conversation || !matchesConversationAccess(conversation, user)) {
    throw new HttpError(404, 'We could not find that conversation.');
  }

  return conversation;
}

function shouldEscalate(content: string) {
  const keywords = db.data.settings.escalationKeywords.map((keyword) => keyword.toLowerCase());
  const lower = content.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword));
}

export async function addMessage(user: SafeUser, conversationId: string, content: string) {
  const conversation = getConversationById(user, conversationId);

  conversation.messages.push({
    id: nanoid(),
    role: user.role === 'admin' ? 'admin' : 'user',
    content,
    createdAt: now(),
  });

  const needsEscalation = shouldEscalate(content);
  if (needsEscalation) {
    conversation.escalated = true;
    conversation.status = 'escalated';
  } else if (conversation.status === 'resolved') {
    conversation.status = 'open';
  }

  const reply = await generateAssistantReply(conversation, db.data.settings, content);
  conversation.messages.push({
    id: nanoid(),
    role: 'assistant',
    content: reply,
    createdAt: now(),
  });
  conversation.updatedAt = now();

  if (!needsEscalation && conversation.status !== 'resolved') {
    conversation.status = 'waiting';
  }

  await db.write();
  return conversation;
}

export async function escalateConversation(user: SafeUser, conversationId: string) {
  const conversation = getConversationById(user, conversationId);
  conversation.escalated = true;
  conversation.status = 'escalated';
  conversation.updatedAt = now();
  await db.write();
  return conversation;
}

export async function updateConversationStatus(user: SafeUser, conversationId: string, status: Conversation['status']) {
  const conversation = getConversationById(user, conversationId);

  if (user.role !== 'admin') {
    throw new HttpError(403, 'Only support admins can update a conversation status.');
  }

  conversation.status = status;
  conversation.updatedAt = now();
  if (status !== 'escalated') {
    conversation.escalated = false;
  }

  await db.write();
  return conversation;
}

