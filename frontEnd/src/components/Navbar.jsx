import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faMoon, faSun, faBell, faUser, faSearch } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Logic to apply dark theme to the entire app would go here
    document.body.classList.toggle('dark-theme');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={`navbar ${isDarkMode ? 'dark' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <img src="/logo.png" alt="LaLiga Hub" className="logo" />
          </Link>
        </div>

        <div className="navbar-search hide-mobile">
          <div className="search-container">
            <input type="text" placeholder="Search teams, players, news..." />
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
          </div>
        </div>

        <button className="menu-toggle" onClick={toggleMenu}>
          <FontAwesomeIcon icon={faBars} />
        </button>

        <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/live-scores">Live Scores</Link>
          <Link to="/fixtures">Fixtures</Link>
          <Link to="/teams">Teams</Link>
          <Link to="/news">News</Link>
          <Link to="/features">Features</Link>
          <Link to="/videos">Videos</Link>
          <Link to="/stats">Stats</Link>
          <Link to="/transfers">Transfers</Link>
          <Link to="/laliga-2024-25">LaLiga 2024-25</Link>
        </div>

        <div className="navbar-actions">
          <button className="icon-button" onClick={toggleTheme}>
            <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
          </button>
          <button className="icon-button">
            <FontAwesomeIcon icon={faBell} />
          </button>
          <button className="icon-button">
            <FontAwesomeIcon icon={faUser} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 