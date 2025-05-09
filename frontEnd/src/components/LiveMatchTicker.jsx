import React, { useEffect, useState, useRef } from 'react';
import socketService from '../services/socketService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import '../styles/LiveMatchTicker.css';

const LiveMatchTicker = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        socketService.connect();
        
        socketService.subscribe('live_matches', (data) => {
            setMatches(data);
            setLoading(false);
        });

        socketService.subscribe('error', (error) => {
            setError(error.message);
            setLoading(false);
        });

        return () => {
            socketService.unsubscribe('live_matches');
            socketService.unsubscribe('error');
            socketService.disconnect();
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

    const formatMatchTime = (utcDate, minute) => {
        if (minute) return { time: `${minute}'`, date: 'LIVE' };
        
        const matchDate = new Date(utcDate);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const timeStr = new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(matchDate);

        const dateStr = new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short'
        }).format(matchDate);

        if (matchDate.getDate() === today.getDate() &&
            matchDate.getMonth() === today.getMonth() &&
            matchDate.getFullYear() === today.getFullYear()) {
            return { time: `Today, ${timeStr}`, date: dateStr };
        }
        
        if (matchDate.getDate() === tomorrow.getDate() &&
            matchDate.getMonth() === tomorrow.getMonth() &&
            matchDate.getFullYear() === tomorrow.getFullYear()) {
            return { time: `Tomorrow, ${timeStr}`, date: dateStr };
        }
        
        const dayStr = new Intl.DateTimeFormat('en-GB', {
            weekday: 'short'
        }).format(matchDate);
        
        return { time: timeStr, date: `${dayStr}, ${dateStr}` };
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
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <button 
                        className={`control-button ${!canScrollRight ? 'disabled' : ''}`}
                        onClick={() => scroll('right')} 
                        disabled={!canScrollRight}
                        aria-label="Scroll right"
                    >
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>
            </div>
            <div className="ticker-scroll" ref={scrollRef}>
                {matches.map((match) => {
                    const isLive = !match.isUpcoming && match.minute;
                    const status = isLive ? 'live' : (match.isUpcoming ? 'scheduled' : 'ft');
                    const timeInfo = formatMatchTime(match.utcDate, match.minute);
                    
                    return (
                        <div key={match.id} className={`match-card ${status}`}>
                            <div className="match-header">
                                <span className="competition">{match.competition}</span>
                                <span className={`status ${isLive ? 'live' : ''}`}>
                                    <span className="time">{timeInfo.time}</span>
                                    <span className="date">{timeInfo.date}</span>
                                </span>
                            </div>
                            <div className="teams">
                                <div className="team">
                                    <img 
                                        src={match.homeTeam.crest} 
                                        alt={match.homeTeam.name} 
                                        className="team-logo"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/placeholder-team.png';
                                        }}
                                    />
                                    <span className="team-name">{match.homeTeam.name}</span>
                                </div>
                                <div className="score">
                                    {match.isUpcoming ? (
                                        'vs'
                                    ) : (
                                        `${match.homeTeam.score} - ${match.awayTeam.score}`
                                    )}
                                </div>
                                <div className="team">
                                    <img 
                                        src={match.awayTeam.crest} 
                                        alt={match.awayTeam.name} 
                                        className="team-logo"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/placeholder-team.png';
                                        }}
                                    />
                                    <span className="team-name">{match.awayTeam.name}</span>
                                </div>
                            </div>
                            {match.venue && (
                                <div className="match-footer">
                                    <span>{match.venue}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LiveMatchTicker; 