import { Server } from 'socket.io';
import http from 'http';
import { registerSocketEvents } from './socketEventHandlers.js';
import { initializeUpdateService } from './updateService.js';

/**
 * Configure and initialize Socket.IO server
 * @param {object} app - Express application instance
 * @returns {object} Socket.IO server instance and HTTP server
 */
export function setupSocketServer(app) {
  // Create HTTP server
  const server = http.createServer(app);
  
  console.log('Setting up Socket.IO server with enhanced debug settings');
  
  // Initialize Socket.IO with configuration
  const io = new Server(server, {
    cors: {
      // Enable CORS for all origins during testing
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
      credentials: true
    },
    // Transport configuration
    transports: ['polling', 'websocket'], // Explicitly set polling first for better compatibility
    allowUpgrades: true,
    upgradeTimeout: 10000,
    // Polling settings
    polling: {
      interval: 25000, // Polling interval in ms
    },
    // Connection settings
    pingTimeout: 60000,
    pingInterval: 25000,
    connectTimeout: 45000,
    // Reconnection settings
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    // Debugging
    debug: true
  });
  
  // Log server setup info
  console.log(`Socket.IO server configured with transports: ${io.engine.opts.transports.join(', ')}`);
  
  // Add middleware for logging transport type
  io.engine.on("connection", (socket) => {
    console.log(`New raw engine connection with transport: ${socket.transport.name}`);
  });
  
  // Log all connections and disconnections
  io.on('connection', (socket) => {
    const clientId = socket.id;
    const transport = socket.conn.transport.name;
    const clientInfo = {
      id: clientId,
      transport,
      address: socket.handshake.address,
      userAgent: socket.handshake.headers['user-agent'] || 'Unknown',
      query: socket.handshake.query
    };
    
    console.log(`Client connected: ${clientId} using ${transport}`);
    console.log('Connection details:', JSON.stringify(clientInfo, null, 2));
    
    // Setup ping/pong monitoring
    socket.conn.on('packet', (packet) => {
      if (packet.type === 'ping') {
        console.log(`Received ping from client ${socket.id}`);
      }
      if (packet.type === 'pong') {
        console.log(`Received pong from client ${socket.id}`);
      }
    });
    
    // Handle errors on this connection
    socket.conn.on('error', (err) => {
      console.error(`Transport error for client ${socket.id}:`, err.message);
    });
    
    // Set up default disconnect handler
    socket.on('disconnect', (reason) => {
      console.log(`Client disconnected: ${clientId}. Reason: ${reason}`);
    });
  });
  
  // Register all event handlers from socketEventHandlers.js
  registerSocketEvents(io);
  
  // Initialize the periodic update service if enabled
  if (process.env.ENABLE_PERIODIC_UPDATES !== 'false') {
    initializeUpdateService(io);
  }
  
  return { server, io };
}

/**
 * Get connected clients count
 * @param {object} io - Socket.IO server instance
 * @returns {object} Connected clients information
 */
export function getSocketStats(io) {
  return {
    totalConnections: io.engine.clientsCount,
    rooms: io.sockets.adapter.rooms,
    serverUptime: process.uptime()
  };
}

/**
 * Send a broadcast message to all connected clients
 * @param {object} io - Socket.IO server instance
 * @param {string} event - Event name to emit
 * @param {any} data - Data to send
 */
export function broadcastToAll(io, event, data) {
  io.emit(event, data);
  console.log(`Broadcast event '${event}' sent to all clients`);
} 