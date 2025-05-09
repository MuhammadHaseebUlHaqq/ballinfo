import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useSearchParams } from 'react-router-dom';
import NewsFilter from './NewsFilter';
import NewsCard from './NewsCard';
import { getAllNews, getNewsByCategory, getNewsByTeam, searchNews } from '../../services/newsService';
import '../../styles/news/NewsPage.css';

/**
 * NewsPage component - Main page for displaying news articles
 */
const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const { category, teamId } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('query');
  
  // Reference for intersection observer
  const observer = useRef();
  const lastNewsElementRef = useCallback(node => {
    if (loading) return;
    
    // Disconnect previous observer
    if (observer.current) observer.current.disconnect();
    
    // Create new observer
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    }, { threshold: 0.5 });
    
    // Observe the last element
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);
  
  // Load news articles based on current route
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let response;
        
        if (searchQuery) {
          // Search for news
          response = await searchNews(searchQuery);
        } else if (category) {
          // Load news by category
          response = await getNewsByCategory(category);
        } else if (teamId) {
          // Load news by team
          response = await getNewsByTeam(teamId);
        } else {
          // Load all news
          response = await getAllNews();
        }
        
        if (response.success) {
          setNews(response.data);
          setHasMore(response.pagination.hasMore);
        } else {
          setError('Failed to load news articles');
        }
      } catch (err) {
        setError('An error occurred while fetching news articles');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNews();
    setPage(1); // Reset page when filter changes
  }, [category, teamId, location, searchQuery]);
  
  // Load more news articles
  const loadMore = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    
    try {
      let response;
      const nextPage = page + 1;
      
      if (searchQuery) {
        response = await searchNews(searchQuery, nextPage);
      } else if (category) {
        response = await getNewsByCategory(category, nextPage);
      } else if (teamId) {
        response = await getNewsByTeam(teamId, nextPage);
      } else {
        response = await getAllNews(nextPage);
      }
      
      if (response.success) {
        setNews(prev => [...prev, ...response.data]);
        setHasMore(response.pagination.hasMore);
        setPage(nextPage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="news-page">
      <NewsFilter />
      
      {error && (
        <div className="news-error-message">
          {error}
        </div>
      )}
      
      <div className="news-grid">
        {news.length > 0 && news.map((article, index) => (
          <div 
            key={article._id} 
            className={index === 0 ? 'news-grid-featured' : 'news-grid-item'}
            // Add ref to last element for infinite scroll
            ref={index === news.length - 1 ? lastNewsElementRef : undefined}
          >
            <NewsCard 
              article={article} 
              featured={index === 0}
            />
          </div>
        ))}
        
        {news.length === 0 && !loading && (
          <div className="news-empty-state">
            <h3>No news articles found</h3>
            <p>Try a different filter or check back later.</p>
          </div>
        )}
      </div>
      
      {loading && (
        <div className="news-loading">
          <div className="news-loading-spinner"></div>
          <p>Loading news articles...</p>
        </div>
      )}
    </div>
  );
};

export default NewsPage; 