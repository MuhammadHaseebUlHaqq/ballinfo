import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HeroBanner.css';

// Mock data - would come from API in real app
const featuredArticle = {
  id: 123,
  title: 'Can Barcelona Break Real Madrid\'s Winning Streak in El Clásico?',
  summary: 'Barcelona head to the Bernabéu this weekend looking to end Real Madrid\'s 5-game winning streak in El Clásico. With Lamine Yamal in spectacular form and Madrid dealing with injury concerns, is this Barça\'s chance to reclaim supremacy?',
  imageUrl: '/clasico-preview.jpg',
  author: 'Carlos Martínez',
  date: '2 hours ago',
  tag: 'Match Preview'
};

const HeroBanner = () => {
  return (
    <div className="hero-banner">
      <div className="hero-image">
        <img 
          src={featuredArticle.imageUrl || '/placeholder-wide.jpg'} 
          alt={featuredArticle.title}
          className="main-image" 
        />
        <div className="image-overlay"></div>
      </div>
      
      <div className="hero-content">
        <div className="article-meta">
          <span className="article-tag">{featuredArticle.tag}</span>
          <span className="article-date">{featuredArticle.date}</span>
        </div>
        
        <h1 className="article-title">{featuredArticle.title}</h1>
        
        <p className="article-summary">{featuredArticle.summary}</p>
        
        <div className="article-footer">
          <div className="author-info">
            <span className="by">By</span>
            <span className="author-name">{featuredArticle.author}</span>
          </div>
          
          <Link to={`/article/${featuredArticle.id}`} className="read-more-btn">
            Read Full Article
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner; 