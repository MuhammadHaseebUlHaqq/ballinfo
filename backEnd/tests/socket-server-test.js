import express from 'express';
import { setupSocketServer } from '../services/socketService.js';
import { registerSocketEvents } from '../services/socketEventHandlers.js';
import { initializeUpdateService } from '../services/updateService.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
// Import models to register schemas with Mongoose
import '../models/Team.js';
import '../models/Match.js';

// Load environment variables
dotenv.config();

/**
 * Simple test server for WebSocket functionality
 */
async function startTestSocketServer() {
  try {
    console.log('Starting WebSocket test server...');
    
    // Connect to MongoDB using the MONGO_URI from .env
    const mongoUri = process.env.MONGO_URI;
    console.log(`Attempting to connect to MongoDB Atlas with connection string`);
    
    if (!mongoUri) {
      console.error('Error: MONGO_URI not found in environment variables. Please check your .env file.');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas successfully');
    
    // Create Express app
    const app = express();
    
    // Add CORS middleware explicitly for test server
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.header('Access-Control-Allow-Credentials', 'true');
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        return res.status(204).end();
      }
      
      next();
    });
    
    // Setup Socket.IO
    const { server, io } = setupSocketServer(app);
    
    // Register event handlers
    registerSocketEvents(io);
    
    // Add a health check endpoint
    app.get('/health', (req, res) => {
      res.send({ 
        status: 'ok', 
        socketConnections: io.engine.clientsCount,
        uptime: process.uptime()
      });
    });
    
    // Add a simple test endpoint for client debugging
    app.get('/test-connection', (req, res) => {
      res.send({
        success: true,
        message: 'Test connection successful',
        timestamp: Date.now(),
        method: req.method,
        headers: req.headers,
        socketEnabled: true
      });
    });
    
    // Add endpoint to test XHR compatibility
    app.post('/xhr-test', express.json(), (req, res) => {
      res.send({
        success: true, 
        message: 'XHR test successful',
        received: req.body,
        timestamp: Date.now()
      });
    });
    
    // Add endpoint to get all active socket clients
    app.get('/clients', (req, res) => {
      const sockets = Array.from(io.sockets.sockets).map(([id, socket]) => ({
        id,
        handshake: {
          address: socket.handshake.address,
          time: socket.handshake.time,
          query: socket.handshake.query
        },
        rooms: Array.from(socket.rooms)
      }));
      
      res.send({ 
        count: sockets.length,
        clients: sockets
      });
    });
    
    // Add endpoint to trigger a test broadcast
    app.get('/broadcast', (req, res) => {
      const message = req.query.message || 'Test broadcast message';
      io.emit('broadcast', { 
        message, 
        timestamp: Date.now() 
      });
      
      res.send({ 
        success: true, 
        message: `Broadcasted: ${message}` 
      });
    });
    
    // Add endpoint to start/stop match updates
    app.get('/updates/:action', (req, res) => {
      const { action } = req.params;
      
      if (action === 'start') {
        const intervalId = initializeUpdateService(io);
        app.set('updateIntervalId', intervalId);
        res.send({ success: true, message: 'Started match updates' });
      } else if (action === 'stop') {
        const intervalId = app.get('updateIntervalId');
        if (intervalId) {
          clearInterval(intervalId);
          app.set('updateIntervalId', null);
          res.send({ success: true, message: 'Stopped match updates' });
        } else {
          res.status(400).send({ success: false, message: 'No update service running' });
        }
      } else {
        res.status(400).send({ success: false, message: 'Invalid action' });
      }
    });
    
    // Start the server
    const PORT = process.env.TEST_PORT || 3099;
    server.listen(PORT, () => {
      console.log(`Test Socket server running at http://localhost:${PORT}`);
      console.log(`Connect to WebSocket at ws://localhost:${PORT}`);
      console.log(`XHR Polling at http://localhost:${PORT}/socket.io/`);
      console.log('Available endpoints:');
      console.log(`- http://localhost:${PORT}/health - Server health check`);
      console.log(`- http://localhost:${PORT}/test-connection - Test client connection`);
      console.log(`- http://localhost:${PORT}/xhr-test (POST) - Test XHR compatibility`);
      console.log(`- http://localhost:${PORT}/clients - List connected clients`);
      console.log(`- http://localhost:${PORT}/broadcast?message=Hello - Send test broadcast`);
      console.log(`- http://localhost:${PORT}/updates/start - Start match updates`);
      console.log(`- http://localhost:${PORT}/updates/stop - Stop match updates`);
    });
    
    // Handle server shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down test server...');
      const intervalId = app.get('updateIntervalId');
      if (intervalId) {
        clearInterval(intervalId);
      }
      
      await mongoose.connection.close();
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Error starting test server:', error);
    process.exit(1);
  }
}

// Start the test server
startTestSocketServer(); 