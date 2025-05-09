import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Team from '../models/Team.js';
import teams from '../data/teams.js';

// Configure dotenv
dotenv.config();

const seedTeams = async () => {
    try {
        // Connect to MongoDB using MONGO_URI (matching the .env variable name)
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing teams
        await Team.deleteMany({});
        console.log('Cleared existing teams');

        // Insert new teams
        await Team.insertMany(teams);
        console.log('Teams seeded successfully');

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');

    } catch (error) {
        console.error('Error seeding teams:', error);
        process.exit(1);
    }
};

seedTeams(); 