import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import matchesRouter from './routes/matches.js';
import teamRoutes from './routes/teamRoutes.js';
import mongoose from 'mongoose';
// Import the news routes
import newsRoutes from './routes/newsRoutes.js';
// Import admin routes
import adminRoutes from './routes/adminRoutes.js';
// Import WebSocket service
import { setupSocketServer } from '../services/socketService.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configure CORS to allow frontend access - enhanced for Socket.IO
const corsOptions = {
    origin: ['http://localhost:3001', 'http://localhost:3000', '*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-Admin-Auth'],
    preflightContinue: false,
    optionsSuccessStatus: 204
};

// Apply CORS first
app.use(cors(corsOptions));

// Add additional headers for Socket.IO connections
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Admin-Auth');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    
    next();
});

// Regular middleware
app.use(express.json());

// Routes
app.use('/api/matches', matchesRouter);
app.use('/api/teams', teamRoutes);
// Add news routes
app.use('/api/news', newsRoutes);
// Add admin routes
app.use('/api/admin', adminRoutes);

// Simple health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        status: 'error',
        message: err.message || 'Something broke!' 
    });
});

// Initialize Socket.IO
const { server, io } = setupSocketServer(app);

// Store io instance for use in other modules
app.set('io', io);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        
        // Start server
        server.listen(port, () => {
            console.log(`Server running on port: ${port}`);
            console.log(`WebSocket server initialized`);
        });
    })
    .catch((err) => console.error('MongoDB connection error:', err));

// Export for testing
export default app; 