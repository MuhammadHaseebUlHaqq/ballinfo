import Match from '../models/Match.js';
import apiFootballService from '../services/apiFootballService.js';
import dotenv from 'dotenv';

dotenv.config();

export const getLiveMatches = async (req, res) => {
  try {
    console.log('Controller: Fetching live matches...');
    const matches = await apiFootballService.getLiveMatches();
    
    res.json({
      status: 'success',
      count: matches.length,
      matches: matches
    });
  } catch (error) {
    console.error('Error in getLiveMatches:', error);
    res.status(error.response?.status || 500).json({
      status: 'error',
      message: 'Failed to fetch live matches',
      error: error.response?.data?.message || error.message
    });
  }
};

export const getPreviousMatchday = async (req, res) => {
  try {
    console.log('Controller: Fetching previous matches...');
    const matches = await apiFootballService.getPreviousMatches();
    
    res.json({
      status: 'success',
      count: matches.length,
      matches: matches
    });
  } catch (error) {
    console.error('Error in getPreviousMatchday:', error);
    res.status(error.response?.status || 500).json({
      status: 'error',
      message: 'Failed to fetch previous matches',
      error: error.response?.data?.message || error.message
    });
  }
}; 