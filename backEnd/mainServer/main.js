import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { createServer } from 'http';
import connectDB from "./db.js";
import dotenv from "dotenv";
import socketService from './services/socketService.js';
import playerStatsRouter from './routes/playerStats.js';
import authRouter from './routes/auth.js';
import matchesRouter from './routes/matches.js';
import teamRoutes from './routes/teamRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const server = createServer(app);

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    next();
});

// CORS configuration
const corsOptions = {
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Auth-Token', 'Accept'],
    credentials: true
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Initialize socket service with CORS options
socketService.initialize(server, corsOptions);

// Test endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Mount routes
app.use('/api/matches', matchesRouter);
app.use('/api/player-stats', playerStatsRouter);
app.use('/api/auth', authRouter);
app.use('/api/teams', teamRoutes);
app.use('/api/news', newsRoutes);

// Handle 404 errors
app.use((req, res, next) => {
    res.status(404).json({
        status: 'error',
        message: `Cannot ${req.method} ${req.url}`
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Server URL: http://localhost:${PORT}`);
});


