import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class FootballApiService {
    constructor() {
        this.apiKey = process.env.FOOTBALL_API_KEY;
        if (!this.apiKey) {
            console.error('FOOTBALL_API_KEY is not set in environment variables');
        }
        this.baseUrl = 'https://api.football-data.org/v4';
        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'X-Auth-Token': this.apiKey
            }
        });
        // Add minimal caching
        this.cachedMatches = null;
        this.cacheTime = 0;
        this.cacheValidityPeriod = 30000; // 30 seconds
    }

    async getLiveMatches() {
        try {
            console.log('Fetching La Liga matches...');
            
            if (!this.apiKey) {
                throw new Error('API key is not configured');
            }

            if (this.cachedMatches && Date.now() - this.cacheTime < this.cacheValidityPeriod) {
                console.log('Returning cached match data');
                return this.cachedMatches;
            }

            // Calculate date range
            const today = new Date();
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);

            // Format dates for API
            const dateFrom = today.toISOString().split('T')[0];
            const dateTo = nextWeek.toISOString().split('T')[0];

            console.log('Fetching matches with date range:', { dateFrom, dateTo });

            // Single API call with combined filters
            const response = await this.axiosInstance.get('/matches', {
                params: {
                    competitions: 'PD',
                    dateFrom: dateFrom,
                    dateTo: dateTo
                }
            });

            console.log('API Response:', {
                status: response.status,
                matchCount: response.data?.matches?.length || 0
            });

            if (!response.data?.matches) {
                console.log('No matches data in response');
                return [];
            }

            const matches = response.data.matches;
            const processedMatches = matches.map(match => {
                const matchDate = new Date(match.utcDate);
                const isLive = ['LIVE', 'IN_PLAY', 'PAUSED'].includes(match.status);
                
                return {
                    id: match.id,
                    competition: 'La Liga',
                    homeTeam: {
                        name: match.homeTeam?.name || '',
                        score: isLive ? (match.score?.fullTime?.home || 0) : null,
                        crest: match.homeTeam?.crest || ''
                    },
                    awayTeam: {
                        name: match.awayTeam?.name || '',
                        score: isLive ? (match.score?.fullTime?.away || 0) : null,
                        crest: match.awayTeam?.crest || ''
                    },
                    status: match.status,
                    minute: isLive ? (match.minute || null) : null,
                    venue: match.venue || '',
                    formattedDate: matchDate.toLocaleDateString('en-GB', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                    }),
                    formattedTime: matchDate.toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    }),
                    utcDate: match.utcDate,
                    isUpcoming: match.status === 'SCHEDULED'
                };
            });

            // Sort matches: LIVE first, then by date
            processedMatches.sort((a, b) => {
                if (['LIVE', 'IN_PLAY', 'PAUSED'].includes(a.status) && !['LIVE', 'IN_PLAY', 'PAUSED'].includes(b.status)) return -1;
                if (!['LIVE', 'IN_PLAY', 'PAUSED'].includes(a.status) && ['LIVE', 'IN_PLAY', 'PAUSED'].includes(b.status)) return 1;
                return new Date(a.utcDate) - new Date(b.utcDate);
            });

            this.cachedMatches = processedMatches;
            this.cacheTime = Date.now();

            return processedMatches;

        } catch (error) {
            console.error('Error fetching matches:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            
            if (this.cachedMatches) {
                console.log('Returning cached data due to error');
                return this.cachedMatches;
            }
            return [];
        }
    }

    async getPreviousMatches() {
        try {
            // Calculate date range for previous matches
            const today = new Date();
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 7);

            // Format dates for API
            const dateFrom = sevenDaysAgo.toISOString().split('T')[0];
            const dateTo = today.toISOString().split('T')[0];

            console.log('Fetching previous matches with date range:', { dateFrom, dateTo });

            // Single API call with combined filters
            const response = await this.axiosInstance.get('/matches', {
                params: {
                    competitions: 'PD',
                    dateFrom: dateFrom,
                    dateTo: dateTo
                }
            });

            console.log('API Response:', {
                status: response.status,
                matchCount: response.data?.matches?.length || 0
            });

            if (!response.data?.matches) {
                console.log('No previous matches found');
                return [];
            }

            // Filter and process only finished matches
            const matches = response.data.matches.filter(match => match.status === 'FINISHED');
            console.log(`Found ${matches.length} finished matches`);

            return matches.map(match => {
                const matchDate = new Date(match.utcDate);
                return {
                    id: match.id,
                    competition: 'La Liga',
                    homeTeam: {
                        name: match.homeTeam?.name || '',
                        score: match.score?.fullTime?.home || 0,
                        crest: match.homeTeam?.crest || ''
                    },
                    awayTeam: {
                        name: match.awayTeam?.name || '',
                        score: match.score?.fullTime?.away || 0,
                        crest: match.awayTeam?.crest || ''
                    },
                    status: 'FINISHED',
                    venue: match.venue || '',
                    formattedDate: matchDate.toLocaleDateString('en-GB', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                    }),
                    formattedTime: matchDate.toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    }),
                    utcDate: match.utcDate
                };
            });
        } catch (error) {
            console.error('Error fetching previous matches:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            return [];
        }
    }

    async getMatchDetails(matchId) {
        try {
            const response = await this.axiosInstance.get(`/matches/${matchId}`);
            const match = response.data;
            const matchDate = new Date(match.utcDate);
            const isLive = ['LIVE', 'IN_PLAY', 'PAUSED'].includes(match.status);

            return {
                id: match.id,
                competition: match.competition?.name || 'La Liga',
                homeTeam: {
                    name: match.homeTeam?.name || '',
                    score: isLive ? (match.score?.fullTime?.home || 0) : null,
                    crest: match.homeTeam?.crest || ''
                },
                awayTeam: {
                    name: match.awayTeam?.name || '',
                    score: isLive ? (match.score?.fullTime?.away || 0) : null,
                    crest: match.awayTeam?.crest || ''
                },
                status: match.status,
                minute: isLive ? (match.minute || null) : null,
                venue: match.venue || '',
                formattedDate: matchDate.toLocaleDateString('en-GB', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                }),
                formattedTime: matchDate.toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }),
                utcDate: match.utcDate
            };
        } catch (error) {
            console.error(`Error fetching match details for match ${matchId}:`, error);
            throw error;
        }
    }
}

export default new FootballApiService(); 