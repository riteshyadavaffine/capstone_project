import { Router } from 'express';
import { z } from 'zod';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.js';
import {
  addMessage,
  createConversation,
  escalateConversation,
  getConversationById,
  listConversations,
  updateConversationStatus,
} from '../services/conversationService.js';

const router = Router();

const createConversationSchema = z.object({
  subject: z.string().min(3).max(120),
});

const addMessageSchema = z.object({
  content: z.string().min(2).max(2000),
});

const updateStatusSchema = z.object({
  status: z.enum(['open', 'waiting', 'escalated', 'resolved']),
});

router.use(authenticate);

router.get('/', (req: AuthenticatedRequest, res) => {
  res.json({ items: listConversations(req.user!) });
});

router.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = createConversationSchema.parse(req.body);
    const conversation = createConversation(req.user!, body.subject);
    res.status(201).json({ conversation });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', (req: AuthenticatedRequest, res, next) => {
  try {
    const conversation = getConversationById(req.user!, req.params.id);
    res.json({ conversation });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/messages', async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = addMessageSchema.parse(req.body);
    const conversation = await addMessage(req.user!, req.params.id, body.content);
    res.json({ conversation });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/escalate', async (req: AuthenticatedRequest, res, next) => {
  try {
    const conversation = await escalateConversation(req.user!, req.params.id);
    res.json({ conversation });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = updateStatusSchema.parse(req.body);
    const conversation = await updateConversationStatus(req.user!, req.params.id, body.status);
    res.json({ conversation });
  } catch (error) {
    next(error);
  }
});

export default router;

