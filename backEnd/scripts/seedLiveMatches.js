import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Match from '../models/Match.js';
import Team from '../models/Team.js';

dotenv.config();

async function seedLiveMatches() {
  try {
    // Connect to MongoDB using MONGO_URI from .env
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.error('Error: MONGO_URI not found in environment variables. Please check your .env file.');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas successfully');
    
    // Get all teams
    const teams = await Team.find();
    
    if (teams.length < 6) {
      console.error('Not enough teams in database. Please seed teams first.');
      process.exit(1);
    }
    
    // Delete existing live matches
    await Match.deleteMany({ status: 'LIVE' });
    console.log('Deleted existing live matches');
    
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
    
    // Print match details
    for (const match of liveMatches) {
      const homeTeam = await Team.findById(match.homeTeam);
      const awayTeam = await Team.findById(match.awayTeam);
      console.log(`Match ID: ${match._id}`);
      console.log(`${homeTeam.name} ${match.homeScore} - ${match.awayScore} ${awayTeam.name} (${match.minute}')`);
      console.log('---');
    }
    
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error seeding live matches:', error);
    
    // Make sure to close the connection even if there's an error
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    process.exit(1);
  }
}

// Execute the function
seedLiveMatches(); 