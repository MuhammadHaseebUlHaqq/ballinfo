const Team = require('../models/Team');

// Get all teams
const getAllTeams = async (req, res) => {
    try {
        const teams = await Team.find({});
        res.status(200).json(teams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single team by ID
const getTeamById = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        res.status(200).json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new team
const createTeam = async (req, res) => {
    try {
        const team = new Team(req.body);
        const savedTeam = await team.save();
        res.status(201).json(savedTeam);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a team
const updateTeam = async (req, res) => {
    try {
        const team = await Team.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        res.status(200).json(team);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a team
const deleteTeam = async (req, res) => {
    try {
        const team = await Team.findByIdAndDelete(req.params.id);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        res.status(200).json({ message: 'Team deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam
}; 