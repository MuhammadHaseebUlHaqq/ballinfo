import axios from 'axios';

// Make sure we always have the correct API URL structure
const API_URL = 'http://localhost:3000/api';

// For debugging
console.log('News service API URL:', API_URL);

/**
 * Get paginated news articles
 * @param {number} page - Page number
 * @param {number} limit - Number of articles per page
 * @returns {Promise} - API response
 */
export const getAllNews = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/news?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching news:', error.response || error);
    throw error;
  }
};

/**
 * Get a specific news article by ID
 * @param {string} newsId - News article ID
 * @returns {Promise} - API response
 */
export const getNewsById = async (newsId) => {
  try {
    const response = await axios.get(`${API_URL}/news/${newsId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching news article:', error.response || error);
    throw error;
  }
};

/**
 * Get news articles by category
 * @param {string} category - Category to filter by
 * @param {number} page - Page number
 * @param {number} limit - Number of articles per page
 * @returns {Promise} - API response
 */
export const getNewsByCategory = async (category, page = 1, limit = 10) => {
  try {
    const response = await axios.get(
      `${API_URL}/news/category/${category}?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching news by category:', error.response || error);
    throw error;
  }
};

/**
 * Get news articles related to a specific team
 * @param {string} teamId - Team ID
 * @param {number} page - Page number
 * @param {number} limit - Number of articles per page
 * @returns {Promise} - API response
 */
export const getNewsByTeam = async (teamId, page = 1, limit = 10) => {
  try {
    const response = await axios.get(
      `${API_URL}/news/team/${teamId}?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching team news:', error.response || error);
    throw error;
  }
};

/**
 * Search news articles by keyword
 * @param {string} query - Search query
 * @param {number} page - Page number
 * @param {number} limit - Number of articles per page
 * @returns {Promise} - API response
 */
export const searchNews = async (query, page = 1, limit = 10) => {
  try {
    const response = await axios.get(
      `${API_URL}/news/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error('Error searching news:', error.response || error);
    throw error;
  }
};

/**
 * Fetch the latest 3-4 news articles for featured display
 * @param {number} limit - Number of articles to fetch
 * @returns {Promise} - API response with limited articles
 */
export const getFeaturedNews = async (limit = 4) => {
  try {
    const response = await axios.get(`${API_URL}/news?page=1&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching featured news:', error.response || error);
    throw error;
  }
};

/**
 * Get related news articles based on tags and category
 * @param {string} articleId - Current article ID to exclude
 * @param {Array} tags - Tags to match
 * @param {string} category - Category to match
 * @param {number} limit - Number of related articles to fetch
 * @returns {Promise} - API response with related articles
 */
export const getRelatedNews = async (articleId, tags = [], category, limit = 3) => {
  try {
    // Convert tags array to comma-separated string
    const tagsParam = tags && tags.length > 0 ? tags.join(',') : '';
    
    // Build URL with query parameters
    let url = `${API_URL}/news/related?`;
    if (articleId) url += `exclude=${articleId}&`;
    if (tagsParam) url += `tags=${encodeURIComponent(tagsParam)}&`;
    if (category) url += `category=${encodeURIComponent(category)}&`;
    url += `limit=${limit}`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching related news:', error.response || error);
    // Return empty data instead of throwing to prevent component errors
    return { success: false, data: [], message: error.message };
  }
}; 