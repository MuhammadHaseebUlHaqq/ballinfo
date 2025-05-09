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
import SignUp from './components/SignUp';
import Login from './components/Login';
import { AuthProvider } from './context/AuthContext';
import LiveScores from './components/LiveScores';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/live-scores" element={<LiveScores />} />
            <Route path="/" element={
              <>
                <LiveMatchTicker />
                <div className="main-content">
                  <HeroBanner />
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
              </>
            } />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 