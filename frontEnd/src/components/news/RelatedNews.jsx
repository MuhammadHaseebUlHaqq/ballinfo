import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { getRelatedNews } from '../../services/newsService';
import '../../styles/news/RelatedNews.css';

/**
 * RelatedNewsItem component - Renders a single related news item with image loading
 */
const RelatedNewsItem = ({ article }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  return (
    <div key={article._id} className="related-news-item">
      <Link to={`/news/article/${article._id}`} className="related-news-link">
        <div className="related-news-image">
          {article.imageUrl && !imageError ? (
            <>
              {!imageLoaded && (
                <div className="related-news-image-loading-container">
                  <div className="related-news-image-loading"></div>
                </div>
              )}
              <img 
                src={article.imageUrl} 
                alt={article.title}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                style={{ opacity: imageLoaded ? 1 : 0 }}
              />
            </>
          ) : (
            <div className="related-news-placeholder">
              <span>La Liga</span>
            </div>
          )}
        </div>
        
        <div className="related-news-content">
          <h4 className="related-news-article-title">{article.title}</h4>
          
          <div className="related-news-meta">
            <span className="related-news-date">
              {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

/**
 * RelatedNews component - Displays related news articles
 * @param {Object} props - Component props
 * @param {string} props.articleId - Current article ID
 * @param {Array} props.tags - Tags from the current article
 * @param {string} props.category - Category of the current article
 */
const RelatedNews = ({ articleId, tags, category }) => {
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchRelatedNews = async () => {
      if (!articleId || (!tags?.length && !category)) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        // Get related news by tags and category, exclude current article
        const response = await getRelatedNews(articleId, tags, category);
        
        if (response.success) {
          setRelatedArticles(response.data);
        }
      } catch (err) {
        console.error('Error fetching related news:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRelatedNews();
  }, [articleId, tags, category]);
  
  if (loading) {
    return <div className="related-news-loading"></div>;
  }
  
  if (relatedArticles.length === 0) {
    return null; // Don't display if no related articles
  }
  
  return (
    <div className="related-news">
      <h3 className="related-news-title">Related Articles</h3>
      
      <div className="related-news-grid">
        {relatedArticles.map(article => (
          <RelatedNewsItem key={article._id} article={article} />
        ))}
      </div>
    </div>
  );
};

export default RelatedNews; 