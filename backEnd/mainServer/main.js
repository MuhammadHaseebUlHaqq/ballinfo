import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { createServer } from 'http';
import connectDB from "./db.js";
import dotenv from "dotenv";
import socketService from './services/socketService.js';
import playerStatsRouter from './routes/playerStats.js';

dotenv.config();

const port = process.env.PORT || 3000;

const app = express();
const httpServer = createServer(app);

// Initialize socket service
socketService.initialize(httpServer);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.get("/", (req, res) => {
    res.json({ message: "Welcome to BallInfo API" });
});

// Player Stats routes
app.use('/api/player-stats', playerStatsRouter);

app.post("/login", (req, res) => {
    // Login implementation
});

app.post("/signup", (req, res) => {
    // Signup implementation
});

app.get("/matchInfo", (req, res) => {
    // Match info implementation
});

// Start the server
httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`WebSocket server is ready for connections`);
});

