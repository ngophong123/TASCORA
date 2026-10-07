import { z } from 'zod';
import { validate } from '../../middlewares/validate';
import { Router } from 'express';
import { getConversations, getMessages, sendMessage } from './message.controller';
import { requireAuth } from '../../middlewares/requireAuth';

const router = Router();

router.use(requireAuth);

router.get('/conversations', getConversations);
router.get('/:conversationId', validate(z.object({ params: z.object({ conversationId: z.string().min(1) }), query: z.object({ skip: z.coerce.number().int().min(0).default(0), take: z.coerce.number().int().min(1).max(100).default(50) }) })), getMessages);
router.post('/', validate(z.object({ body: z.object({ conversationId: z.string().min(1), content: z.string().min(1).max(10000), attachmentUrl: z.string().url().optional() }) })), sendMessage);

export default router;
