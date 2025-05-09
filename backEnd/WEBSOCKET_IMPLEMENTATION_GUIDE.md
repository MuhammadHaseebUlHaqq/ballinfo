# WebSocket Implementation Guide for BallInfo

This guide outlines the implementation of WebSocket functionality for real-time updates in the BallInfo application. The implementation is divided into three main parts with step-by-step instructions for each.

## Table of Contents
- [Part 1: Server-Side WebSocket Setup](#part-1-server-side-websocket-setup)
- [Part 2: Real-Time Data Management](#part-2-real-time-data-management)
- [Part 3: Client Integration & Testing](#part-3-client-integration--testing)
- [Testing Procedures](#testing-procedures)
- [Folder Structure](#folder-structure)

## Part 1: Server-Side WebSocket Setup

### 1.1 Core Socket.IO Setup
1. Create a WebSocket server module in `ballinfo/backend/services/socketService.js`:
   - Initialize Socket.IO with the HTTP server
   - Configure CORS settings for frontend access
   - Set up basic connection handling

```javascript
// services/socketService.js
import { Server } from 'socket.io';
import http from 'http';

/**
 * Configure and initialize Socket.IO server
 * @param {object} app - Express application instance
 * @returns {object} Socket.IO server instance
 */
export function setupSocketServer(app) {
  const server = http.createServer(app);
  
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3001',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });
  
  io.on('connection', (socket) => {
    const clientId = socket.id;
    console.log(`Client connected: ${clientId}`);
    
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${clientId}`);
    });
  });
  
  return { server, io };
}
```

### 1.2 Integrate with Main Server
2. Modify `mainServer/server.js` to use the WebSocket service:

```javascript
// mainServer/server.js modification
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import routes from './routes/index.js';
import { setupSocketServer } from '../services/socketService.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', routes);

// Initialize Socket.IO
const { server, io } = setupSocketServer(app);

// Store io instance for use in other modules
app.set('io', io);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ballinfo')
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Listen on port
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  });

export default app;
```

### 1.3 Create Event Handlers
3. Create a separate module for socket event handlers in `ballinfo/backend/services/socketEventHandlers.js`:

```javascript
// services/socketEventHandlers.js
import { getActiveLiveMatches } from './matchService.js';

/**
 * Register socket event handlers
 * @param {object} io - Socket.IO server instance
 */
export function registerSocketEvents(io) {
  io.on('connection', (socket) => {
    // Handle live match requests
    socket.on('request_live_matches', async () => {
      try {
        const matches = await getActiveLiveMatches();
        socket.emit('live_matches', matches);
      } catch (error) {
        console.error('Error sending live matches:', error);
        socket.emit('error', { message: 'Failed to fetch live matches' });
      }
    });
    
    // Handle match subscription
    socket.on('subscribe_match', (matchId) => {
      socket.join(`match:${matchId}`);
      console.log(`Client ${socket.id} subscribed to match ${matchId}`);
    });
    
    // Handle match unsubscription
    socket.on('unsubscribe_match', (matchId) => {
      socket.leave(`match:${matchId}`);
      console.log(`Client ${socket.id} unsubscribed from match ${matchId}`);
    });
  });
}
```

### 1.4 Create Test Server Script
4. Create a test script at `ballinfo/backend/tests/socket-server-test.js`:

```javascript
// tests/socket-server-test.js
import express from 'express';
import { setupSocketServer } from '../services/socketService.js';
import { registerSocketEvents } from '../services/socketEventHandlers.js';

/**
 * Simple test server for WebSocket
 */
function startTestSocketServer() {
  const app = express();
  const { server, io } = setupSocketServer(app);
  
  // Register event handlers
  registerSocketEvents(io);
  
  // Add a health check endpoint
  app.get('/health', (req, res) => {
    res.send({ status: 'ok', socketConnections: io.engine.clientsCount });
  });
  
  // Start the server
  const PORT = 3099;
  server.listen(PORT, () => {
    console.log(`Test Socket server running at http://localhost:${PORT}`);
    console.log(`Connect to WebSocket at ws://localhost:${PORT}`);
  });
}

// Start the test server
startTestSocketServer();
```

## Part 2: Real-Time Data Management

### 2.1 Live Match Service
5. Create a match service in `ballinfo/backend/services/matchService.js`:

```javascript
// services/matchService.js
import Match from '../models/Match.js';

