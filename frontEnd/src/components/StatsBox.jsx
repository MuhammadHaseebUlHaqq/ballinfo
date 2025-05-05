import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import '../styles/StatsBox.css';

// Mock data - would come from API in real app
const statsItems = [
  {
    id: 1,
    title: 'Bellingham breaks record for most goals by a debutant',
    value: '16',
    unit: 'goals',
    description: 'Jude Bellingham has set a new record for most goals scored by a midfielder in their debut La Liga season with 16 goals in just 21 appearances.',
    icon: '🏆',
    color: '#e63946'
  },
  {
    id: 2,
    title: 'Barcelona\'s unbeaten home streak continues',
    value: '31',
    unit: 'matches',
    description: 'Barcelona have now gone 31 matches without defeat at the Camp Nou, their longest unbeaten home run since 2019.',
    icon: '🔥',
    color: '#457b9d'
  },
  {
    id: 3,
    title: 'La Liga leading goalscorer race heating up',
    value: '24',
    unit: 'goals',
    description: 'Robert Lewandowski leads the Pichichi race with 24 goals, just two ahead of Girona\'s Artem Dovbyk.',
    icon: '⚽',
    color: '#ff9f1c'
  },
  {
    id: 4,
    title: 'Women to score a ton and take a 4-for in the same ODI',
    value: '4',
    unit: 'players',
    description: 'Only four women have achieved the rare double of scoring a century and taking four wickets in the same ODI match, including Hayley Matthews.',
    icon: '🎯',
    color: '#2a9d8f'
  }
];

const StatsBox = () => {
  const [currentStat, setCurrentStat] = useState(0);
  
  const nextStat = () => {
    setCurrentStat((prev) => (prev === statsItems.length - 1 ? 0 : prev + 1));
  };
  
  const prevStat = () => {
    setCurrentStat((prev) => (prev === 0 ? statsItems.length - 1 : prev - 1));
  };
  
  const currentStatData = statsItems[currentStat];
  
  return (
    <div className="stats-box">
      <div className="section-title">
        Number Crunching
        <Link to="/stats" className="view-more">
          See All <FontAwesomeIcon icon={faChevronRight} />
        </Link>
      </div>
      
      <div className="stat-carousel">
        <div 
          className="stat-card"
          style={{ '--stat-color': currentStatData.color }}
        >
          <div className="stat-header">
            <span className="stat-icon">{currentStatData.icon}</span>
            <h3 className="stat-title">{currentStatData.title}</h3>
          </div>
          
          <div className="stat-value-container">
            <span className="stat-value">{currentStatData.value}</span>
            <span className="stat-unit">{currentStatData.unit}</span>
          </div>
          
          <p className="stat-description">{currentStatData.description}</p>
          
          <Link to={`/stats/${currentStatData.id}`} className="stat-link">
            More details <FontAwesomeIcon icon={faChevronRight} />
          </Link>
        </div>
        
        <div className="stat-controls">
          <button 
            className="stat-control prev"
            onClick={prevStat}
            aria-label="Previous stat"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          
          <div className="stat-indicators">
            {statsItems.map((_, index) => (
              <button
                key={index}
                className={`stat-indicator ${index === currentStat ? 'active' : ''}`}
                onClick={() => setCurrentStat(index)}
                aria-label={`Go to stat ${index + 1}`}
              />
            ))}
          </div>
          
          <button 
            className="stat-control next"
            onClick={nextStat}
            aria-label="Next stat"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsBox; 