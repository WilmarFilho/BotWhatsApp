import express from 'express';
import { getConnectionStatus } from '../controllers/iaController.js';

const router = express.Router();

router.get('/status/:userId', getConnectionStatus);

export default router;