/**
 * Get all currently active matches
 * @returns {Array} Array of live match objects
 */
export async function getActiveLiveMatches() {
  try {
    const matches = await Match.find({ status: 'LIVE' })
      .populate('homeTeam')
      .populate('awayTeam')
      .sort({ startTime: -1 })
      .limit(20);
    
    return matches;
  } catch (error) {
    console.error('Error fetching live matches:', error);
    throw error;
  }
}

/**
 * Update match data and notify subscribed clients
 * @param {object} io - Socket.IO server instance
 * @param {string} matchId - ID of the match to update
 * @param {object} updateData - New match data
 */
export async function updateMatchAndNotify(io, matchId, updateData) {
  try {
    // Update match in database
    const updatedMatch = await Match.findByIdAndUpdate(
      matchId,
      { $set: updateData },
      { new: true }
    ).populate('homeTeam').populate('awayTeam');
    
    if (!updatedMatch) {
      console.error(`Match not found: ${matchId}`);
      return null;
    }
    
    // Notify all clients subscribed to this match
    io.to(`match:${matchId}`).emit('match_updated', updatedMatch);
    
    // Also update the general live matches list for all connected clients
    const liveMatches = await getActiveLiveMatches();
    io.emit('live_matches', liveMatches);
    
    return updatedMatch;
  } catch (error) {
    console.error('Error updating match:', error);
    throw error;
  }
}
```

### 2.2 Match Update Route
6. Create an admin route for match updates in `ballinfo/backend/routes/adminRoutes.js`:

```javascript
// routes/adminRoutes.js
import express from 'express';
import { updateMatchAndNotify } from '../services/matchService.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Update match data and broadcast to subscribed clients
 * POST /api/admin/matches/:id/update
 */
router.post('/matches/:id/update', authMiddleware.isAdmin, async (req, res) => {
  try {
    const matchId = req.params.id;
    const updateData = req.body;
    const io = req.app.get('io');
    
    const updatedMatch = await updateMatchAndNotify(io, matchId, updateData);
    
    if (!updatedMatch) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Match updated successfully',
      data: updatedMatch
    });
  } catch (error) {
    console.error('Error in match update endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating match',
      error: error.message
    });
  }
});

export default router;
```

### 2.3 Periodic Updates Service
7. Create a service for periodic match updates in `ballinfo/backend/services/updateService.js`:

```javascript
// services/updateService.js
import axios from 'axios';
import { updateMatchAndNotify, getActiveLiveMatches } from './matchService.js';

// Cache for tracking when we last updated each match
const matchUpdateCache = new Map();
const UPDATE_INTERVAL = 60000; // 1 minute

/**
 * Initialize the periodic update service
 * @param {object} io - Socket.IO server instance
 */
export function initializeUpdateService(io) {
  // Set up periodic updates for live matches
  setInterval(async () => {
    try {
      // Get all current live matches
      const liveMatches = await getActiveLiveMatches();
      
      // Nothing to update if no live matches
      if (!liveMatches || liveMatches.length === 0) return;
      
      // Update the client's live match list
      io.emit('live_matches', liveMatches);
      
      // Check each match for updates if enough time has passed since last update
      for (const match of liveMatches) {
        const matchId = match._id.toString();
        const lastUpdate = matchUpdateCache.get(matchId) || 0;
        const now = Date.now();
        
        if (now - lastUpdate > UPDATE_INTERVAL) {
          // In a real app, you'd fetch updates from an external API
          // Here we're just simulating with random score updates
          await simulateMatchUpdate(io, match);
          matchUpdateCache.set(matchId, now);
        }
      }
    } catch (error) {
      console.error('Error in periodic match update:', error);
    }
  }, 10000); // Check every 10 seconds
}

/**
 * Simulate a match update (for testing)
 * In production, replace with real API calls
 * @param {object} io - Socket.IO server instance
 * @param {object} match - Match object to update
 */
