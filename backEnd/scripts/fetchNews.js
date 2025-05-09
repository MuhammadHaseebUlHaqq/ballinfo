/**
 * Script to fetch and store latest LaLiga news from News API
 * This script can be run on a schedule (e.g., using cron)
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import News from '../models/News.js';
import Team from '../models/Team.js';
import newsApiService from '../utils/newsApiService.js';
import { mapArticleToNewsModel, categorizeArticle } from '../utils/newsMapper.js';

// Load environment variables
dotenv.config();

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ballinfo';

/**
 * Fetch and store latest LaLiga news
 */
async function fetchAndStoreLatestNews() {
  try {
    console.log('Fetching latest LaLiga news...');
    
    // Fetch latest LaLiga news from News API
    const newsApiResponse = await newsApiService.getTopLaLigaHeadlines({ pageSize: 20 });
    
    if (!newsApiResponse.articles || newsApiResponse.articles.length === 0) {
      console.log('No articles found from News API');
      return;
    }
    
    console.log(`Fetched ${newsApiResponse.articles.length} articles from News API`);
    
    // Process each article
    const savedArticles = [];
    for (const article of newsApiResponse.articles) {
      // Skip articles without a title or description
      if (!article.title || !article.description) {
        console.log('Skipping article with missing title or description');
        continue;
      }
      
      // Check if article already exists by URL to avoid duplicates
      const existingArticle = await News.findOne({ url: article.url });
      if (existingArticle) {
        console.log(`Article already exists: ${article.title}`);
        continue;
      }
      
      // Determine category and map to our model
      const category = categorizeArticle(article);
      const mappedArticle = mapArticleToNewsModel(article, category);
      
      // Find related teams
      const teams = await Team.find({
        name: { $in: mappedArticle.tags.filter(tag => tag !== 'LaLiga') }
      });
      
      mappedArticle.relatedTeams = teams.map(team => team._id);
      
      // Save article to database
      const savedArticle = await News.create(mappedArticle);
      savedArticles.push(savedArticle);
      console.log(`Saved article: ${savedArticle.title}`);
    }
    
    console.log(`Successfully saved ${savedArticles.length} new articles`);
    return savedArticles;
  } catch (error) {
    console.error('Error fetching and storing news:', error);
    throw error;
  }
}

/**
 * Fetch news for all teams in the database
 */
async function fetchAndStoreTeamNews() {
  try {
    console.log('Fetching news for all teams...');
    
    // Get all teams from the database
    const teams = await Team.find();
    
    if (!teams || teams.length === 0) {
      console.log('No teams found in the database');
      return;
    }
    
    console.log(`Found ${teams.length} teams in the database`);
    
    // Track total articles saved
    let totalSavedArticles = 0;
    
    // Process each team
    for (const team of teams) {
      console.log(`Fetching news for team: ${team.name}`);
      
      // Fetch team-specific news from News API
      const newsApiResponse = await newsApiService.getTeamNews(team.name, { pageSize: 10 });
      
      if (!newsApiResponse.articles || newsApiResponse.articles.length === 0) {
        console.log(`No articles found for team: ${team.name}`);
        continue;
      }
      
      console.log(`Fetched ${newsApiResponse.articles.length} articles for team: ${team.name}`);
      
      // Process each article
      const savedArticles = [];
      for (const article of newsApiResponse.articles) {
        // Skip articles without a title or description
        if (!article.title || !article.description) continue;
        
        // Check if article already exists by URL to avoid duplicates
        const existingArticle = await News.findOne({ url: article.url });
        if (existingArticle) continue;
        
        // Determine category and map to our model
        const category = categorizeArticle(article);
        const mappedArticle = mapArticleToNewsModel(article, category);
        
        // Add the team to relatedTeams
        mappedArticle.relatedTeams = [team._id];
        
        // Save article to database
        const savedArticle = await News.create(mappedArticle);
        savedArticles.push(savedArticle);
      }
      
      console.log(`Saved ${savedArticles.length} articles for team: ${team.name}`);
      totalSavedArticles += savedArticles.length;
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`Total articles saved for all teams: ${totalSavedArticles}`);
  } catch (error) {
    console.error('Error fetching and storing team news:', error);
    throw error;
  }
}

/**
 * Clean up old news articles (older than 30 days)
 */
async function cleanupOldNews() {
  try {
    console.log('Cleaning up old news articles...');
    
    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Find and delete old articles
    const result = await News.deleteMany({ publishedAt: { $lt: thirtyDaysAgo } });
    
    console.log(`Deleted ${result.deletedCount} old news articles`);
  } catch (error) {
    console.error('Error cleaning up old news:', error);
    throw error;
  }
}

/**
 * Main function to run the script
 */
async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
    
    // Run the news fetch operations
    await fetchAndStoreLatestNews();
    await fetchAndStoreTeamNews();
    await cleanupOldNews();
    
    console.log('News fetch completed successfully');
  } catch (error) {
    console.error('Error in news fetch script:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the script if it's executed directly
if (process.argv[1] === import.meta.url) {
  main().catch(console.error);
}

export {
  fetchAndStoreLatestNews,
  fetchAndStoreTeamNews,
  cleanupOldNews,
  main
}; 