import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faChevronRight, faPlay } from '@fortawesome/free-solid-svg-icons';
import '../styles/OnThisDay.css';

// Mock data - would come from API in real app
const onThisDayEvent = {
  id: 123,
  date: 'April 9, 2011',
  title: 'Messi scores his first El Clásico hat-trick',
  description: 'On this day in 2011, Lionel Messi scored his first-ever hat-trick against Real Madrid in a thrilling 3-2 victory for Barcelona at the Santiago Bernabéu.',
  imageUrl: '/messi-hatrick.jpg',
  videoUrl: '/videos/messi-hatrick-2011.mp4'
};

const OnThisDay = () => {
  return (
    <div className="on-this-day">
      <div className="section-title">
        On This Day
        <Link to="/history" className="view-more">
          See All <FontAwesomeIcon icon={faChevronRight} />
        </Link>
      </div>
      
      <div className="history-card">
        <div className="history-date">
          <FontAwesomeIcon icon={faCalendarAlt} className="calendar-icon" />
          <span>{onThisDayEvent.date}</span>
        </div>
        
        <div className="history-content">
          <h3 className="history-title">{onThisDayEvent.title}</h3>
          <p className="history-description">{onThisDayEvent.description}</p>
        </div>
        
        <div className="history-media">
          <div className="history-thumbnail">
            <img 
              src={onThisDayEvent.imageUrl || '/history-placeholder.jpg'} 
              alt={onThisDayEvent.title}
            />
            <div className="play-button">
              <FontAwesomeIcon icon={faPlay} />
            </div>
          </div>
        </div>
        
        <Link to={`/history/${onThisDayEvent.id}`} className="history-link">
          View Full Story <FontAwesomeIcon icon={faChevronRight} className="link-icon" />
        </Link>
      </div>
    </div>
  );
};

export default OnThisDay; 