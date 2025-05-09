import { Server } from 'socket.io';
import footballApiService from './footballApiService.js';

class SocketService {
    constructor() {
        this.io = null;
        this.updateInterval = 30000; // 30 seconds
        this.activeConnections = new Set();
    }

    initialize(server, corsOptions = {}) {
        // Default CORS options
        const defaultCorsOptions = {
            origin: ['http://localhost:3001'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            credentials: true,
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
        };

        // Merge with provided options
        const finalCorsOptions = {
            ...defaultCorsOptions,
            ...corsOptions
        };

        this.io = new Server(server, {
            cors: finalCorsOptions,
            pingTimeout: 60000,
            pingInterval: 25000,
            transports: ['polling', 'websocket'],
            allowEIO3: true,
            maxHttpBufferSize: 1e8,
            connectTimeout: 60000,
            allowUpgrades: true,
            upgradeTimeout: 45000,
            cookie: {
                name: 'ballinfo_socket',
                httpOnly: true,
                sameSite: 'lax'
            },
            allowRequest: (req, callback) => {
                // Log connection attempt
                console.log('Connection attempt:', {
                    headers: req.headers,
                    url: req.url,
                    method: req.method,
                    timestamp: new Date().toISOString()
                });
                
                callback(null, true);
            }
        });

        this.setupEventHandlers();
        this.startLiveUpdates();
    }

    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            const clientInfo = {
                id: socket.id,
                transport: socket.conn.transport.name,
                device: socket.handshake.query.device || 'unknown',
                requestedTransport: socket.handshake.headers['x-requested-transport'] || 'any',
                timestamp: new Date().toISOString()
            };
            
            console.log('Client connected:', clientInfo);
            this.activeConnections.add(socket.id);

            // For mobile clients, force polling
            if (clientInfo.device === 'mobile') {
                // Don't try to modify the read-only transport.name property
                console.log('Mobile client detected:', socket.id);
                
                // Instead of modifying transport.name directly, set a flag on the socket
                socket.mobileClient = true;
            }

            // Monitor connection health
            let lastPingTime = Date.now();
            let missedPings = 0;
            
            socket.conn.on('packet', (packet) => {
                if (packet.type === 'ping') {
                    lastPingTime = Date.now();
                    missedPings = 0;
                }
            });

            // More frequent health checks for mobile
            const healthCheckInterval = clientInfo.device === 'mobile' ? 15000 : 30000;
            const healthCheck = setInterval(() => {
                const timeSinceLastPing = Date.now() - lastPingTime;
                if (timeSinceLastPing > healthCheckInterval * 2) {
                    missedPings++;
                    console.warn('Connection health warning:', {
                        clientId: socket.id,
                        device: clientInfo.device,
                        missedPings,
                        lastPingTime: new Date(lastPingTime).toISOString()
                    });

                    if (missedPings >= 3) {
                        console.error('Connection appears dead, forcing disconnect:', socket.id);
                        socket.disconnect(true);
                    } else {
                        socket.emit('health_check');
                    }
                }
            }, healthCheckInterval);

            // Handle errors
            socket.on('error', (error) => {
                console.error('Socket error:', {
                    clientId: socket.id,
                    device: clientInfo.device,
                    transport: socket.conn && socket.conn.transport ? socket.conn.transport.name : 'unknown',
                    error: error.message || error
                });

                // For mobile clients, mark the socket but don't modify transport properties
                if (clientInfo.device === 'mobile') {
                    socket.mobileClient = true;
                    console.log('Mobile client error, marked for polling preference');
                }
            });

            // Clean up on disconnect
            socket.on('disconnect', (reason) => {
                console.log('Client disconnected:', {
                    ...clientInfo,
                    reason,
                    duration: `${Math.round((Date.now() - new Date(clientInfo.timestamp).getTime()) / 1000)}s`
                });
                
                this.activeConnections.delete(socket.id);
                clearInterval(healthCheck);
            });

            // Handle live matches request with better error handling
            socket.on('request_live_matches', async () => {
                console.log('Live matches requested:', {
                    clientId: socket.id,
                    device: clientInfo.device,
                    transport: socket.conn.transport.name
                });

                try {
                    await this.sendLiveMatches(socket);
                } catch (error) {
                    console.error('Error sending live matches:', {
                        clientId: socket.id,
                        error: error.message
                    });
                    
                    socket.emit('error', {
                        type: 'REQUEST_ERROR',
                        message: 'Failed to process live matches request',
                        retry: true
                    });
                }
            });

            // Handle specific match subscription
            socket.on('subscribe_match', async (matchId) => {
                console.log('Match subscription requested:', matchId);
                socket.join(`match_${matchId}`);
                try {
                    await this.sendMatchDetails(matchId, socket);
                } catch (error) {
                    console.error('Error handling match subscription:', error);
                    socket.emit('error', {
                        type: 'SUBSCRIPTION_ERROR',
                        message: 'Failed to process match subscription'
                    });
                }
            });

            socket.on('unsubscribe_match', (matchId) => {
                socket.leave(`match_${matchId}`);
            });

            // Send initial match data with error handling
            this.sendLiveMatches(socket).catch(error => {
                console.error('Error sending initial match data:', {
                    clientId: socket.id,
                    device: clientInfo.device,
                    error: error.message
                });
                socket.emit('error', {
                    type: 'INITIAL_DATA_ERROR',
                    message: 'Failed to load initial match data',
                    retry: true
                });
            });
        });

        // Handle server-side errors
        this.io.on('error', (error) => {
            console.error('Socket.IO server error:', error);
        });
    }

    async sendLiveMatches(socket = null) {
        try {
            console.log('Fetching live matches...');
            const matches = await footballApiService.getLiveMatches();
            console.log('Sending matches to client:', matches.length);
            
            const target = socket || this.io;
            target.emit('live_matches', matches);
        } catch (error) {
            console.error('Error sending live matches:', error);
            const target = socket || this.io;
            target.emit('error', { 
                type: 'LIVE_MATCHES_ERROR',
                message: 'Unable to fetch live matches',
                details: error.message
            });
            throw error; // Re-throw to be caught by the caller
        }
    }

    async sendMatchDetails(matchId, socket = null) {
        try {
            console.log('Fetching match details:', matchId);
            const match = await footballApiService.getMatchDetails(matchId);
            const target = socket || this.io.to(`match_${matchId}`);
            target.emit('match_details', match);
        } catch (error) {
            console.error(`Error sending match details for match ${matchId}:`, error);
            const target = socket || this.io.to(`match_${matchId}`);
            target.emit('error', {
                type: 'MATCH_DETAILS_ERROR',
                message: 'Unable to fetch match details',
                matchId,
                details: error.message
            });
            throw error; // Re-throw to be caught by the caller
        }
    }

    startLiveUpdates() {
        setInterval(async () => {
            if (this.activeConnections.size > 0) {
                console.log('Sending periodic update to', this.activeConnections.size, 'clients');
                try {
                    await this.sendLiveMatches();
                } catch (error) {
                    console.error('Error in periodic update:', error);
                }
            }
        }, this.updateInterval);
    }
}

export default new SocketService(); 