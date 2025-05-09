import Match from '../models/Match.js';
import footballApiService from '../services/footballApiService.js';
import dotenv from 'dotenv';

dotenv.config();

export const getLiveMatches = async (req, res) => {
  try {
    console.log('Fetching live La Liga matches...');
    const data = await fetchFromExternalAPI('/matches', { 
      competitions: 'PD',
      status: 'LIVE,IN_PLAY,PAUSED'
    });
    
    if (!data || !data.matches) {
      throw new Error('Invalid data received from external API');
    }

    const transformedMatches = data.matches.map(match => ({
      id: match.id,
      competition: match.competition?.name || 'La Liga',
      utcDate: match.utcDate,
      status: match.status,
      minute: match.minute || 0,
      homeTeam: {
        name: match.homeTeam?.name || 'Unknown Team',
        crest: match.homeTeam?.tla ? `https://crests.football-data.org/${match.homeTeam.tla}.png` : '/placeholder-team-logo.png',
        score: match.score?.fullTime?.home ?? match.score?.halfTime?.home ?? 0
      },
      awayTeam: {
        name: match.awayTeam?.name || 'Unknown Team',
        crest: match.awayTeam?.tla ? `https://crests.football-data.org/${match.awayTeam.tla}.png` : '/placeholder-team-logo.png',
        score: match.score?.fullTime?.away ?? match.score?.halfTime?.away ?? 0
      },
      venue: match.venue
    }));

    res.json({
      status: 'success',
      count: transformedMatches.length,
      matches: transformedMatches
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
    console.log('Fetching previous La Liga matches...');
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    const data = await fetchFromExternalAPI('/matches', {
      competitions: 'PD',
      dateFrom: sevenDaysAgo.toISOString().split('T')[0],
      dateTo: today.toISOString().split('T')[0]
    });

    if (!data || !data.matches) {
      throw new Error('Invalid data received from external API');
    }

    const transformedMatches = data.matches.map(match => ({
      id: match.id,
      competition: match.competition?.name || 'La Liga',
      utcDate: match.utcDate,
      status: match.status,
      minute: match.minute || 0,
      homeTeam: {
        name: match.homeTeam?.name || 'Unknown Team',
        crest: match.homeTeam?.tla ? `https://crests.football-data.org/${match.homeTeam.tla}.png` : '/placeholder-team-logo.png',
        score: match.score?.fullTime?.home ?? match.score?.halfTime?.home ?? 0
      },
      awayTeam: {
        name: match.awayTeam?.name || 'Unknown Team',
        crest: match.awayTeam?.tla ? `https://crests.football-data.org/${match.awayTeam.tla}.png` : '/placeholder-team-logo.png',
        score: match.score?.fullTime?.away ?? match.score?.halfTime?.away ?? 0
      },
      venue: match.venue
    }));

    res.json({
      status: 'success',
      count: transformedMatches.length,
      matches: transformedMatches
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