async function simulateMatchUpdate(io, match) {
  // Only 20% chance of an update
  if (Math.random() > 0.2) return;
  
  const updateTypes = ['goal', 'yellowCard', 'redCard', 'substitution', 'clockUpdate'];
  const updateType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
  
  let updateData = { lastUpdated: new Date() };
  
  switch (updateType) {
    case 'goal':
      // Random team scores
      if (Math.random() > 0.5) {
        updateData.homeScore = match.homeScore + 1;
      } else {
        updateData.awayScore = match.awayScore + 1;
      }
      break;
    case 'clockUpdate':
      // Update the clock
      updateData.minute = Math.min(90, match.minute + Math.floor(Math.random() * 5));
      break;
    // Add other update types as needed
  }
  
  await updateMatchAndNotify(io, match._id, updateData);
}
```

### 2.4 Create Mock Data Script
8. Create a script to seed mock live match data in `ballinfo/backend/scripts/seedLiveMatches.js`:

```javascript
// scripts/seedLiveMatches.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Match from '../models/Match.js';
import Team from '../models/Team.js';

dotenv.config();

async function seedLiveMatches() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ballinfo');
    console.log('Connected to MongoDB');
    
    // Get all teams
    const teams = await Team.find();
    
    if (teams.length < 6) {
      console.error('Not enough teams in database. Please seed teams first.');
      process.exit(1);
    }
    
    // Delete existing live matches
    await Match.deleteMany({ status: 'LIVE' });
    
    // Create some live matches with random teams
    const liveMatches = [];
    
    for (let i = 0; i < 5; i++) {
      // Select random home and away teams
      const homeTeamIndex = Math.floor(Math.random() * teams.length);
      let awayTeamIndex;
      do {
        awayTeamIndex = Math.floor(Math.random() * teams.length);
      } while (awayTeamIndex === homeTeamIndex);
      
      const homeTeam = teams[homeTeamIndex];
      const awayTeam = teams[awayTeamIndex];
      
      // Random scores
      const homeScore = Math.floor(Math.random() * 4);
      const awayScore = Math.floor(Math.random() * 4);
      
      // Random match minute (0-90)
      const minute = Math.floor(Math.random() * 90);
      
      const match = new Match({
        competition: 'LaLiga',
        season: '2023/24',
        homeTeam: homeTeam._id,
        awayTeam: awayTeam._id,
        homeScore,
        awayScore,
        status: 'LIVE',
        minute,
        startTime: new Date(),
        events: []
      });
      
      await match.save();
      liveMatches.push(match);
    }
    
    console.log(`Created ${liveMatches.length} live matches`);
    console.log(liveMatches.map(m => `${m._id}: Match between teams ${m.homeTeam} and ${m.awayTeam}`));
    
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding live matches:', error);
  }
}

seedLiveMatches();
```

## Part 3: Client Integration & Testing

### 3.1 Socket Client Service Improvements
9. Create a client test script in `ballinfo/backend/tests/socket-client-test.js`:

```javascript
// tests/socket-client-test.js
import { io } from 'socket.io-client';

/**
 * Test client for WebSocket server
 */
function startTestClient() {
  // Connect to test server
  const socket = io('http://localhost:3099', {
    transports: ['websocket', 'polling']
  });
  
  // Connection events
  socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
    
    // Request live matches after connection
    socket.emit('request_live_matches');
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });
  
  socket.on('connect_error', (error) => {
    console.error('Connection error:', error.message);
  });
  
  // Data events
  socket.on('live_matches', (matches) => {
    console.log(`Received ${matches.length} live matches:`);
    matches.forEach(match => {
      console.log(`- Match ID: ${match._id}, Score: ${match.homeScore}-${match.awayScore}`);
      
      // Subscribe to first match for detailed updates
      if (matches.indexOf(match) === 0) {
        console.log(`Subscribing to match ${match._id}`);
        socket.emit('subscribe_match', match._id);
      }
    });
  });
  
  socket.on('match_updated', (match) => {
    console.log(`Match updated: ${match._id}`);
    console.log(`New score: ${match.homeScore}-${match.awayScore}, Minute: ${match.minute}`);
  });
  
  socket.on('error', (error) => {
    console.error('Received error from server:', error);
  });
  
  // Clean disconnection on CTRL+C
  process.on('SIGINT', () => {
    console.log('Disconnecting from server...');
    socket.disconnect();
    process.exit();
  });
}

