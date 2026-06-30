import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireRole, type AuthenticatedRequest } from '../middleware/auth.js';
import { getEscalatedConversations, getSettings, updateSettings } from '../services/adminService.js';

const router = Router();

const settingsSchema = z.object({
  systemPrompt: z.string().min(20).max(1000),
  escalationKeywords: z.array(z.string().min(2).max(40)).min(1).max(20),
  supportEmail: z.email(),
});

router.use(authenticate, requireRole('admin'));

router.get('/settings', (req: AuthenticatedRequest, res, next) => {
  try {
    res.json({ settings: getSettings(req.user!) });
  } catch (error) {
    next(error);
  }
});

router.put('/settings', async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = settingsSchema.parse(req.body);
    const settings = await updateSettings(req.user!, body);
    res.json({ settings, message: 'Assistant settings saved successfully.' });
  } catch (error) {
    next(error);
  }
});

router.get('/conversations', (req: AuthenticatedRequest, res, next) => {
  try {
    res.json({ items: getEscalatedConversations(req.user!) });
  } catch (error) {
    next(error);
  }
});

export default router;

