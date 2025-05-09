import { getActiveLiveMatches } from './matchService.js';

/**
 * Register all socket event handlers
 * @param {object} io - Socket.IO server instance
 */
export function registerSocketEvents(io) {
  io.on('connection', (socket) => {
    // Handle request for live matches
    socket.on('request_live_matches', async () => {
      try {
        console.log(`Client ${socket.id} requested live matches`);
        const matches = await getActiveLiveMatches();
        socket.emit('live_matches', matches);
        console.log(`Sent ${matches.length} live matches to client ${socket.id}`);
      } catch (error) {
        console.error('Error sending live matches:', error);
        socket.emit('error', { 
          type: 'FETCH_ERROR', 
          message: 'Failed to fetch live matches',
          details: error.message
        });
      }
    });
    
    // Handle match subscription
    socket.on('subscribe_match', (matchId) => {
      if (!matchId) {
        console.error(`Client ${socket.id} tried to subscribe to match without an ID`);
        socket.emit('error', { 
          type: 'SUBSCRIPTION_ERROR', 
          message: 'Match ID is required for subscription'
        });
        return;
      }
      
      const roomName = `match:${matchId}`;
      socket.join(roomName);
      console.log(`Client ${socket.id} subscribed to match ${matchId}`);
      
      // Send confirmation back to client
      socket.emit('subscription_success', { 
        matchId,
        message: 'Successfully subscribed to match updates'
      });
    });
    
    // Handle match unsubscription
    socket.on('unsubscribe_match', (matchId) => {
      if (!matchId) {
        console.error(`Client ${socket.id} tried to unsubscribe from match without an ID`);
        return;
      }
      
      const roomName = `match:${matchId}`;
      socket.leave(roomName);
      console.log(`Client ${socket.id} unsubscribed from match ${matchId}`);
      
      // Send confirmation back to client
      socket.emit('unsubscription_success', { 
        matchId,
        message: 'Successfully unsubscribed from match updates'
      });
    });
    
    // Handle client heartbeat (keeps connection alive)
    socket.on('heartbeat', (data) => {
      socket.emit('heartbeat_ack', { 
        timestamp: Date.now(),
        clientTimestamp: data?.timestamp
      });
    });
    
    // Handle custom event subscription
    socket.on('subscribe_event', (eventName) => {
      if (!eventName || typeof eventName !== 'string') {
        socket.emit('error', { 
          type: 'SUBSCRIPTION_ERROR', 
          message: 'Valid event name is required'
        });
        return;
      }
      
      const allowedEvents = ['goals', 'cards', 'substitutions'];
      if (!allowedEvents.includes(eventName)) {
        socket.emit('error', { 
          type: 'SUBSCRIPTION_ERROR', 
          message: `Event '${eventName}' is not available for subscription`
        });
        return;
      }
      
      const roomName = `event:${eventName}`;
      socket.join(roomName);
      console.log(`Client ${socket.id} subscribed to event ${eventName}`);
    });
    
    // Handle status requests
    socket.on('status', () => {
      socket.emit('status_response', {
        connected: true,
        rooms: Array.from(socket.rooms),
        uptime: process.uptime(),
        timestamp: Date.now()
      });
    });
    
    // Error handling for unhandled events
    socket.onAny((event, ...args) => {
      const handledEvents = [
        'request_live_matches', 
        'subscribe_match', 
        'unsubscribe_match',
        'heartbeat',
        'subscribe_event',
        'status'
      ];
      
      if (!handledEvents.includes(event)) {
        console.warn(`Received unknown event: ${event}`, args);
        socket.emit('error', { 
          type: 'UNKNOWN_EVENT', 
          message: `Event '${event}' is not supported`
        });
      }
    });
  });
} 