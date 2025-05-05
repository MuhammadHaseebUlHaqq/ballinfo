import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import '../styles/VideoCarousel.css';

// Mock data - would come from API in real app
const videos = [
  {
    id: 1,
    title: 'Vinicius Jr\'s spectacular hat-trick vs Valencia',
    thumbnail: '/vinicius-hatrick.jpg',
    duration: '4:28',
    views: '1.2M',
    date: '2 days ago'
  },
  {
    id: 2,
    title: 'Barcelona\'s beautiful team goal against Sevilla',
    thumbnail: '/barca-team-goal.jpg',
    duration: '3:15',
    views: '856K',
    date: '3 days ago'
  },
  {
    id: 3,
    title: 'Atletico Madrid\'s defensive masterclass vs Liverpool',
    thumbnail: '/atletico-defense.jpg',
    duration: '5:42',
    views: '643K',
    date: '1 week ago'
  },
  {
    id: 4,
    title: 'Top 10 La Liga goals of the month',
    thumbnail: '/top10-goals.jpg',
    duration: '8:30',
    views: '1.5M',
    date: '5 days ago'
  }
];

const VideoCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
  };
  
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };
  
  const toggleAutoplay = () => {
    setAutoplay(!autoplay);
  };
  
  useEffect(() => {
    let interval;
    
    if (autoplay) {
      interval = setInterval(() => {
        nextSlide();
      }, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoplay, currentSlide]);
  
  return (
    <div className="video-carousel">
      <div className="section-title">
        Must Watch
        <Link to="/videos" className="view-more">
          See All <FontAwesomeIcon icon={faChevronRight} />
        </Link>
      </div>
      
      <div className="carousel-container">
        <div className="carousel-slider">
          {videos.map((video, index) => (
            <div 
              key={video.id} 
              className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ transform: `translateX(${100 * (index - currentSlide)}%)` }}
            >
              <Link to={`/videos/${video.id}`} className="video-link">
                <div className="video-thumbnail">
                  <img src={video.thumbnail || '/video-placeholder.jpg'} alt={video.title} />
                  <div className="video-duration">{video.duration}</div>
                  <div className="play-overlay">
                    <FontAwesomeIcon icon={faPlay} className="play-icon" />
                  </div>
                </div>
                
                <div className="video-info">
                  <h3 className="video-title">{video.title}</h3>
                  <div className="video-meta">
                    <span className="video-views">{video.views} views</span>
                    <span className="video-date">{video.date}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
        
        <button 
          className="carousel-control prev"
          onClick={prevSlide}
          aria-label="Previous video"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        
        <button 
          className="carousel-control next"
          onClick={nextSlide}
          aria-label="Next video"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
      
      <div className="carousel-indicators">
        {videos.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      <div className="carousel-controls">
        <button 
          className={`autoplay-toggle ${autoplay ? 'active' : ''}`}
          onClick={toggleAutoplay}
        >
          {autoplay ? 'Autoplay: On' : 'Autoplay: Off'}
        </button>
      </div>
    </div>
  );
};

export default VideoCarousel; 