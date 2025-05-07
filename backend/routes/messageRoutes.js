import express from 'express';
import { getChats } from '../controllers/messageController.js';

const router = express.Router();

router.get('/connections/:connectionId/chats', getChats);

export default router;