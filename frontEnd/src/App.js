import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

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
import Teams from './components/Teams';
import ConnectionStatus from './components/common/ConnectionStatus';
import TestLink from './components/TestLink';
import MatchDetail from './components/MatchDetail';

// Import news components - Use direct paths with extensions
import NewsPage from './components/news/NewsPage.jsx';
import NewsDetail from './components/news/NewsDetail.jsx';
import FeaturedNews from './components/news/FeaturedNews.jsx';

// Import test pages - Use correct case for import
import TestMatchPage from './pages/TestMatchPage.jsx';
import Milestone2TestPage from './pages/Milestone2TestPage.jsx';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#0a3d62',
    },
    secondary: {
      main: '#e84118',
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Arial', sans-serif",
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="app">
            <Navbar />
            <Routes>
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/live-scores" element={<LiveScores />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/test-match" element={<TestMatchPage />} />
              <Route path="/match/:matchId" element={<MatchDetail />} />
              <Route path="/milestone2-test" element={<Milestone2TestPage />} />
              
              {/* News Routes */}
              <Route path="/news" element={<NewsPage />} />
              <Route path="/news/category/:category" element={<NewsPage />} />
              <Route path="/news/team/:teamId" element={<NewsPage />} />
              <Route path="/news/search" element={<NewsPage />} />
              <Route path="/news/article/:id" element={<NewsDetail />} />
              
              <Route path="/" element={
                <>
                  <LiveMatchTicker />
                  <div className="main-content">
                    <HeroBanner />
                    <div className="left-column">
                      <MatchCoverageTabs />
                      <TopStories />
                      <FeaturedNews />
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
            <ConnectionStatus />
            <TestLink />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 