startTestClient();
```

### 3.2 Improve Frontend Socket Service
10. Improvements for the frontend `socketService.js` have already been implemented. Make sure these updates are integrated.

### 3.3 Socket Connection Status Component
11. The ConnectionStatus component has been created and integrated into the App.js.

### 3.4 Create Match Subscription Hook
12. Create a custom React hook for match subscriptions in `ballinfo/frontend/src/hooks/useMatchSubscription.js`:

```javascript
// hooks/useMatchSubscription.js
import { useState, useEffect } from 'react';
import socketService from '../services/socketService';

/**
 * Custom hook for subscribing to real-time match updates
 * @param {string} matchId - ID of match to subscribe to
 * @returns {object} Match data and loading state
 */
export function useMatchSubscription(matchId) {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!matchId) return;
    
    // Callback for receiving match updates
    const handleMatchUpdate = (updatedMatch) => {
      if (updatedMatch._id === matchId) {
        setMatch(updatedMatch);
        setLoading(false);
      }
    };
    
    // Subscribe to match updates
    socketService.subscribeToMatch(matchId);
    socketService.subscribe('match_updated', handleMatchUpdate);
    
    // Handle socket errors
    const handleError = (err) => {
      setError(err);
      setLoading(false);
    };
    socketService.subscribe('error', handleError);
    
    // Clean up subscriptions when unmounting
    return () => {
      socketService.unsubscribeFromMatch(matchId);
      socketService.unsubscribe('match_updated');
      socketService.unsubscribe('error');
    };
  }, [matchId]);
  
  return { match, loading, error };
}
```

## Testing Procedures

### 1. Server Component Tests
1. Start the backend server:
   ```bash
   cd ballinfo/backend
   npm start
   ```

2. Run the WebSocket test server:
   ```bash
   cd ballinfo/backend
   node tests/socket-server-test.js
   ```

3. Run the WebSocket test client:
   ```bash
   cd ballinfo/backend
   node tests/socket-client-test.js
   ```

### 2. Seed Test Data
1. Seed mock live match data:
   ```bash
   cd ballinfo/backend
   node scripts/seedLiveMatches.js
   ```

### 3. Integration Testing
1. Start the backend and frontend:
   ```bash
   # Terminal 1
   cd ballinfo/backend
   npm start
   
   # Terminal 2
   cd ballinfo/frontend
   npm start
   ```

2. Test frontend WebSocket functionality:
   - Navigate to the homepage to see live match ticker
   - Check browser console for socket connection logs
   - Verify ConnectionStatus component hides/shows appropriately
   - Test match details page for live updates

## Folder Structure

```
ballinfo/
├── backend/
│   ├── mainServer/
│   │   └── server.js              # Main server entry point (modified)
│   ├── models/
│   │   ├── Match.js               # Match model
│   │   └── Team.js                # Team model
│   ├── services/
│   │   ├── socketService.js       # WebSocket server setup
│   │   ├── socketEventHandlers.js # WebSocket event handlers
│   │   ├── matchService.js        # Live match data service
│   │   └── updateService.js       # Periodic update service
│   ├── routes/
│   │   ├── index.js               # Main API routes
│   │   └── adminRoutes.js         # Admin routes for match updates
│   ├── scripts/
│   │   └── seedLiveMatches.js     # Script to create mock live matches
│   ├── tests/
│   │   ├── socket-server-test.js  # WebSocket server test
│   │   └── socket-client-test.js  # WebSocket client test
│   └── WEBSOCKET_IMPLEMENTATION_GUIDE.md # This guide
├── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── LiveMatchTicker.js           # Live match display
    │   │   └── common/
    │   │       └── ConnectionStatus.jsx      # Socket status component
    │   ├── services/
    │   │   └── socketService.js             # Frontend Socket.IO client
    │   ├── hooks/
    │   │   └── useMatchSubscription.js      # Custom hook for match updates
    │   └── App.js                           # Main application component
```

## Implementation Timeline

1. **Day 1**: Set up server-side WebSocket infrastructure (Part 1)
2. **Day 2**: Implement real-time data management services (Part 2)
3. **Day 3**: Integrate with frontend and test all functionality (Part 3)

This phased approach ensures methodical implementation and thorough testing at each stage.

---

**Note**: This guide assumes an existing MongoDB setup with Team and Match models. If these don't exist, you'll need to create them before implementing WebSocket functionality. 