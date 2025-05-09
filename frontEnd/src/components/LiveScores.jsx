import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faClock, 
  faCalendarAlt, 
  faExclamationTriangle,
  faSync
} from '@fortawesome/free-solid-svg-icons';
import '../styles/LiveScores.css';

// API configuration
const API_BASE_URL = 'http://localhost:3000/api/matches';

const LiveScores = () => {
  const [matches, setMatches] = useState({ live: [], previous: [] });
  const [loading, setLoading] = useState({ live: true, previous: true });
  const [error, setError] = useState({ live: null, previous: null });
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchMatches = useCallback(async () => {
    const fetchData = async (endpoint) => {
      try {
        console.log(`Fetching ${endpoint} matches from ${API_BASE_URL}/${endpoint}`);
        const response = await axios.get(`${API_BASE_URL}/${endpoint}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`${endpoint} matches response:`, response.data);
        
        if (!response.data || (response.data.status === 'error')) {
          throw new Error(response.data?.message || `Failed to fetch ${endpoint} matches`);
        }

        return response.data.matches || [];
      } catch (err) {
        console.error(`Error fetching ${endpoint} matches:`, err);
        throw new Error(err.response?.data?.message || err.message);
      }
    };

    // Fetch live matches
    try {
      setLoading(prev => ({ ...prev, live: true }));
      setError(prev => ({ ...prev, live: null }));
      const liveMatches = await fetchData('live');
      setMatches(prev => ({ ...prev, live: liveMatches }));
    } catch (err) {
      console.error('Error fetching live matches:', err);
      setError(prev => ({ ...prev, live: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, live: false }));
    }

    // Fetch previous matches
    try {
      setLoading(prev => ({ ...prev, previous: true }));
      setError(prev => ({ ...prev, previous: null }));
      const previousMatches = await fetchData('previous');
      setMatches(prev => ({ ...prev, previous: previousMatches }));
    } catch (err) {
      console.error('Error fetching previous matches:', err);
      setError(prev => ({ ...prev, previous: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, previous: false }));
      setLastUpdated(new Date());
    }
  }, []);

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 60000);
    return () => clearInterval(interval);
  }, [fetchMatches]);

  const formatMatchDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return 'Date unavailable';
    }
  };

  const formatMatchTime = (dateString) => {
    try {
      return format(new Date(dateString), 'HH:mm');
    } catch {
      return '--:--';
    }
  };

  const renderMatchCard = (match, isLive = false) => {
    const handleImageError = (e) => {
      e.target.onerror = null;
      e.target.src = '/placeholder-team-logo.png';
    };

    return (
      <div 
        key={match.id}
        className={`match-card ${isLive ? 'live' : ''} ${match.status.toLowerCase()}`}
      >
        <div className="match-header">
          <div className="competition-info">
            <span className="competition-name">{match.competition}</span>
            <span className="match-date">
              <FontAwesomeIcon icon={faCalendarAlt} className="icon" />
              {formatMatchDate(match.utcDate)}
            </span>
          </div>
          {isLive && match.status !== 'FINISHED' && (
            <div className="live-badge">
              {match.status === 'PAUSED' ? 'HT' : 'LIVE'}
            </div>
          )}
        </div>

        <div className="match-content">
          <div className="team home">
            <div className="team-logo-container">
              <img 
                src={match.homeTeam.crest}
                alt={`${match.homeTeam.name} logo`}
                className="team-logo"
                onError={handleImageError}
                loading="lazy"
              />
            </div>
            <span className="team-name">{match.homeTeam.name}</span>
          </div>

          <div className="score-container">
            <div className="score">
              <span className="score-number">{match.homeTeam.score}</span>
              <span className="score-divider">-</span>
              <span className="score-number">{match.awayTeam.score}</span>
            </div>
            <div className="match-time">
              <FontAwesomeIcon icon={faClock} className="icon" />
              {isLive && match.status !== 'FINISHED' 
                ? `${match.minute}'` 
                : formatMatchTime(match.utcDate)}
            </div>
          </div>

          <div className="team away">
            <div className="team-logo-container">
              <img 
                src={match.awayTeam.crest}
                alt={`${match.awayTeam.name} logo`}
                className="team-logo"
                onError={handleImageError}
                loading="lazy"
              />
            </div>
            <span className="team-name">{match.awayTeam.name}</span>
          </div>
        </div>
        {match.venue && (
          <div className="match-venue">
            <span>{match.venue}</span>
          </div>
        )}
      </div>
    );
  };

  const renderSection = (title, matchesData, isLoading, error, isLive = false) => (
    <section className={`matches-section ${isLive ? 'live-matches' : 'previous-matches'}`}>
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {!isLoading && !error && (
          <span className="last-updated">
            Last updated: {format(lastUpdated, 'HH:mm:ss')}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          <p>Loading matches...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon" />
          <p className="error-message">{error}</p>
          <button onClick={fetchMatches} className="retry-button">
            <FontAwesomeIcon icon={faSync} className="icon" />
            Retry
          </button>
        </div>
      ) : matchesData.length > 0 ? (
        <div className="matches-grid">
          {matchesData.map(match => renderMatchCard(match, isLive))}
        </div>
      ) : (
        <div className="no-matches-message">
          {isLive ? 'No live matches at the moment' : 'No previous matches available'}
        </div>
      )}
    </section>
  );

  return (
    <div className="live-scores-container">
      {renderSection('LIVE MATCHES', matches.live, loading.live, error.live, true)}
      {renderSection('PREVIOUS MATCHES', matches.previous, loading.previous, error.previous)}
    </div>
  );
};

export default LiveScores; 