import express from 'express';
import { updateMatchAndNotify } from '../../services/matchService.js';

const router = express.Router();

/**
 * Middleware to check if user is admin
 * TODO: Replace with actual authentication middleware
 */
const isAdmin = (req, res, next) => {
  // This is a placeholder. In a real app, you would check if the user is authenticated 
  // and has admin privileges
  const isAdmin = req.headers['x-admin-auth'] === 'true';
  
  if (!isAdmin) {
    return res.status(403).json({ 
      success: false, 
      message: 'Unauthorized: Admin access required' 
    });
  }
  
  next();
};

/**
 * Update match data and broadcast to subscribed clients
 * POST /api/admin/matches/:id/update
 */
router.post('/matches/:id/update', isAdmin, async (req, res) => {
  try {
    const matchId = req.params.id;
    const updateData = req.body;
    
    // Get the Socket.IO instance from the app
    const io = req.app.get('io');
    
    if (!io) {
      return res.status(500).json({
        success: false,
        message: 'WebSocket server not initialized'
      });
    }
    
    const updatedMatch = await updateMatchAndNotify(io, matchId, updateData);
    
    if (!updatedMatch) {
      return res.status(404).json({ 
        success: false, 
        message: 'Match not found' 
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Match updated successfully',
      data: updatedMatch
    });
  } catch (error) {
    console.error('Error in match update endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating match',
      error: error.message
    });
  }
});

export default router; 