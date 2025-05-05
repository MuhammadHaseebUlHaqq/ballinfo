import { Server } from 'socket.io';
import footballApiService from './footballApiService.js';

class SocketService {
    constructor() {
        this.io = null;
        this.updateInterval = 30000; // 30 seconds
        this.activeConnections = new Set();
    }

    initialize(server) {
        this.io = new Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:3000',
                methods: ['GET', 'POST']
            }
        });

        this.setupEventHandlers();
        this.startLiveUpdates();
    }

    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);
            this.activeConnections.add(socket.id);

            // Send initial match data
            this.sendLiveMatches(socket);

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
                this.activeConnections.delete(socket.id);
            });

            // Handle specific match subscription
            socket.on('subscribe_match', (matchId) => {
                socket.join(`match_${matchId}`);
                this.sendMatchDetails(matchId, socket);
            });

            socket.on('unsubscribe_match', (matchId) => {
                socket.leave(`match_${matchId}`);
            });
        });
    }

    async sendLiveMatches(socket = null) {
        try {
            const matches = await footballApiService.getLiveMatches();
            const target = socket || this.io;
            target.emit('live_matches', matches);
        } catch (error) {
            console.error('Error sending live matches:', error);
            const target = socket || this.io;
            target.emit('error', { 
                type: 'LIVE_MATCHES_ERROR',
                message: 'Unable to fetch live matches'
            });
        }
    }

    async sendMatchDetails(matchId, socket = null) {
        try {
            const match = await footballApiService.getMatchDetails(matchId);
            const target = socket || this.io.to(`match_${matchId}`);
            target.emit('match_details', match);
        } catch (error) {
            console.error(`Error sending match details for match ${matchId}:`, error);
            const target = socket || this.io.to(`match_${matchId}`);
            target.emit('error', {
                type: 'MATCH_DETAILS_ERROR',
                message: 'Unable to fetch match details',
                matchId
            });
        }
    }

    startLiveUpdates() {
        setInterval(async () => {
            if (this.activeConnections.size > 0) {
                await this.sendLiveMatches();
            }
        }, this.updateInterval);
    }
}

export default new SocketService(); 