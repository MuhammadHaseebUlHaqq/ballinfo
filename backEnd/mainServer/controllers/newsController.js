import News from '../models/News.js';
import Team from '../models/Team.js';

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
 * Get related news based on tags and category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getRelatedNews = async (req, res) => {
  try {
    const { exclude, tags, category } = req.query;
    const limit = parseInt(req.query.limit) || 3;
    
    // Parse tags to array if provided as string
    const tagsList = tags ? tags.split(',').map(tag => tag.trim()) : [];
    
    // Build query to find related articles
    let query = {};
    
    // Exclude current article if ID is provided
    if (exclude) {
      query._id = { $ne: exclude };
    }
    
    // If category provided, match it
    if (category) {
      query.category = category;
    }
    
    // If tags provided, find articles with any matching tags
    if (tagsList.length > 0) {
      query.tags = { $in: tagsList };
    }
    
    // Find related news
    const relatedNews = await News.find(query)
      .sort({ publishedAt: -1 })
      .limit(limit)
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

// These are simplified versions without external API calls
export const fetchAndStoreLatestNews = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'This endpoint would normally fetch and store news from external APIs'
  });
};

export const fetchAndStoreTeamNews = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'This endpoint would normally fetch and store team news from external APIs'
  });
}; 