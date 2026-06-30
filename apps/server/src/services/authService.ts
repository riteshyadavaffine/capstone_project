import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { env } from '../env.js';
import type { SafeUser, User } from '../types.js';
import { HttpError } from '../utils/httpError.js';

function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function login(email: string, password: string) {
  const user = db.data.users.find((item) => item.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    throw new HttpError(401, 'We could not find an account with those details. Please check your email and password.');
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new HttpError(401, 'We could not find an account with those details. Please check your email and password.');
  }

  const safeUser = toSafeUser(user);
  const token = jwt.sign({ sub: user.id, role: user.role, email: user.email }, env.jwtSecret, { expiresIn: '12h' });

  return { token, user: safeUser };
}

export function getUserById(userId: string) {
  const user = db.data.users.find((item) => item.id === userId);
  if (!user) {
    throw new HttpError(404, 'We could not find that user.');
  }

  return toSafeUser(user);
}

