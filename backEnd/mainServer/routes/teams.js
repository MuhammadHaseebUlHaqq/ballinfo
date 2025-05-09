import express from 'express';
import Team from '../models/Team.js';

const router = express.Router();

// Get all teams
router.get('/', async (req, res) => {
    try {
        console.log('Fetching teams from database...');
        const teams = await Team.find().sort({ name: 1 });
        
        res.json({
            status: 'success',
            count: teams.length,
            teams: teams
        });
    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch teams',
            error: error.message
        });
    }
});

export default router; 