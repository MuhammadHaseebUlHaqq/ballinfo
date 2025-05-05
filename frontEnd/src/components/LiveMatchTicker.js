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

    const formatMatchDate = (utcDate) => {
        const date = new Date(utcDate);
        return new Intl.DateTimeFormat('en-GB', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(date);
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
        
        return (
            <div key={match.id} className={`match-card ${isUpcoming ? 'upcoming' : ''} ${isLive ? 'live' : ''}`}>
                <div className="match-header">
                    <div className="match-info">
                        <span className="competition">{match.competition}</span>
                        {isLive && <span className="live-badge">LIVE</span>}
                    </div>
                    {isUpcoming ? (
                        <span className="scheduled-time">{formatMatchDate(match.utcDate)}</span>
                    ) : (
                        match.minute && <span className="minute">{match.minute}'</span>
                    )}
                </div>
                <div className="match-teams">
                    <div className="team home">
                        <img src={match.homeTeam.crest} alt={match.homeTeam.name} className="team-crest" />
                        <span className="team-name">{match.homeTeam.name}</span>
                    </div>
                    <div className="match-score">
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