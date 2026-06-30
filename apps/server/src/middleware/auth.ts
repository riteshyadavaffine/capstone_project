import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../env.js';
import { db } from '../db.js';
import type { AuthPayload, SafeUser, UserRole } from '../types.js';

export interface AuthenticatedRequest extends Request {
  user?: SafeUser;
}

function toSafeUser(user: { id: string; email: string; name: string; role: UserRole }): SafeUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Please sign in to continue.' });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthPayload;
    const user = db.data.users.find((item) => item.id === payload.sub);

    if (!user) {
      return res.status(401).json({ message: 'Your session is no longer valid. Please sign in again.' });
    }

    req.user = toSafeUser(user);
    next();
  } catch {
    return res.status(401).json({ message: 'Your session expired. Please sign in again.' });
  }
}

export function requireRole(role: UserRole) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Please sign in to continue.' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: 'You do not have access to this page.' });
    }

    next();
  };
}

