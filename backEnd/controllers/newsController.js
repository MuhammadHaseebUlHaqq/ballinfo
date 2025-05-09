import News from '../models/News.js';
import Team from '../models/Team.js';
import newsApiService from '../utils/newsApiService.js';
import { mapArticleToNewsModel, categorizeArticle } from '../utils/newsMapper.js';

/**
 * Get all news articles with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllNews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Query database for news articles with pagination
    const news = await News.find()
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('relatedTeams', 'name logo');
    
    // Get total count for pagination
    const total = await News.countDocuments();
    
    res.status(200).json({
      success: true,
      count: news.length,
      total,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + news.length < total
      },
      data: news
    });
  } catch (error) {
    console.error('Error in getAllNews controller:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Get a specific news article by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
      .populate('relatedTeams', 'name logo');
    
    if (!news) {
      return res.status(404).json({
        success: false,
        error: 'News article not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Error in getNewsById controller:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Get news articles by category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getNewsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Validate category
    const validCategories = ['transfer', 'match_report', 'injury', 'preview', 'general'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category'
      });
    }
    
    // Query database for news articles with the specified category
    const news = await News.find({ category })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('relatedTeams', 'name logo');
    
    // Get total count for pagination
    const total = await News.countDocuments({ category });
    
    res.status(200).json({
      success: true,
      count: news.length,
      total,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + news.length < total
      },
      data: news
    });
  } catch (error) {
    console.error('Error in getNewsByCategory controller:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Get news articles related to a specific team
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getNewsByTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Verify team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }
    
    // Query database for news articles related to the team
    const news = await News.find({ relatedTeams: teamId })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('relatedTeams', 'name logo');
    
    // Get total count for pagination
    const total = await News.countDocuments({ relatedTeams: teamId });
    
    res.status(200).json({
      success: true,
      count: news.length,
      total,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + news.length < total
      },
      data: news
    });
  } catch (error) {
    console.error('Error in getNewsByTeam controller:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Search news articles by keyword
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const searchNews = async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    // Create a text search query
    const searchQuery = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { summary: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ]
    };
    
    // Query database for news articles matching the search query
    const news = await News.find(searchQuery)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('relatedTeams', 'name logo');
    
    // Get total count for pagination
    const total = await News.countDocuments(searchQuery);
    
    res.status(200).json({
      success: true,
      count: news.length,
      total,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + news.length < total
      },
      data: news
    });
  } catch (error) {
    console.error('Error in searchNews controller:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Fetch latest news from News API and store in the database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const fetchAndStoreLatestNews = async (req, res) => {
  try {
    // Fetch latest LaLiga news from News API
    const newsApiResponse = await newsApiService.getTopLaLigaHeadlines({ pageSize: 20 });
    
    if (!newsApiResponse.articles || newsApiResponse.articles.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No articles found from News API'
      });
    }
    
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
      
      // Find related teams
      const teams = await Team.find({
        name: { $in: mappedArticle.tags.filter(tag => tag !== 'LaLiga') }
      });
      
      mappedArticle.relatedTeams = teams.map(team => team._id);
      
      // Save article to database
      const savedArticle = await News.create(mappedArticle);
      savedArticles.push(savedArticle);
    }
    
    res.status(201).json({
      success: true,
      count: savedArticles.length,
      message: `Successfully saved ${savedArticles.length} new articles`,
      data: savedArticles
    });
  } catch (error) {
    console.error('Error in fetchAndStoreLatestNews controller:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Fetch team-specific news and store in the database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const fetchAndStoreTeamNews = async (req, res) => {
  try {
    const { teamId } = req.params;
    
    // Verify team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }
    
    // Fetch team-specific news from News API
    const newsApiResponse = await newsApiService.getTeamNews(team.name, { pageSize: 15 });
    
    if (!newsApiResponse.articles || newsApiResponse.articles.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No articles found for team: ${team.name}`
      });
    }
    
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
      mappedArticle.relatedTeams = [teamId];
      
      // Save article to database
      const savedArticle = await News.create(mappedArticle);
      savedArticles.push(savedArticle);
    }
    
    res.status(201).json({
      success: true,
      count: savedArticles.length,
      message: `Successfully saved ${savedArticles.length} new articles for team: ${team.name}`,
      data: savedArticles
    });
  } catch (error) {
    console.error('Error in fetchAndStoreTeamNews controller:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Get related news articles based on tags and category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getRelatedNews = async (req, res) => {
  try {
    const { exclude, tags, category, limit = 3 } = req.query;
    
    // Convert comma-separated tags to array
    const tagsArray = tags ? tags.split(',') : [];
    
    // Build query for related news
    const query = {};
    
    // Exclude current article if ID provided
    if (exclude) {
      query._id = { $ne: exclude };
    }
    
    // Filter by category if provided
    if (category) {
      query.category = category;
    }
    
    // Filter by tags if provided (articles that match any of the tags)
    if (tagsArray.length > 0) {
      query.tags = { $in: tagsArray };
    }
    
    // If no filters are applied, return empty result
    if (Object.keys(query).length === 0 && !exclude) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
    
    // Find related articles
    const relatedNews = await News.find(query)
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit))
      .populate('relatedTeams', 'name logo');
    
    res.status(200).json({
      success: true,
      count: relatedNews.length,
      data: relatedNews
    });
  } catch (error) {
    console.error('Error in getRelatedNews controller:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}; 