import express from 'express';
import {
  getAllNews,
  getNewsById,
  getNewsByCategory,
  getNewsByTeam,
  searchNews,
  fetchAndStoreLatestNews,
  fetchAndStoreTeamNews,
  getRelatedNews
} from '../../controllers/newsController.js';

const router = express.Router();

// Get all news with pagination
router.get('/', getAllNews);

// Get related news based on tags and category
router.get('/related', getRelatedNews);

// Get news by category
router.get('/category/:category', getNewsByCategory);

// Get team-specific news
router.get('/team/:teamId', getNewsByTeam);

// Search news by keyword
router.get('/search', searchNews);

// Get a specific news article by ID
router.get('/:id', getNewsById);

// Fetch and store latest news from external API
router.post('/fetch/latest', fetchAndStoreLatestNews);

// Fetch and store team-specific news from external API
router.post('/fetch/team/:teamId', fetchAndStoreTeamNews);

export default router; 