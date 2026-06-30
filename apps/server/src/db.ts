import { JSONFilePreset } from 'lowdb/node';
import bcrypt from 'bcryptjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { DatabaseSchema } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../data/db.json');

export const defaultData: DatabaseSchema = {
  users: [
    {
      id: 'user-demo',
      email: 'customer@supportpilot.dev',
      name: 'Demo Customer',
      passwordHash: bcrypt.hashSync('Password123!', 10),
      role: 'customer',
    },
    {
      id: 'admin-demo',
      email: 'admin@supportpilot.dev',
      name: 'Support Admin',
      passwordHash: bcrypt.hashSync('AdminPass123!', 10),
      role: 'admin',
    },
  ],
  conversations: [
    {
      id: 'conv-welcome',
      userId: 'user-demo',
      subject: 'Unable to reset my password',
      status: 'open',
      escalated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg-seed-1',
          role: 'user',
          content: 'I am not getting the password reset email. What should I check first?',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'msg-seed-2',
          role: 'assistant',
          content: 'Start by checking your spam folder and confirm that you are using the same email address linked to your account. If the email still does not arrive, I can help escalate this for a support specialist.',
          createdAt: new Date().toISOString(),
        },
      ],
    },
  ],
  settings: {
    systemPrompt: 'You are SupportPilot, a concise and empathetic support assistant for an internal SaaS product. Give actionable next steps and avoid technical jargon.',
    escalationKeywords: ['refund', 'cancel', 'angry', 'urgent', 'human', 'manager'],
    supportEmail: 'support-team@supportpilot.dev',
  },
};

export const db = await JSONFilePreset<DatabaseSchema>(dbPath, defaultData);

export async function resetDb() {
  db.data = JSON.parse(JSON.stringify(defaultData)) as DatabaseSchema;
  await db.write();
}

