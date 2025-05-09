import React, { useEffect, useState, useRef } from 'react';
import socketService from '../services/socketService';
import './LiveMatchTicker.css';

const LiveMatchTicker = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const sliderRef = useRef(null);

    useEffect(() => {
        // Connect to WebSocket and subscribe to live matches
        socketService.connect();
        
        socketService.subscribe('live_matches', (data) => {
            setMatches(data);
            setLoading(false);
        });

        socketService.subscribe('error', (error) => {
            setError(error.message);
            setLoading(false);
        });

        // Cleanup on unmount
        return () => {
            socketService.unsubscribe('live_matches');
            socketService.unsubscribe('error');
            socketService.disconnect();
        };
    }, []);

    const formatMatchDateTime = (utcDate, minute) => {
        const date = new Date(utcDate);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        let timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

        if (minute) {
            return { date: 'LIVE', time: `${minute}'` };
        }
        if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
            return { date: 'Today', time: timeStr };
        }
        if (date.getDate() === tomorrow.getDate() && date.getMonth() === tomorrow.getMonth() && date.getFullYear() === tomorrow.getFullYear()) {
            return { date: 'Tomorrow', time: timeStr };
        }
        return { date: dateStr, time: timeStr };
    };

    const scroll = (direction) => {
        if (sliderRef.current) {
            const scrollAmount = 300; // Adjust scroll amount as needed
            sliderRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const renderMatchCard = (match) => {
        const isUpcoming = match.isUpcoming;
        const isLive = !isUpcoming && match.minute;
        const dateTime = formatMatchDateTime(match.utcDate, match.minute);
        return (
            <div key={match.id} className={`match-card ${isUpcoming ? 'upcoming' : ''} ${isLive ? 'live' : ''} ${!isUpcoming && !isLive ? 'ft' : ''}`}>
                <div className="match-header">
                    <div className="match-info">
                        <span className="competition">{match.competition}</span>
                        {isLive && <span className="live-badge">LIVE</span>}
                    </div>
                </div>
                <div className="match-teams">
                    <div className="team home">
                        <img src={match.homeTeam.crest} alt={match.homeTeam.name} className="team-crest" />
                        <span className="team-name">{match.homeTeam.name}</span>
                    </div>
                    <div className="match-score">
                        <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
                            {isUpcoming ? (
                                <span className="vs">VS</span>
                            ) : (
                                <>
                                    <span className="score">{match.homeTeam.score}</span>
                                    <span className="score-separator">-</span>
                                    <span className="score">{match.awayTeam.score}</span>
                                </>
                            )}
                        </div>
                        <div className="match-date-time">
                            <span className="match-date">{dateTime.date}</span>
                            <span className="match-time">{dateTime.time}</span>
                        </div>
                    </div>
                    <div className="team away">
                        <img src={match.awayTeam.crest} alt={match.awayTeam.name} className="team-crest" />
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

    if (loading) {
        return (
            <div className="live-match-ticker loading">
                <div className="loader"></div>
                <p>Loading matches...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="live-match-ticker error">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    if (!matches.length) {
        return (
            <div className="live-match-ticker no-matches">
                <p>No matches found</p>
            </div>
        );
    }

    const liveMatches = matches.filter(match => !match.isUpcoming);
    const upcomingMatches = matches.filter(match => match.isUpcoming);
    const allMatches = [...liveMatches, ...upcomingMatches];

    return (
        <div className="live-match-ticker">
            <div className="ticker-header">
                <div className="header-left">
                    <h2>Matches</h2>
                    <span className="match-count">({allMatches.length})</span>
                </div>
                <div className="navigation-buttons">
                    <button className="nav-button" onClick={() => scroll('left')} aria-label="Scroll left">
                        ←
                    </button>
                    <button className="nav-button" onClick={() => scroll('right')} aria-label="Scroll right">
                        →
                    </button>
                </div>
            </div>
            <div className="matches-slider" ref={sliderRef}>
                {allMatches.map(renderMatchCard)}
            </div>
        </div>
    );
};

export default LiveMatchTicker; 