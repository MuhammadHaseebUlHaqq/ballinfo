import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
        this.connectionAttempts = 0;
        this.maxRetries = 3;
        this.debug = true;
        this.isConnecting = false;
        this.reconnectTimer = null;
        
        // Get the socket URL from environment variables or use a fallback
        this.socketUrl = process.env.REACT_APP_SOCKET_URL?.trim() || window.location.origin;
        this.apiUrl = process.env.REACT_APP_API_URL?.trim() || window.location.origin;
        
        if (this.debug) {
            console.log('SocketService Configuration:', {
                socketUrl: this.socketUrl,
                apiUrl: this.apiUrl,
                env: process.env.NODE_ENV
            });
        }
    }

    connect() {
        if (this.socket || this.isConnecting) return;

        this.isConnecting = true;
        const isMobile = this.detectDevice() === 'mobile';
        
        console.log('Attempting to connect to:', this.socketUrl, 'Device type:', this.detectDevice());

        try {
            this.socket = io(this.socketUrl, {
                reconnectionDelay: 1000,
                reconnection: true,
                reconnectionAttempts: 10,
                transports: ['polling', 'websocket'],
                upgrade: true,
                rememberUpgrade: true,
                timeout: 60000,
                withCredentials: true,
                autoConnect: true,
                forceNew: false,
                path: '/socket.io',
                query: {
                    device: this.detectDevice(),
                    timestamp: Date.now(),
                    debug: this.debug
                }
            });

            // Add connection state logging
            this.socket.io.on('ping', () => {
                if (this.debug) console.log('Socket ping sent');
            });

            this.socket.io.on('pong', (latency) => {
                if (this.debug) console.log('Socket pong received, latency:', latency, 'ms');
            });

            this.setupConnectionHandlers();
        } catch (error) {
            console.error('Error creating socket connection:', error);
            this.handleConnectionError(error);
        }
    }

    setupConnectionHandlers() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            const transport = this.socket.io.engine.transport.name;
            console.log('Socket connected successfully.', {
                transport: transport,
                id: this.socket.id,
                device: this.detectDevice()
            });
            
            this.connectionAttempts = 0;
            this.isConnecting = false;
            clearTimeout(this.reconnectTimer);
            
            // Request live matches immediately after connection
            this.requestLiveMatches();
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.handleConnectionError(error);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected. Reason:', reason);
            this.isConnecting = false;
            
            if (reason === 'io server disconnect' || reason === 'transport close') {
                this.handleReconnect();
            }
        });

        this.socket.on('error', (error) => {
            console.error('Socket error event:', error);
            this.emitError(error);
        });

        // Monitor connection state
        this.socket.io.on('reconnect_attempt', (attempt) => {
            console.log(`Reconnection attempt ${attempt}`);
        });

        this.socket.io.on('reconnect_failed', () => {
            console.log('Reconnection failed');
            this.handleConnectionError(new Error('Reconnection failed'));
        });
    }

    detectDevice() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
        return isMobile ? 'mobile' : 'desktop';
    }

    handleConnectionError(error) {
        this.connectionAttempts++;
        this.isConnecting = false;
        
        console.log(`Connection attempt ${this.connectionAttempts} failed:`, error.message);
        
        // Check if the error is related to XHR polling
        const isXHRError = error.message.toLowerCase().includes('xhr') || 
                          error.message.toLowerCase().includes('polling');
        
        if (isXHRError) {
            // Try to force polling transport on XHR errors
            if (this.socket) {
                this.socket.io.opts.transports = ['polling'];
                console.log('Forcing polling transport due to XHR error');
            }
        }
        
        if (this.connectionAttempts >= this.maxRetries) {
            const errorMessage = {
                type: 'CONNECTION_ERROR',
                message: `Unable to connect to the server (${error.message}). Please check your internet connection.`,
                isXHRError: isXHRError
            };
            console.error('Max retries reached:', errorMessage);
            this.emitError(errorMessage);
        } else {
            this.handleReconnect();
        }
    }

    handleReconnect() {
        console.log('Attempting to reconnect...');
        clearTimeout(this.reconnectTimer);
        
        const backoffDelay = Math.min(2000 * Math.pow(2, this.connectionAttempts - 1), 10000);
        
        this.reconnectTimer = setTimeout(() => {
            if (this.socket) {
                // Try to reconnect with current socket
                this.socket.connect();
            } else {
                // Create new connection
                this.connect();
            }
        }, backoffDelay);
    }

    requestLiveMatches() {
        if (!this.socket) {
            console.error('Cannot request matches: No socket connection');
            return;
        }
        console.log('Requesting live matches from server');
        this.socket.emit('request_live_matches');
    }

    emitError(error) {
        const callback = this.listeners.get('error');
        if (callback) {
            callback(error);
        }
    }

    disconnect() {
        clearTimeout(this.reconnectTimer);
        if (this.socket) {
            console.log('Disconnecting socket...');
            this.socket.disconnect();
            this.socket = null;
            this.connectionAttempts = 0;
            this.isConnecting = false;
        }
    }

    subscribe(event, callback) {
        if (!this.socket) {
            console.log('No socket connection, attempting to connect...');
            this.connect();
        }

        console.log('Subscribing to event:', event);
        this.socket.on(event, (data) => {
            console.log(`Received ${event} event:`, data);
            callback(data);
        });
        this.listeners.set(event, callback);
    }

    unsubscribe(event) {
        if (!this.socket) return;

        console.log('Unsubscribing from event:', event);
        const callback = this.listeners.get(event);
        if (callback) {
            this.socket.off(event, callback);
            this.listeners.delete(event);
        }
    }

    subscribeToMatch(matchId) {
        if (!this.socket) this.connect();
        console.log('Subscribing to match:', matchId);
        this.socket.emit('subscribe_match', matchId);
    }

    unsubscribeFromMatch(matchId) {
        if (!this.socket) return;
        console.log('Unsubscribing from match:', matchId);
        this.socket.emit('unsubscribe_match', matchId);
    }
}

export default new SocketService(); 