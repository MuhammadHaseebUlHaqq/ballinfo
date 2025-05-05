import express from 'express';
import footballApiService from '../services/footballApiService.js';

const router = express.Router();

// Get player statistics for a specific match
router.get('/match/:matchId', async (req, res) => {
    try {
        const { matchId } = req.params;
        const matchDetails = await footballApiService.getMatchDetails(matchId);
        
        // Since the current API service doesn't have direct player stats,
        // we'll return match details for now. You can extend this later
        // with more specific player statistics.
        res.json({
            status: 'success',
            data: matchDetails
        });
    } catch (error) {
        console.error('Error fetching player stats:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch player statistics',
            error: error.message
        });
    }
});

// Get top scorers
router.get('/topscorers', async (req, res) => {
    try {
        // This is a placeholder for now - you'll need to implement
        // the actual top scorers functionality in footballApiService
        res.json({
            status: 'success',
            message: 'Top scorers endpoint - to be implemented',
            data: []
        });
    } catch (error) {
        console.error('Error fetching top scorers:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch top scorers',
            error: error.message
        });
    }
});

// Get player performance metrics
router.get('/player/:playerId', async (req, res) => {
    try {
        const { playerId } = req.params;
        // This is a placeholder for now - you'll need to implement
        // the actual player performance metrics in footballApiService
        res.json({
            status: 'success',
            message: 'Player performance metrics endpoint - to be implemented',
            data: {
                playerId,
                metrics: {}
            }
        });
    } catch (error) {
        console.error('Error fetching player metrics:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch player metrics',
            error: error.message
        });
    }
});

export default router;
