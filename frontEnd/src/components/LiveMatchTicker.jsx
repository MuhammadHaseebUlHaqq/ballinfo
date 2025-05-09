import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import socketService from '../services/socketService';
import '../styles/LiveMatchTicker.css';

const LiveMatchTicker = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const mountedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate mounts
    if (mountedRef.current) {
      console.log("LiveMatchTicker already mounted, skipping duplicate mount");
      return;
    }
    
    mountedRef.current = true;
    console.log("LiveMatchTicker mounting...");

    // Connect to socket
    socketService.connect();

    // Listen for live matches updates
    socketService.subscribe('live_matches', (data) => {
      if (!mountedRef.current) return;
      
      console.log("Received live matches data:", data);

      // Validate and format the data
      const formattedMatches = data && Array.isArray(data) ? data.map(match => {
        // Validate required fields and provide defaults
        if (!match._id) {
          console.warn("Match missing ID:", match);
          return null;
        }

        return {
          id: match._id,
          competition: match.competition || 'Unknown League',
          homeTeam: {
            name: match.homeTeam?.name || 'Home Team',
            logo: match.homeTeam?.logo || '/placeholder-logo.png',
          },
          awayTeam: {
            name: match.awayTeam?.name || 'Away Team',
            logo: match.awayTeam?.logo || '/placeholder-logo.png',
          },
          homeScore: match.homeScore || 0,
          awayScore: match.awayScore || 0,
          date: match.date || new Date().toISOString(),
          status: match.status || 'SCHEDULED',
          minute: match.minute || null,
          isLive: match.status === 'LIVE',
          isFinished: match.status === 'FINISHED',
          isUpcoming: match.status === 'SCHEDULED',
          venue: match.venue || 'Stadium',
        };
      }).filter(Boolean) : [];
      
      console.log("Formatted matches:", formattedMatches.length);
      setMatches(formattedMatches);
      setLoading(false);
    });

    socketService.subscribe('error', (error) => {
      console.error('Socket error:', error);
      setError(typeof error === 'string' ? error : error.message || 'Unknown error');
      setLoading(false);
    });

    return () => {
      console.log("LiveMatchTicker unmounting...");
      socketService.unsubscribe('live_matches');
      socketService.unsubscribe('error');
      // Use releaseComponent instead of disconnect to maintain the socket connection
      socketService.releaseComponent();
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const checkScroll = () => {
      const container = scrollRef.current;
      if (container) {
        setCanScrollLeft(container.scrollLeft > 0);
        setCanScrollRight(
          container.scrollLeft < container.scrollWidth - container.clientWidth
        );
      }
    };

    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      checkScroll();
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScroll);
      }
    };
  }, [matches]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const formatMatchDateTime = (utcDate, minute, status) => {
    const date = new Date(utcDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    let timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    if (status === 'LIVE' && minute) {
      return { date: 'LIVE', time: `${minute}'` };
    }
    
    if (status === 'FINISHED') {
      return { date: 'FT', time: timeStr };
    }
    
    if (date.getDate() === today.getDate() && 
        date.getMonth() === today.getMonth() && 
        date.getFullYear() === today.getFullYear()) {
      return { date: 'Today', time: timeStr };
    }
    
    if (date.getDate() === tomorrow.getDate() && 
        date.getMonth() === tomorrow.getMonth() && 
        date.getFullYear() === tomorrow.getFullYear()) {
      return { date: 'Tomorrow', time: timeStr };
    }
    
    return { date: dateStr, time: timeStr };
  };

  if (loading) {
    return (
      <div className="live-ticker loading">
        <div className="loader"></div>
        <p>Loading matches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="live-ticker error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div className="live-ticker no-matches">
        <p>No matches found</p>
      </div>
    );
  }

  return (
    <div className="live-ticker">
      <div className="ticker-header">
        <h3>Live Matches</h3>
        <div className="ticker-controls">
          <button 
            className={`control-button ${!canScrollLeft ? 'disabled' : ''}`}
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
          >
            ◀
          </button>
          <button 
            className={`control-button ${!canScrollRight ? 'disabled' : ''}`}
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll right"
          >
            ▶
          </button>
        </div>
      </div>
      
      <div className="ticker-scroll" ref={scrollRef}>
        {matches.map((match) => {
          const { date, time } = formatMatchDateTime(match.date, match.minute, match.status);
          const statusClass = match.isLive ? 'live' : match.isFinished ? 'ft' : 'scheduled';
          
          return (
            <Link to={`/match/${match.id}`} key={match.id} className="match-link">
              <div className={`match-card ${statusClass}`}>
                <div className="match-header">
                  <div className="competition">{match.competition}</div>
                  <div className={`status ${statusClass}`}>
                    <div className="time">{time}</div>
                    <div className="date">{date}</div>
                  </div>
                </div>
                
                <div className="teams">
                  <div className="team">
                    <img 
                      src={match.homeTeam.logo}
                      alt={match.homeTeam.name}
                      className="team-logo"
                      onError={(e) => {
                        e.target.src = '/placeholder-team.png';
                      }}
                    />
                    <div className="team-name">{match.homeTeam.name}</div>
                  </div>
                  
                  <div className="score">
                    {match.homeScore} - {match.awayScore}
                  </div>
                  
                  <div className="team">
                    <img 
                      src={match.awayTeam.logo}
                      alt={match.awayTeam.name}
                      className="team-logo"
                      onError={(e) => {
                        e.target.src = '/placeholder-team.png';
                      }}
                    />
                    <div className="team-name">{match.awayTeam.name}</div>
                  </div>
                </div>
                
                <div className="match-footer">
                  {match.venue}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default LiveMatchTicker; 