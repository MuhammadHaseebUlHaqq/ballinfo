import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faFacebook, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faShare, faBookmark, faBookmark as faBookmarkSolid } from '@fortawesome/free-solid-svg-icons';
import { getNewsById } from '../../services/newsService';
import RelatedNews from './RelatedNews';
import '../../styles/news/NewsDetail.css';

/**
 * NewsDetail component - Displays a full news article
 */
const NewsDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Fetch the article data
  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getNewsById(id);
        
        if (response.success) {
          setArticle(response.data);
          // Check if article is saved in local storage
          const savedArticles = JSON.parse(localStorage.getItem('savedArticles') || '[]');
          setIsSaved(savedArticles.some(savedId => savedId === id));
        } else {
          setError('Failed to load the article');
        }
      } catch (err) {
        setError('An error occurred while fetching the article');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticle();
  }, [id]);
  
  // Format the date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    }
  };

  // Handle saving/unsaving an article
  const toggleSaveArticle = () => {
    const savedArticles = JSON.parse(localStorage.getItem('savedArticles') || '[]');
    
    if (isSaved) {
      // Remove article from saved
      const updatedSavedArticles = savedArticles.filter(savedId => savedId !== id);
      localStorage.setItem('savedArticles', JSON.stringify(updatedSavedArticles));
      setIsSaved(false);
    } else {
      // Add article to saved
      savedArticles.push(id);
      localStorage.setItem('savedArticles', JSON.stringify(savedArticles));
      setIsSaved(true);
    }
  };
  
  // Share article functions
  const shareOnTwitter = () => {
    const url = window.location.href;
    const text = article.title;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };
  
  const shareOnFacebook = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };
  
  const shareOnWhatsApp = () => {
    const url = window.location.href;
    const text = article.title;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
  };
  
  if (loading) {
    return (
      <div className="news-detail-loading">
        <div className="news-detail-loading-spinner"></div>
        <p>Loading article...</p>
      </div>
    );
  }
  
  if (error || !article) {
    return (
      <div className="news-detail-error">
        <h2>Error Loading Article</h2>
        <p>{error || 'Article not found'}</p>
        <Link to="/news" className="news-detail-back-button">
          Back to News
        </Link>
      </div>
    );
  }
  
  return (
    <div className="news-detail">
      <div className="news-detail-header">
        <Link to="/news" className="news-detail-back-link">
          ← Back to News
        </Link>
        
        <div className="news-detail-category">
          <Link to={`/news/category/${article.category}`}>
            {article.category.replace('_', ' ')}
          </Link>
        </div>
      </div>
      
      <h1 className="news-detail-title">{article.title}</h1>
      
      <div className="news-detail-meta">
        <div className="news-detail-source">
          {article.source?.name || 'Unknown source'}
        </div>
        <div className="news-detail-date">
          {formatDate(article.publishedAt)}
        </div>
      </div>
      
      <div className="news-detail-actions">
        <button 
          className="news-detail-save" 
          onClick={toggleSaveArticle}
          title={isSaved ? "Remove from saved" : "Save for later"}
        >
          <FontAwesomeIcon icon={isSaved ? faBookmarkSolid : faBookmark} />
          <span>{isSaved ? "Saved" : "Save"}</span>
        </button>
        
        <div className="news-detail-share">
          <button className="news-detail-share-button" title="Share on Twitter" onClick={shareOnTwitter}>
            <FontAwesomeIcon icon={faTwitter} />
          </button>
          <button className="news-detail-share-button" title="Share on Facebook" onClick={shareOnFacebook}>
            <FontAwesomeIcon icon={faFacebook} />
          </button>
          <button className="news-detail-share-button" title="Share on WhatsApp" onClick={shareOnWhatsApp}>
            <FontAwesomeIcon icon={faWhatsapp} />
          </button>
        </div>
      </div>
      
      {article.imageUrl && (
        <div className="news-detail-image">
          {!imageLoaded && (
            <div className="news-detail-image-loading">
              <div className="news-detail-image-spinner"></div>
            </div>
          )}
          <img 
            src={article.imageUrl} 
            alt={article.title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            style={{ 
              opacity: imageLoaded ? 1 : 0,
              display: imageError ? 'none' : 'block'
            }}
          />
          {imageError && (
            <div className="news-detail-image-error">
              <span>Image not available</span>
            </div>
          )}
        </div>
      )}
      
      <div className="news-detail-content">
        {article.content ? (
          <p>{article.content}</p>
        ) : (
          <p>{article.summary}</p>
        )}
      </div>
      
      {article.tags && article.tags.length > 0 && (
        <div className="news-detail-tags">
          <h3>Related Topics:</h3>
          <div className="news-detail-tags-list">
            {article.tags.map((tag, index) => (
              <span key={index} className="news-detail-tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {article.url && (
        <div className="news-detail-source-link">
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            Read original article
          </a>
        </div>
      )}
      
      {/* Related News Component */}
      <RelatedNews 
        articleId={id}
        tags={article.tags}
        category={article.category}
      />
    </div>
  );
};

export default NewsDetail; 