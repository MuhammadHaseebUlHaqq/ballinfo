import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    connect() {
        if (this.socket) return;

        this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:3000', {
            reconnectionDelay: 1000,
            reconnection: true,
            reconnectionAttempts: 10,
            transports: ['websocket'],
            agent: false,
            upgrade: false,
            rejectUnauthorized: false
        });

        this.socket.on('connect', () => {
            console.log('Connected to WebSocket server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    subscribe(event, callback) {
        if (!this.socket) this.connect();

        this.socket.on(event, callback);
        this.listeners.set(event, callback);
    }

    unsubscribe(event) {
        if (!this.socket) return;

        const callback = this.listeners.get(event);
        if (callback) {
            this.socket.off(event, callback);
            this.listeners.delete(event);
        }
    }

    subscribeToMatch(matchId) {
        if (!this.socket) this.connect();
        this.socket.emit('subscribe_match', matchId);
    }

    unsubscribeFromMatch(matchId) {
        if (!this.socket) return;
        this.socket.emit('unsubscribe_match', matchId);
    }
}

export default new SocketService(); 