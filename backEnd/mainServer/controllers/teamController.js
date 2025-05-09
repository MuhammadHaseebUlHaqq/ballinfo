import Team from '../models/Team.js';

// Get all teams
export const getAllTeams = async (req, res) => {
    try {
        const teams = await Team.find({});
        res.status(200).json(teams);
    } catch (error) {
        console.error('Error in getAllTeams:', error);
        res.status(500).json({ 
            status: 'error',
            message: error.message 
        });
    }
};

// Get a single team by ID
export const getTeamById = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Team not found' 
            });
        }
        res.status(200).json(team);
    } catch (error) {
        console.error('Error in getTeamById:', error);
        res.status(500).json({ 
            status: 'error',
            message: error.message 
        });
    }
};

// Create a new team
export const createTeam = async (req, res) => {
    try {
        const team = new Team(req.body);
        const savedTeam = await team.save();
        res.status(201).json(savedTeam);
    } catch (error) {
        console.error('Error in createTeam:', error);
        res.status(400).json({ 
            status: 'error',
            message: error.message 
        });
    }
};

// Update a team
export const updateTeam = async (req, res) => {
    try {
        const team = await Team.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!team) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Team not found' 
            });
        }
        res.status(200).json(team);
    } catch (error) {
        console.error('Error in updateTeam:', error);
        res.status(400).json({ 
            status: 'error',
            message: error.message 
        });
    }
};

// Delete a team
export const deleteTeam = async (req, res) => {
    try {
        const team = await Team.findByIdAndDelete(req.params.id);
        if (!team) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Team not found' 
            });
        }
        res.status(200).json({ 
            status: 'success',
            message: 'Team deleted successfully' 
        });
    } catch (error) {
        console.error('Error in deleteTeam:', error);
        res.status(500).json({ 
            status: 'error',
            message: error.message 
        });
    }
}; 