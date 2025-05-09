import express from 'express';
import { getLiveMatches, getPreviousMatchday } from '../controllers/matchController.js';

const router = express.Router();

// Get live matches
router.get('/live', getLiveMatches);

// Get previous matchday matches
router.get('/previous', getPreviousMatchday);

export default router; 