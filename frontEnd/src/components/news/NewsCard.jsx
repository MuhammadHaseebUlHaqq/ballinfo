import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import '../../styles/news/NewsCard.css';

/**
 * Highlights search terms in text
 * @param {string} text - The text to highlight
 * @param {string} searchTerm - The search term to highlight
 * @returns {JSX.Element|string} - Highlighted text as JSX or original text
 */
const highlightText = (text, searchTerm) => {
  if (!searchTerm || !text) return text;
  
  // Escape special characters in search term for regex
  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
  
  const parts = text.split(regex);
  
  if (parts.length <= 1) return text;
  
  return parts.map((part, index) => {
    if (part.toLowerCase() === searchTerm.toLowerCase()) {
      return <span key={index} className="news-card-highlight">{part}</span>;
    }
    return part;
  });
};

/**
 * NewsCard component displays a single news article in card format
 * @param {Object} props - Component props
 * @param {Object} props.article - The news article data
 * @param {boolean} props.featured - Whether this is a featured card (larger)
 */
const NewsCard = ({ article, featured = false }) => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('query');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Handle missing article or data
  if (!article) return null;

  // Format the date as "X time ago"
  const formattedDate = article.publishedAt
    ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
    : 'Unknown date';

  // Handle image load event
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Handle image error event
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={`news-card ${featured ? 'news-card-featured' : ''}`}>
      <Link to={`/news/article/${article._id}`} className="news-card-link">
        <div className="news-card-image">
          {article.imageUrl && !imageError ? (
            <>
              {!imageLoaded && (
                <div className="news-card-image-placeholder">
                  <div className="news-card-image-loading"></div>
                </div>
              )}
              <img 
                src={article.imageUrl} 
                alt={article.title}
                loading="lazy"
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{ opacity: imageLoaded ? 1 : 0 }}
              />
            </>
          ) : (
            <div className="news-card-image-placeholder">
              <span>La Liga</span>
            </div>
          )}
          <span className="news-card-category">{article.category}</span>
        </div>
        
        <div className="news-card-content">
          <h3 className="news-card-title">
            {searchQuery ? highlightText(article.title, searchQuery) : article.title}
          </h3>
          <p className="news-card-summary">
            {searchQuery ? highlightText(article.summary, searchQuery) : article.summary}
          </p>
          
          <div className="news-card-meta">
            <div className="news-card-source">
              {article.source?.name || 'Unknown source'}
            </div>
            <div className="news-card-date">{formattedDate}</div>
          </div>
          
          {article.tags && article.tags.length > 0 && (
            <div className="news-card-tags">
              {article.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="news-card-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default NewsCard; 