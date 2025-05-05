import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';

// Import components
import Navbar from './components/Navbar';
import LiveMatchTicker from './components/LiveMatchTicker';
import HeroBanner from './components/HeroBanner';
import MatchCoverageTabs from './components/MatchCoverageTabs';
import TopStories from './components/TopStories';
import TrendingPlayers from './components/TrendingPlayers';
import VideoCarousel from './components/VideoCarousel';
import StatsBox from './components/StatsBox';
import OnThisDay from './components/OnThisDay';
import EditorsPicks from './components/EditorsPicks';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <LiveMatchTicker />
        <div className="main-content">
          <HeroBanner />
          <div className="content-grid">
            <div className="left-column">
              <MatchCoverageTabs />
              <TopStories />
              <TrendingPlayers />
              <EditorsPicks />
            </div>
            <div className="right-column">
              <VideoCarousel />
              <StatsBox />
              <OnThisDay />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App; 