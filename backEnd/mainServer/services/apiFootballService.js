import axios from 'axios';
import { config } from 'dotenv';

config();

class ApiFootballService {
    constructor() {
        this.apiKey = process.env.API_FOOTBALL_KEY;
        if (!this.apiKey) {
            console.error('API_FOOTBALL_KEY is not set in environment variables');
        }
        this.baseUrl = 'https://v3.football.api-sports.io';
        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'x-rapidapi-key': this.apiKey,
                'x-rapidapi-host': 'v3.football.api-sports.io'
            }
        });
        
        // La Liga ID in API-Football is 140
        this.laLigaId = 140;
        
        // Add minimal caching
        this.cache = {
            live: { data: null, timestamp: 0 },
            previous: { data: null, timestamp: 0 }
        };
        this.cacheValidityPeriod = 30000; // 30 seconds
    }

    async getLiveMatches() {
        try {
            console.log('Fetching live La Liga matches...');
            
            if (!this.apiKey) {
                throw new Error('API key is not configured');
            }

            // Check cache for live matches
            if (this.cache.live.data && 
                Date.now() - this.cache.live.timestamp < this.cacheValidityPeriod) {
                console.log('Returning cached live match data');
                return this.cache.live.data;
            }

            const response = await this.axiosInstance.get('/fixtures', {
                params: {
                    league: this.laLigaId,
                    live: 'all'
                }
            });

            if (!response.data?.response) {
                console.log('No live matches data in response');
                return [];
            }

            const matches = response.data.response.map(match => ({
                id: match.fixture.id,
                competition: 'La Liga',
                utcDate: match.fixture.date,
                status: this.mapStatus(match.fixture.status.short),
                minute: match.fixture.status.elapsed || 0,
                homeTeam: {
                    name: match.teams.home.name,
                    crest: match.teams.home.logo,
                    score: match.goals.home
                },
                awayTeam: {
                    name: match.teams.away.name,
                    crest: match.teams.away.logo,
                    score: match.goals.away
                },
                venue: match.fixture.venue.name
            }));

            // Update cache
            this.cache.live.data = matches;
            this.cache.live.timestamp = Date.now();

            return matches;
        } catch (error) {
            console.error('Error fetching live matches:', error);
            return [];
        }
    }

    async getPreviousMatches() {
        try {
            console.log('Fetching previous La Liga matches...');

            if (!this.apiKey) {
                throw new Error('API key is not configured');
            }

            // Check cache for previous matches
            if (this.cache.previous.data && 
                Date.now() - this.cache.previous.timestamp < this.cacheValidityPeriod) {
                console.log('Returning cached previous match data');
                return this.cache.previous.data;
            }

            // Get matches from last 7 days
            const today = new Date();
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 7);

            const response = await this.axiosInstance.get('/fixtures', {
                params: {
                    league: this.laLigaId,
                    season: today.getFullYear(),
                    from: sevenDaysAgo.toISOString().split('T')[0],
                    to: today.toISOString().split('T')[0],
                    status: 'FT'  // Only finished matches
                }
            });

            if (!response.data?.response) {
                console.log('No previous matches data in response');
                return [];
            }

            const matches = response.data.response.map(match => ({
                id: match.fixture.id,
                competition: 'La Liga',
                utcDate: match.fixture.date,
                status: 'FINISHED',
                homeTeam: {
                    name: match.teams.home.name,
                    crest: match.teams.home.logo,
                    score: match.goals.home
                },
                awayTeam: {
                    name: match.teams.away.name,
                    crest: match.teams.away.logo,
                    score: match.goals.away
                },
                venue: match.fixture.venue.name
            }));

            // Update cache
            this.cache.previous.data = matches;
            this.cache.previous.timestamp = Date.now();

            return matches;
        } catch (error) {
            console.error('Error fetching previous matches:', error);
            return [];
        }
    }

    mapStatus(apiStatus) {
        const statusMap = {
            '1H': 'LIVE',
            '2H': 'LIVE',
            'HT': 'PAUSED',
            'FT': 'FINISHED',
            'NS': 'SCHEDULED',
            'PST': 'POSTPONED',
            'CANC': 'CANCELLED'
        };
        return statusMap[apiStatus] || apiStatus;
    }
}

export default new ApiFootballService(); 