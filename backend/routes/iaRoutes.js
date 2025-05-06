import express from 'express';
import { connectIA } from '../controllers/iaController.js';

const router = express.Router();

router.post('/connect', connectIA);

export default router;
