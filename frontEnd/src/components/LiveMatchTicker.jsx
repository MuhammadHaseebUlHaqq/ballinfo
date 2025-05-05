import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import '../styles/LiveMatchTicker.css';

// Mock data - this would come from the API in a real app
const matchesData = [
  {
    id: 1,
    competition: 'La Liga',
    status: 'LIVE',
    time: '65\'',
    homeTeam: 'FC Barcelona',
    homeScore: 2,
    awayTeam: 'Real Madrid',
    awayScore: 1,
    homeTeamLogo: '/barca.png',
    awayTeamLogo: '/madrid.png'
  },
  {
    id: 2,
    competition: 'La Liga',
    status: 'LIVE',
    time: '38\'',
    homeTeam: 'Atletico Madrid',
    homeScore: 0,
    awayTeam: 'Valencia CF',
    awayScore: 0,
    homeTeamLogo: '/atletico.png',
    awayTeamLogo: '/valencia.png'
  },
  {
    id: 3,
    competition: 'La Liga',
    status: 'FT',
    time: '90+4\'',
    homeTeam: 'Sevilla FC',
    homeScore: 2,
    awayTeam: 'Real Betis',
    awayScore: 1,
    homeTeamLogo: '/sevilla.png',
    awayTeamLogo: '/betis.png'
  },
  {
    id: 4,
    competition: 'La Liga',
    status: 'SCHEDULED',
    time: 'Today, 21:00',
    homeTeam: 'Villarreal CF',
    homeScore: null,
    awayTeam: 'Athletic Bilbao',
    awayScore: null,
    homeTeamLogo: '/villarreal.png',
    awayTeamLogo: '/athletic.png'
  },
  {
    id: 5,
    competition: 'La Liga',
    status: 'SCHEDULED',
    time: 'Tomorrow, 16:00',
    homeTeam: 'Real Sociedad',
    homeScore: null,
    awayTeam: 'Granada CF',
    awayScore: null,
    homeTeamLogo: '/sociedad.png',
    awayTeamLogo: '/granada.png'
  }
];

const LiveMatchTicker = () => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      // Initial check
      checkScrollPosition();
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollPosition);
      }
    };
  }, []);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="live-ticker">
      <div className="ticker-header">
        <h3>Live Matches</h3>
        <div className="ticker-controls">
          <button 
            className={`control-button ${!canScrollLeft ? 'disabled' : ''}`}
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <button 
            className={`control-button ${!canScrollRight ? 'disabled' : ''}`}
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>
      
      <div className="ticker-scroll" ref={scrollContainerRef}>
        {matchesData.map((match) => (
          <div key={match.id} className={`match-card ${match.status.toLowerCase()}`}>
            <div className="match-header">
              <span className="competition">{match.competition}</span>
              <span className={`status ${match.status.toLowerCase()}`}>
                {match.status === 'LIVE' && '• '}
                {match.time}
              </span>
            </div>
            
            <div className="teams">
              <div className="team home">
                <img src={match.homeTeamLogo || '/placeholder.png'} alt={match.homeTeam} className="team-logo" />
                <span className="team-name">{match.homeTeam}</span>
              </div>
              
              <div className="score">
                {match.homeScore !== null ? `${match.homeScore} - ${match.awayScore}` : 'vs'}
              </div>
              
              <div className="team away">
                <img src={match.awayTeamLogo || '/placeholder.png'} alt={match.awayTeam} className="team-logo" />
                <span className="team-name">{match.awayTeam}</span>
              </div>
            </div>
            
            <div className="match-footer">
              <Link to={`/match/${match.id}`} className="match-link">Details</Link>
              <Link to={`/match/${match.id}/table`} className="match-link">Table</Link>
              <Link to={`/match/${match.id}/highlights`} className="match-link">Highlights</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveMatchTicker; 