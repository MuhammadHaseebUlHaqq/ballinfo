import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import '../styles/EditorsPicks.css';

// Mock data - would come from API in real app
const editorsPicks = [
  {
    id: 1,
    title: 'How Xavi reinvented Barcelona\'s midfield',
    summary: 'An in-depth tactical analysis of Barcelona\'s evolving midfield under Xavi.',
    imageUrl: '/xavi-tactics.jpg',
    author: 'Carlos Puyol',
    authorImage: '/authors/puyol.jpg',
    readTime: '6 min read'
  },
  {
    id: 2,
    title: 'Interview: Kroos reflects on Real Madrid journey',
    summary: 'The German midfielder opens up about his time at the Bernabéu and plans for the future.',
    imageUrl: '/kroos-interview.jpg',
    author: 'Miguel Torres',
    authorImage: '/authors/torres.jpg',
    readTime: '8 min read'
  },
  {
    id: 3,
    title: 'The rise of Spanish talent in the Premier League',
    summary: 'How La Liga\'s finest players are making their mark in England.',
    imageUrl: '/spanish-pl.jpg',
    author: 'Laura Martinez',
    authorImage: '/authors/martinez.jpg',
    readTime: '5 min read'
  }
];

const EditorsPicks = () => {
  return (
    <div className="editors-picks">
      <div className="section-title">
        Editor's Picks
        <Link to="/features" className="view-more">
          See All <FontAwesomeIcon icon={faChevronRight} />
        </Link>
      </div>
      
      <div className="picks-grid">
        {editorsPicks.map((article) => (
          <div key={article.id} className="pick-card">
            <Link to={`/features/${article.id}`} className="pick-link">
              <div className="pick-image">
                <img src={article.imageUrl || '/article-placeholder.jpg'} alt={article.title} />
              </div>
              
              <div className="pick-content">
                <h3 className="pick-title">{article.title}</h3>
                <p className="pick-summary">{article.summary}</p>
                
                <div className="pick-author">
                  <div className="author-avatar">
                    <img src={article.authorImage || '/author-placeholder.jpg'} alt={article.author} />
                  </div>
                  <div className="author-info">
                    <span className="author-name">{article.author}</span>
                    <span className="read-time">{article.readTime}</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditorsPicks; 