import { db } from '../db.js';
import type { SafeUser, Settings } from '../types.js';
import { HttpError } from '../utils/httpError.js';

export function getSettings(user: SafeUser) {
  if (user.role !== 'admin') {
    throw new HttpError(403, 'Only support admins can view these settings.');
  }

  return db.data.settings;
}

export async function updateSettings(user: SafeUser, updates: Settings) {
  if (user.role !== 'admin') {
    throw new HttpError(403, 'Only support admins can update these settings.');
  }

  db.data.settings = updates;
  await db.write();
  return db.data.settings;
}

export function getEscalatedConversations(user: SafeUser) {
  if (user.role !== 'admin') {
    throw new HttpError(403, 'Only support admins can view these conversations.');
  }

  return db.data.conversations
    .filter((conversation) => conversation.escalated)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

