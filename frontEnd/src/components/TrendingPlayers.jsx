import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/TrendingPlayers.css';

// Mock data - would come from API in real app
const trendingPlayers = [
  { id: 1, name: 'Jude Bellingham', team: 'Real Madrid' },
  { id: 2, name: 'Lamine Yamal', team: 'Barcelona' },
  { id: 3, name: 'Antoine Griezmann', team: 'Atlético Madrid' },
  { id: 4, name: 'Robert Lewandowski', team: 'Barcelona' },
  { id: 5, name: 'Vinícius Júnior', team: 'Real Madrid' },
  { id: 6, name: 'Rodri', team: 'Manchester City' },
  { id: 7, name: 'Nico Williams', team: 'Athletic Bilbao' },
  { id: 8, name: 'Pedri', team: 'Barcelona' },
  { id: 9, name: 'Kylian Mbappé', team: 'PSG' },
  { id: 10, name: 'Thibaut Courtois', team: 'Real Madrid' }
];

const TrendingPlayers = () => {
  return (
    <div className="trending-players">
      <h2 className="section-title">Trending Players</h2>
      
      <div className="players-scroll">
        {trendingPlayers.map((player) => (
          <Link 
            key={player.id} 
            to={`/players/${player.id}`}
            className="player-button"
          >
            {player.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TrendingPlayers; 