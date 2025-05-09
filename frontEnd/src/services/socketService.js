import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
        this.eventCallbacks = new Map(); // Store actual socket.io event callbacks
        this.connectionAttempts = 0;
        this.maxRetries = 3;
        this.debug = true;
        this.isConnecting = false;
        this.reconnectTimer = null;
        this.hasConnectedBefore = false;
        this.disabled = false; // Flag to disable socket completely if unreachable
        this.requestedMatches = false;
        this.connectionLock = false; // Add connection lock to prevent duplicate connections
        this.persistConnection = true; // Add persistConnection flag to maintain connection between pages
        
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
        // Prevent multiple simultaneous connection attempts
        if (this.connectionLock) {
            console.log('Connection already in progress, skipping duplicate request');
            return;
        }
        
        // Don't attempt to connect if service is disabled or already connecting/connected
        if (this.disabled || this.socket || this.isConnecting) {
            console.log('Skipping connection attempt:', {
                disabled: this.disabled,
                socketExists: !!this.socket,
                isConnecting: this.isConnecting
            });
            return;
        }

        this.isConnecting = true;
        this.connectionLock = true;
        
        try {
            console.log('Initiating new socket connection...');
            
            // Create socket with options optimized for reliability
            this.socket = io(this.socketUrl, {
                reconnectionDelay: 1000,
                reconnection: true,
                reconnectionAttempts: 3,
                transports: ['polling'], // Only use polling for maximum compatibility
                timeout: 10000, // Shorter timeout for faster detection of issues
                withCredentials: true,
                autoConnect: true,
                forceNew: true, // Always create a new connection
                path: '/socket.io',
                query: {
                    timestamp: Date.now(),
                }
            });

            this.setupConnectionHandlers();
        } catch (error) {
            console.error('Error creating socket connection:', error);
            this.handleConnectionError(error);
        }
    }

    setupConnectionHandlers() {
        if (!this.socket) {
            this.connectionLock = false;
            return;
        }

        this.socket.on('connect', () => {
            const transport = this.socket?.io?.engine?.transport?.name || 'unknown';
            console.log('Socket connected successfully:', {
                transport: transport,
                id: this.socket.id
            });
            
            this.connectionAttempts = 0;
            this.isConnecting = false;
            this.connectionLock = false;
            this.hasConnectedBefore = true;
            clearTimeout(this.reconnectTimer);
            
            // Reattach all event listeners
            this.reattachEventListeners();
            
            // Request live matches immediately after connection
            this.requestLiveMatches();
        });

        this.socket.on('connect_error', (error) => {
            console.log('Socket connection error:', error.message);
            this.connectionLock = false;
            this.handleConnectionError(error);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected. Reason:', reason);
            this.isConnecting = false;
            this.connectionLock = false;
            
            // Handle intentional disconnections
            if (reason === 'io client disconnect' || 
                reason === 'io instance close' || 
                this.disabled) {
                this.socket = null;
                return;
            }
        });

        this.socket.on('error', (error) => {
            console.log('Socket error event:', error.message || 'Unknown error');
            
            if (this.listeners.has('error')) {
                const callback = this.listeners.get('error');
                callback(error);
            }
        });

        // Add timeout for connection to complete
        setTimeout(() => {
            if (this.isConnecting && this.connectionLock) {
                console.log('Connection attempt timed out');
                this.connectionLock = false;
                this.isConnecting = false;
                
                if (this.socket) {
                    this.socket.disconnect();
                    this.socket = null;
                }
            }
        }, 15000); // 15 second timeout
    }

    reattachEventListeners() {
        // Only proceed if we have a valid socket
        if (!this.socket || !this.socket.connected) return;
        
        console.log('Reattaching event listeners...');
        
        // Re-attach all event listeners from our registry
        this.listeners.forEach((callback, event) => {
            // Skip the connection events we manage internally
            if (['connect', 'connect_error', 'disconnect', 'error'].includes(event)) {
                return;
            }
            
            // Create a new callback wrapper and store it
            const wrappedCallback = (data) => {
                if (this.debug) console.log(`Received ${event} event:`, data);
                callback(data);
            };
            
            // Store the actual callback reference
            this.eventCallbacks.set(event, wrappedCallback);
            
            // Attach the listener
            console.log('Subscribing to event:', event);
            this.socket.on(event, wrappedCallback);
        });
    }

    handleConnectionError(error) {
        this.connectionAttempts++;
        this.isConnecting = false;
        
        // Check if the error is related to XHR polling
        const isXHRError = error.message?.toLowerCase?.()?.includes('xhr') || 
                          error.message?.toLowerCase?.()?.includes('polling');
        
        console.log(`Connection attempt ${this.connectionAttempts} failed:`, error.message);
        
        // After 2 failed attempts, disable socket functionality entirely
        if (this.connectionAttempts >= 2 || isXHRError) {
            this.disabled = true;
            
            const errorMessage = {
                type: 'CONNECTION_ERROR',
                message: `Socket connection unavailable (${error.message}). App will continue to function without live updates.`,
                isXHRError: isXHRError
            };
            
            console.log('Socket service disabled due to connection issues');
            
            // Clean up resources
            if (this.socket) {
                this.socket.disconnect();
                this.socket = null;
            }
            
            this.isConnecting = false;
            clearTimeout(this.reconnectTimer);
            
            if (this.listeners.has('error')) {
                const callback = this.listeners.get('error');
                callback(errorMessage);
            }
        }
    }

    detectDevice() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
        return isMobile ? 'mobile' : 'desktop';
    }

    handleReconnect() {
        // Prevent reconnecting if disabled or already connecting
        if (this.disabled || this.isConnecting || this.connectionLock) {
            console.log('Skipping reconnect attempt:', {
                disabled: this.disabled,
                isConnecting: this.isConnecting,
                connectionLock: this.connectionLock
            });
            return;
        }
        
        console.log('Attempting to reconnect...');
        clearTimeout(this.reconnectTimer);

        // Use exponential backoff with a cap
        const backoffDelay = Math.min(2000 * Math.pow(1.5, this.connectionAttempts - 1), 8000);

        this.reconnectTimer = setTimeout(() => {
            if (this.socket) {
                // Clear existing socket first
                this.socket.disconnect();
                this.socket = null;
            }
            // Create new connection
            this.connect();
        }, backoffDelay);
    }

    requestLiveMatches() {
        // Don't attempt if disabled
        if (this.disabled || !this.socket || !this.socket.connected) {
            console.log("Cannot request matches - socket status:", {
                disabled: this.disabled,
                socketExists: !!this.socket,
                connected: this.socket?.connected
            });
            return;
        }
        console.log('Requesting live matches from server with socket ID:', this.socket.id);
        
        // Track if we've already requested matches in this session
        if (!this.requestedMatches) {
            this.socket.emit('request_live_matches');
            this.requestedMatches = true;
            console.log('First live matches request sent');
        } else {
            console.log('Live matches already requested in this session');
        }
    }

    emitError(error) {
        const callback = this.listeners.get('error');
        if (callback) {
            callback(error);
        }
    }

    disconnect() {
        // Only disconnect when explicitly called by app shutdown
        // Don't disconnect during page navigations
        if (this.persistConnection) {
            console.log('Skipping disconnect due to persistConnection flag');
            return;
        }
        
        // Clear any pending reconnect attempts
        clearTimeout(this.reconnectTimer);
        
        if (this.socket) {
            try {
                console.log('Disconnecting socket...', this.socket.id);
                
                // Reset request tracking
                this.requestedMatches = false;
                
                // Remove all listeners first to prevent reconnection triggers
                this.socket.removeAllListeners();
                this.eventCallbacks.clear();
                
                // Then disconnect
                this.socket.disconnect();
            } catch (error) {
                console.log('Error during socket disconnect:', error.message);
            } finally {
                // Always reset socket state
                this.socket = null;
                this.connectionAttempts = 0;
                this.isConnecting = false;
                this.connectionLock = false;
                // Keep listeners for potential future connections
            }
        }
    }

    subscribe(event, callback) {
        // Store the callback even if we can't connect now
        this.listeners.set(event, callback);
        
        // Don't try to subscribe if disabled
        if (this.disabled) {
            console.log(`Socket service disabled. Saving listener for ${event} without connecting.`);
            return;
        }
        
        // Connect if needed
        if (!this.socket) {
            this.connect();
            return; // The event will be attached during connection
        }
        
        // Add listener if socket exists and is connected
        if (this.socket && this.socket.connected) {
            console.log('Subscribing to event:', event);
            
            // Create a wrapped callback function
            const wrappedCallback = (data) => {
                if (this.debug) console.log(`Received ${event} event:`, data);
                callback(data);
            };
            
            // Store the callback reference
            this.eventCallbacks.set(event, wrappedCallback);
            
            // Attach the listener
            this.socket.on(event, wrappedCallback);
        }
    }

    unsubscribe(event) {
        console.log('Unsubscribing from event:', event);
        
        // Remove the callback from our registry
        this.listeners.delete(event);
        
        // Also remove from the socket if it exists and is connected
        if (this.socket && this.socket.connected) {
            const callback = this.eventCallbacks.get(event);
            if (callback) {
                this.socket.off(event, callback);
                this.eventCallbacks.delete(event);
            }
        }
    }

    subscribeToMatch(matchId) {
        // Don't try to subscribe if disabled
        if (this.disabled) {
            return;
        }
        
        if (!this.socket) {
            this.connect();
        }
        
        if (!this.socket || !this.socket.connected) {
            return;
        }
        
        console.log('Subscribing to match:', matchId);
        this.socket.emit('subscribe_match', matchId);
    }

    unsubscribeFromMatch(matchId) {
        if (this.disabled || !this.socket || !this.socket.connected) {
            return;
        }
        
        console.log('Unsubscribing from match:', matchId);
        this.socket.emit('unsubscribe_match', matchId);
    }

    // Add a method to allow component unmounting without disconnecting socket
    releaseComponent() {
        console.log('Component released socket connection, maintaining for app');
        // Don't disconnect, just note that a component released its connection
    }

    /**
     * Request details for a specific match
     * @param {string} matchId - ID of match to request details for
     */
    requestMatchDetails(matchId) {
        if (this.disabled || !this.socket || !this.socket.connected) {
            console.log(`Cannot request match details for ${matchId}: socket unavailable`);
            return;
        }
        
        console.log(`Requesting details for match: ${matchId}`);
        this.socket.emit('request_match_details', matchId);
    }
}

// Create a singleton instance
const socketService = new SocketService();

// Expose socketService to window for debugging
if (process.env.NODE_ENV !== 'production') {
  window.socketService = socketService;
  console.log('socketService attached to window for debugging');
}

export default socketService; 