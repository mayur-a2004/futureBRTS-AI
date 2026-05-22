import { Router } from 'express';
import { guestController } from './guest.controller';

const router = Router();

router.post('/chat', guestController.chat);

export default router;
