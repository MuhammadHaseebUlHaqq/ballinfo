import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { getFeaturedNews } from '../../services/newsService';
import '../../styles/news/FeaturedNews.css';

/**
 * FeaturedNews component - Displays featured news articles on the homepage
 */
const FeaturedNews = () => {
  const [featuredNews, setFeaturedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch featured news on component mount
  useEffect(() => {
    const fetchFeaturedNews = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get featured news (limit to 3)
        const response = await getFeaturedNews(3);
        
        if (response.success) {
          setFeaturedNews(response.data);
        } else {
          setError('Failed to load featured news');
        }
      } catch (err) {
        setError('An error occurred while fetching featured news');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedNews();
  }, []);
  
  // Format the publication date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return '';
    }
  };
  
  if (loading) {
    return (
      <div className="featured-news-loading">
        <div className="featured-news-loading-spinner"></div>
      </div>
    );
  }
  
  if (error || featuredNews.length === 0) {
    return null; // Don't show anything if there's an error or no featured news
  }
  
  return (
    <div className="featured-news">
      <div className="featured-news-header">
        <h2>Latest LaLiga News</h2>
        <Link to="/news" className="featured-news-view-all">
          View All News
        </Link>
      </div>
      
      <div className="featured-news-grid">
        {featuredNews.map((article, index) => (
          <div 
            key={article._id} 
            className={`featured-news-item ${index === 0 ? 'featured-news-main' : 'featured-news-secondary'}`}
          >
            <Link 
              to={`/news/article/${article._id}`} 
              className="featured-news-link"
            >
              <div className="featured-news-image">
                {article.imageUrl ? (
                  <img src={article.imageUrl} alt={article.title} />
                ) : (
                  <div className="featured-news-image-placeholder">
                    <span>LaLiga News</span>
                  </div>
                )}
                
                <div className="featured-news-category">
                  {article.category.replace('_', ' ')}
                </div>
              </div>
              
              <div className="featured-news-content">
                <h3 className="featured-news-title">{article.title}</h3>
                
                {index === 0 && (
                  <p className="featured-news-summary">{article.summary}</p>
                )}
                
                <div className="featured-news-meta">
                  <span className="featured-news-source">
                    {article.source?.name}
                  </span>
                  <span className="featured-news-date">
                    {formatDate(article.publishedAt)}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedNews; 