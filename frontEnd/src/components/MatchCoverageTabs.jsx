import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import '../styles/MatchCoverageTabs.css';

// Mock data - would come from API in real app
const matchTabs = [
  {
    id: 'matchweek28',
    label: 'Matchweek 28',
    headline: 'Barcelona close gap on Real Madrid with convincing win',
    videoUrl: '/videos/barca-valencia-highlights.mp4',
    videoThumbnail: '/matchweek28.jpg',
    matches: [
      { id: 1, home: 'FC Barcelona', away: 'Valencia CF', score: '3-1', status: 'FT' },
      { id: 2, home: 'Real Madrid', away: 'Atlético Madrid', score: '1-1', status: 'FT' },
      { id: 3, home: 'Real Betis', away: 'Athletic Bilbao', score: '2-0', status: 'FT' }
    ]
  },
  {
    id: 'elclasico',
    label: 'El Clásico',
    headline: 'All eyes on Madrid as rivals prepare for season-defining clash',
    videoUrl: '/videos/clasico-preview.mp4',
    videoThumbnail: '/clasico.jpg',
    matches: [
      { id: 4, home: 'Real Madrid', away: 'FC Barcelona', score: '-', status: 'April 22, 21:00' }
    ],
    history: [
      { id: 5, home: 'FC Barcelona', away: 'Real Madrid', score: '1-2', date: 'Oct 28, 2023' },
      { id: 6, home: 'Real Madrid', away: 'FC Barcelona', score: '3-1', date: 'Apr 5, 2023' }
    ]
  },
  {
    id: 'relegation',
    label: 'Relegation Battle',
    headline: 'Almería in serious trouble as relegation looms',
    videoUrl: '/videos/relegation-battle.mp4',
    videoThumbnail: '/relegation.jpg',
    teams: [
      { id: 1, name: 'Granada CF', position: 18, points: 21, form: 'LLDLW' },
      { id: 2, name: 'Cádiz CF', position: 19, points: 19, form: 'DLLLD' },
      { id: 3, name: 'Almería', position: 20, points: 13, form: 'LLLDD' }
    ]
  }
];

const MatchCoverageTabs = () => {
  const [activeTab, setActiveTab] = useState(matchTabs[0].id);
  
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };
  
  const activeTabData = matchTabs.find(tab => tab.id === activeTab);
  
  return (
    <div className="match-coverage">
      <h2 className="section-title">Match Coverage</h2>
      
      <div className="tabs-container">
        <div className="tabs">
          {matchTabs.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="tab-content">
          <div className="tab-header">
            <h3 className="tab-headline">{activeTabData.headline}</h3>
          </div>
          
          <div className="tab-grid">
            <div className="video-preview">
              <div className="video-thumbnail">
                <img 
                  src={activeTabData.videoThumbnail || '/placeholder.jpg'} 
                  alt={activeTabData.label} 
                />
                <div className="play-button">
                  <FontAwesomeIcon icon={faPlay} />
                </div>
              </div>
            </div>
            
            <div className="tab-info">
              {activeTabData.matches && (
                <div className="match-list">
                  <h4>Matches</h4>
                  {activeTabData.matches.map(match => (
                    <div key={match.id} className="match-item">
                      <div className="match-teams">
                        <span className="team-name">{match.home}</span>
                        <span className="match-score">{match.score}</span>
                        <span className="team-name">{match.away}</span>
                      </div>
                      <span className="match-status">{match.status}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {activeTabData.history && (
                <div className="match-history">
                  <h4>Recent Meetings</h4>
                  {activeTabData.history.map(match => (
                    <div key={match.id} className="history-item">
                      <div className="match-teams">
                        <span className="team-name">{match.home}</span>
                        <span className="match-score">{match.score}</span>
                        <span className="team-name">{match.away}</span>
                      </div>
                      <span className="match-date">{match.date}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {activeTabData.teams && (
                <div className="relegation-table">
                  <h4>Relegation Zone</h4>
                  {activeTabData.teams.map(team => (
                    <div key={team.id} className="team-row">
                      <span className="team-position">{team.position}</span>
                      <span className="team-name">{team.name}</span>
                      <span className="team-points">{team.points} pts</span>
                      <span className="team-form">{team.form}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <Link to={`/coverage/${activeTabData.id}`} className="view-all">
                Full Coverage 
                <FontAwesomeIcon icon={faChevronRight} className="icon-right" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchCoverageTabs; 