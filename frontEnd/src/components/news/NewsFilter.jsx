import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import '../../styles/news/NewsFilter.css';

/**
 * NewsFilter component for filtering news articles by category and searching
 */
const NewsFilter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Categories match our backend categories
  const categories = [
    { id: 'all', label: 'All News' },
    { id: 'transfer', label: 'Transfers' },
    { id: 'match_report', label: 'Match Reports' },
    { id: 'injury', label: 'Injuries' },
    { id: 'preview', label: 'Previews' },
    { id: 'general', label: 'General' }
  ];
  
  // Determine active category from URL path
  const getCurrentCategory = () => {
    const path = location.pathname;
    if (path === '/news') return 'all';
    if (path.startsWith('/news/category/')) {
      const category = path.split('/').pop();
      return categories.some(c => c.id === category) ? category : 'all';
    }
    return 'all';
  };
  
  const [activeCategory, setActiveCategory] = useState(getCurrentCategory());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Update search query from URL on mount
  useEffect(() => {
    const query = searchParams.get('query') || '';
    setSearchQuery(query);
    setIsSearching(!!query);
  }, [searchParams]);
  
  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    
    // If we were searching, clear the search and navigate to category
    if (isSearching) {
      setSearchQuery('');
      setIsSearching(false);
    }
    
    if (categoryId === 'all') {
      navigate('/news');
    } else {
      navigate(`/news/category/${categoryId}`);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      setIsSearching(true);
      navigate(`/news/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Clear search and return to previous category
  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    
    if (activeCategory === 'all') {
      navigate('/news');
    } else {
      navigate(`/news/category/${activeCategory}`);
    }
  };
  
  return (
    <div className="news-filter">
      <div className="news-filter-header">
        <h2>La Liga News</h2>
        
        <form onSubmit={handleSearchSubmit} className="news-search-form">
          <div className="news-search-container">
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="news-search-input"
            />
            {searchQuery && (
              <button 
                type="button" 
                className="news-search-clear"
                onClick={clearSearch}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
            <button type="submit" className="news-search-button">
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>
        </form>
      </div>
      
      <div className="news-filter-categories">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`news-filter-button ${activeCategory === category.id && !isSearching ? 'active' : ''}`}
            onClick={() => handleCategoryChange(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>
      
      {isSearching && searchQuery && (
        <div className="news-search-results-header">
          <h3>Search results for: "{searchQuery}"</h3>
          <button onClick={clearSearch} className="news-search-back-button">
            Clear search
          </button>
        </div>
      )}
    </div>
  );
};

export default NewsFilter; 