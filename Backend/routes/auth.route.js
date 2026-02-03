
import express from 'express';
import { authCallback } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/sign-up', authCallback);

export default router;
