const express = require('express');
const router = express.Router();
const {
    getAllTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam
} = require('../controllers/teamController');

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

module.exports = router; 