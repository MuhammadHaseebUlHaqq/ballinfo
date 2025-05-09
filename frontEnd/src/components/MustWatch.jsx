import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import '../styles/MustWatch.css';

const MustWatch = () => {
  // Mock data - would come from API in real app
  const videos = [
    {
      id: 1,
      title: "Barcelona's beautiful team goal against Sevilla",
      thumbnail: "/barca-goal.jpg",
      duration: "3:15",
      views: "856K",
      daysAgo: "3 days ago"
    },
    {
      id: 2,
      title: "Real Madrid's last-minute winner vs Athletic Club",
      thumbnail: "/madrid-goal.jpg",
      duration: "2:45",
      views: "654K",
      daysAgo: "4 days ago"
    },
    {
      id: 3,
      title: "Girona's incredible comeback against Valencia",
      thumbnail: "/girona-comeback.jpg",
      duration: "4:20",
      views: "432K",
      daysAgo: "5 days ago"
    },
    {
      id: 4,
      title: "Top 5 goals from Matchweek 28",
      thumbnail: "/top-goals.jpg",
      duration: "5:30",
      views: "321K",
      daysAgo: "2 days ago"
    }
  ];

  return (
    <div className="must-watch">
      <div className="must-watch-header">
        <h2>Must Watch</h2>
        <a href="/videos" className="see-all">
          See All <FontAwesomeIcon icon={faChevronRight} />
        </a>
      </div>
      
      <div className="videos-container">
        <div className="videos-grid">
          {videos.map(video => (
            <div key={video.id} className="video-card">
              <div className="video-thumbnail">
                <img src={video.thumbnail} alt={video.title} />
                <div className="video-duration">{video.duration}</div>
                <div className="play-overlay">
                  <FontAwesomeIcon icon={faPlay} />
                </div>
              </div>
              <div className="video-info">
                <h3 className="video-title">{video.title}</h3>
                <div className="video-meta">
                  <span className="views">{video.views} views</span>
                  <span className="separator">•</span>
                  <span className="time">{video.daysAgo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MustWatch; 