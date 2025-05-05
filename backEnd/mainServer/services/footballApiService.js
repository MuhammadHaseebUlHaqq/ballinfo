import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class FootballApiService {
    constructor() {
        this.apiKey = process.env.FOOTBALL_API_KEY;
        this.baseUrl = 'http://api.football-data.org/v4';
        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'X-Auth-Token': this.apiKey
            }
        });
    }

    async getLiveMatches() {
        try {
            const response = await this.axiosInstance.get('/matches', {
                params: {
                    status: 'LIVE',
                    competitions: 'PD' // La Liga competition code
                }
            });

            const liveMatches = this.formatMatchData(response.data.matches);
            
            // If there are no live matches or few live matches, get upcoming matches
            if (liveMatches.length < 3) {
                const upcomingMatches = await this.getUpcomingMatches(3 - liveMatches.length);
                return [...liveMatches, ...upcomingMatches];
            }

            return liveMatches;
        } catch (error) {
            console.error('Error fetching live matches:', error);
            throw error;
        }
    }

    async getUpcomingMatches(limit = 3) {
        try {
            const today = new Date();
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);

            const response = await this.axiosInstance.get('/matches', {
                params: {
                    status: 'SCHEDULED',
                    competitions: 'PD',
                    dateFrom: today.toISOString().split('T')[0],
                    dateTo: nextWeek.toISOString().split('T')[0],
                    limit: limit
                }
            });

            return this.formatMatchData(response.data.matches, true);
        } catch (error) {
            console.error('Error fetching upcoming matches:', error);
            throw error;
        }
    }

    formatMatchData(matches, isUpcoming = false) {
        return matches.map(match => ({
            id: match.id,
            competition: match.competition.name,
            homeTeam: {
                name: match.homeTeam.name,
                score: match.score.fullTime?.home || 0,
                crest: match.homeTeam.crest
            },
            awayTeam: {
                name: match.awayTeam.name,
                score: match.score.fullTime?.away || 0,
                crest: match.awayTeam.crest
            },
            status: match.status,
            minute: match.minute || null,
            lastUpdated: match.lastUpdated,
            venue: match.venue,
            matchday: match.matchday,
            stage: match.stage,
            group: match.group,
            season: match.season.id,
            utcDate: match.utcDate,
            isUpcoming: isUpcoming
        }));
    }

    async getMatchDetails(matchId) {
        try {
            const response = await this.axiosInstance.get(`/matches/${matchId}`);
            return this.formatMatchData([response.data])[0];
        } catch (error) {
            console.error(`Error fetching match details for match ${matchId}:`, error);
            throw error;
        }
    }
}

export default new FootballApiService(); 