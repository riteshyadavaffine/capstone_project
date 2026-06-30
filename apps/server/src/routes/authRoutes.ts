import { Router } from 'express';
import { z } from 'zod';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.js';
import { login } from '../services/authService.js';

const router = Router();

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

router.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const result = await login(body.email, body.password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

export default router;

