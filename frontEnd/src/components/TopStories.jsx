import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import '../styles/TopStories.css';

// Mock data - would come from API in real app
const topStories = [
  {
    id: 1,
    title: 'Bellingham injury concern for Real Madrid ahead of El Clásico',
    summary: 'The England international limped off during training and is a doubt for Saturday\'s crucial encounter.',
    imageUrl: '/bellingham.jpg',
    author: 'Miguel Torres',
    date: '3 hours ago',
    tag: 'Injury Update'
  },
  {
    id: 2,
    title: 'Barcelona planning summer move for Man City star',
    summary: 'Sources close to the club suggest Joan Laporta is eyeing a major transfer coup this summer.',
    imageUrl: '/barca-transfer.jpg',
    author: 'Laura Martinez',
    date: '5 hours ago',
    tag: 'Transfer News'
  },
  {
    id: 3,
    title: 'Vinicius Jr: "I want to stay at Madrid for my entire career"',
    summary: 'The Brazilian winger has made it clear he sees his long-term future at the Santiago Bernabéu.',
    imageUrl: '/vinicius.jpg',
    author: 'Carlos Gomez',
    date: '8 hours ago',
    tag: 'Interview'
  },
  {
    id: 4,
    title: 'Atlético close in on Champions League qualification',
    summary: 'Simeone\'s men are on the verge of securing a top-four finish after victory over Mallorca.',
    imageUrl: '/atletico.jpg',
    author: 'Ana Rodriguez',
    date: '12 hours ago',
    tag: 'Match Report'
  }
];

const TopStories = () => {
  return (
    <div className="top-stories">
      <div className="section-title">
        Top Stories
        <Link to="/news" className="view-more">
          See All <FontAwesomeIcon icon={faChevronRight} />
        </Link>
      </div>
      
      <div className="stories-grid">
        {topStories.map((story) => (
          <div key={story.id} className="story-card">
            <Link to={`/news/${story.id}`} className="story-link">
              <div className="story-image">
                <img src={story.imageUrl || '/placeholder.jpg'} alt={story.title} />
                <span className="story-tag">{story.tag}</span>
              </div>
              
              <div className="story-content">
                <h3 className="story-title">{story.title}</h3>
                <p className="story-summary">{story.summary}</p>
                
                <div className="story-meta">
                  <span className="story-author">{story.author}</span>
                  <span className="story-date">{story.date}</span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopStories; 