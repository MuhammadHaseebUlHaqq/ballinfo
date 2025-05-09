import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import useMatchSubscription from '../hooks/useMatchSubscription';
import '../styles/MatchDetail.css';

const MatchDetail = () => {
  const { matchId } = useParams();
  const { match, events, loading, error } = useMatchSubscription(matchId);
  const [activeTab, setActiveTab] = useState('summary');

  if (loading) {
    return (
      <div className="match-detail-container loading">
        <div className="loader"></div>
        <p>Loading match data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="match-detail-container error">
        <h2>Error Loading Match</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="match-detail-container not-found">
        <h2>Match Not Found</h2>
        <p>The requested match could not be found.</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get the latest events (latest first)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  // Function to render icon based on event type
  const renderEventIcon = (type) => {
    switch (type) {
      case 'goal':
        return '⚽';
      case 'yellowCard':
        return '🟨';
      case 'redCard':
        return '🟥';
      case 'substitution':
        return '🔄';
      default:
        return '🎮';
    }
  };

  return (
    <div className="match-detail-container">
      <div className="match-header">
        <div className="match-info">
          <div className="competition">{match.competition}</div>
          <div className="date">{formatDate(match.date)}</div>
          <div className="venue">{match.venue}</div>
        </div>
        
        <div className="match-status">
          {match.status === 'LIVE' ? (
            <span className="live-badge">LIVE {match.minute}'</span>
          ) : match.status === 'FINISHED' ? (
            <span className="finished-badge">FULL TIME</span>
          ) : (
            <span className="scheduled-badge">SCHEDULED</span>
          )}
        </div>
      </div>

      <div className="teams-score">
        <div className="team home-team">
          <img 
            src={match.homeTeam.logo || '/placeholder-team.png'} 
            alt={match.homeTeam.name} 
            className="team-logo"
          />
          <h3 className="team-name">{match.homeTeam.name}</h3>
        </div>
        
        <div className="score-container">
          <div className="score">{match.homeScore} - {match.awayScore}</div>
        </div>
        
        <div className="team away-team">
          <img 
            src={match.awayTeam.logo || '/placeholder-team.png'} 
            alt={match.awayTeam.name} 
            className="team-logo"
          />
          <h3 className="team-name">{match.awayTeam.name}</h3>
        </div>
      </div>

      <div className="match-tabs">
        <button 
          className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button 
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Stats
        </button>
        <button 
          className={`tab ${activeTab === 'lineups' ? 'active' : ''}`}
          onClick={() => setActiveTab('lineups')}
        >
          Lineups
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'summary' && (
          <div className="match-summary">
            <h3>Match Events</h3>
            {sortedEvents.length > 0 ? (
              <div className="events-timeline">
                {sortedEvents.map((event, index) => (
                  <div key={index} className="event-item">
                    <div className="event-time">{event.minute}'</div>
                    <div className="event-icon">{renderEventIcon(event.type)}</div>
                    <div className="event-details">
                      <div className="event-title">{event.title}</div>
                      <div className="event-description">{event.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-events">
                <p>No match events recorded yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="match-stats">
            <h3>Match Statistics</h3>
            {match.stats ? (
              <div className="stats-container">
                {Object.entries(match.stats).map(([key, value]) => (
                  <div key={key} className="stat-row">
                    <div className="stat-home">{value.home}</div>
                    <div className="stat-label">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                    <div className="stat-away">{value.away}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-stats">
                <p>No statistics available for this match.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'lineups' && (
          <div className="match-lineups">
            <h3>Team Lineups</h3>
            {match.lineups ? (
              <div className="lineups-container">
                <div className="team-lineup">
                  <h4>{match.homeTeam.name}</h4>
                  <ul className="players-list">
                    {match.lineups.home.map((player, index) => (
                      <li key={index} className="player-item">
                        <span className="player-number">{player.number}</span>
                        <span className="player-name">{player.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="team-lineup">
                  <h4>{match.awayTeam.name}</h4>
                  <ul className="players-list">
                    {match.lineups.away.map((player, index) => (
                      <li key={index} className="player-item">
                        <span className="player-number">{player.number}</span>
                        <span className="player-name">{player.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="no-lineups">
                <p>Lineups not available yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchDetail; 