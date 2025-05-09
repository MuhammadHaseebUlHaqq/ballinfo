import express from 'express';
import {
    getAllTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam
} from '../controllers/teamController.js';

const router = express.Router();

// Get all teams
router.get('/', getAllTeams);

// Get a single team
router.get('/:id', getTeamById);

// Create a new team
router.post('/', createTeam);

// Update a team
router.put('/:id', updateTeam);

// Delete a team
router.delete('/:id', deleteTeam);

export default router; 