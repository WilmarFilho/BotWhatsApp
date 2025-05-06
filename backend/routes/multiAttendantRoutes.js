import express from 'express';
import { connectMultiAttendant } from '../controllers/multiAttendantController.js';

const router = express.Router();

router.post('/connect', connectMultiAttendant);

export default router;
