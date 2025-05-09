import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// News API configuration
const NEWS_API_KEY = process.env.NEWS_API_KEY || 'fa2010cc097c49f9a1f42bf95c812d40';
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

/**
 * Service to interact with News API
 */
class NewsApiService {
  /**
   * Fetch top headlines for LaLiga
   * @param {Object} options - Query parameters
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.pageSize - Number of results per page (default: 10)
   * @returns {Promise<Object>} News API response
   */
  async getTopLaLigaHeadlines(options = {}) {
    const { page = 1, pageSize = 10 } = options;
    
    try {
      // Using 'everything' endpoint which is more reliable for specific queries
      const response = await axios.get(`${NEWS_API_BASE_URL}/everything`, {
        params: {
          q: 'soccer OR football OR "La Liga" OR LaLiga OR "Spanish League"',
          language: 'en',
          sortBy: 'publishedAt',
          page,
          pageSize,
          // Add domain parameter to guarantee we get results (major sports sites)
          domains: 'espn.com,goal.com,marca.com,bbc.co.uk,skysports.com,sportingnews.com',
          apiKey: NEWS_API_KEY
        }
      });
      
      // Log response data for debugging
      console.log(`News API found ${response.data.totalResults} articles for LaLiga`);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching LaLiga headlines:', error.message);
      console.error('Full error:', error.response?.data || error);
      throw error;
    }
  }

  /**
   * Search for news articles about a specific LaLiga team
   * @param {string} teamName - Name of the team
   * @param {Object} options - Query parameters
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.pageSize - Number of results per page (default: 10)
   * @returns {Promise<Object>} News API response
   */
  async getTeamNews(teamName, options = {}) {
    const { page = 1, pageSize = 10 } = options;
    
    try {
      const response = await axios.get(`${NEWS_API_BASE_URL}/everything`, {
        params: {
          q: `${teamName} (LaLiga OR "La Liga" OR football OR soccer)`,
          language: 'en',
          sortBy: 'publishedAt',
          page,
          pageSize,
          apiKey: NEWS_API_KEY
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching news for team ${teamName}:`, error.message);
      throw error;
    }
  }

  /**
   * Search for news by category
   * @param {string} category - Category to search for 
   * @param {Object} options - Query parameters
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.pageSize - Number of results per page (default: 10)
   * @returns {Promise<Object>} News API response
   */
  async getNewsByCategory(category, options = {}) {
    const { page = 1, pageSize = 10 } = options;
    
    // Map our internal categories to search terms
    const categoryTerms = {
      transfer: 'transfer OR signing OR deal',
      match_report: 'match OR game OR score OR result',
      injury: 'injury OR injured OR fitness OR recovery',
      preview: 'preview OR upcoming OR prepared',
      general: 'news OR update'
    };
    
    const searchTerm = categoryTerms[category] || category;
    
    try {
      const response = await axios.get(`${NEWS_API_BASE_URL}/everything`, {
        params: {
          q: `(LaLiga OR "La Liga") AND (${searchTerm})`,
          language: 'en',
          sortBy: 'publishedAt',
          page,
          pageSize,
          apiKey: NEWS_API_KEY
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching news for category ${category}:`, error.message);
      throw error;
    }
  }

  /**
   * Search for news by keyword
   * @param {string} query - Search query
   * @param {Object} options - Query parameters
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.pageSize - Number of results per page (default: 10)
   * @returns {Promise<Object>} News API response
   */
  async searchNews(query, options = {}) {
    const { page = 1, pageSize = 10 } = options;
    
    try {
      const response = await axios.get(`${NEWS_API_BASE_URL}/everything`, {
        params: {
          q: `(LaLiga OR "La Liga" OR "Spanish League") AND ${query}`,
          language: 'en',
          sortBy: 'relevancy',
          page,
          pageSize,
          apiKey: NEWS_API_KEY
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error searching news for query ${query}:`, error.message);
      throw error;
    }
  }
}

const newsApiService = new NewsApiService();
export default newsApiService; 