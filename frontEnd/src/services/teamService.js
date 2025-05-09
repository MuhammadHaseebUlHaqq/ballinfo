import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Get all teams
export const getAllTeams = async () => {
    try {
        const response = await axios.get(`${API_URL}/teams`);
        console.log('Teams response:', response.data); // Debug log
        return response.data;
    } catch (error) {
        console.error('Error fetching teams:', error.response || error);
        throw error;
    }
};

// Get a single team by ID
export const getTeamById = async (teamId) => {
    try {
        const response = await axios.get(`${API_URL}/teams/${teamId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching team:', error.response || error);
        throw error;
    }
}; 