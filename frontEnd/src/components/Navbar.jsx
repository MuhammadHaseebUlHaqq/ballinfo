import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, 
  faMoon, 
  faSun, 
  faBell, 
  faUser, 
  faSearch, 
  faSignOutAlt,
  faChevronDown 
} from '@fortawesome/free-solid-svg-icons';
import Logo from './Logo';

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-theme');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className={`navbar ${isDarkMode ? 'dark' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/">
            <Logo />
          </Link>
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
          <Link to="/stats">Stats</Link>
          <Link to="/laliga-2024-25">LaLiga 2024-25</Link>
        </div>

        <div className="navbar-actions">
          <button className="icon-button" onClick={toggleTheme}>
            <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
          </button>
          <button className="icon-button">
            <FontAwesomeIcon icon={faBell} />
          </button>
          {user ? (
            <div className="user-dropdown" ref={dropdownRef}>
              <button 
                className="user-dropdown-button" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <FontAwesomeIcon icon={faUser} className="user-icon" />
                <div className="user-info">
                  <span className="username">{user.username}</span>
                  <span className="favorite-team">{user.favoriteTeam}</span>
                </div>
                <FontAwesomeIcon icon={faChevronDown} className="dropdown-icon" />
              </button>
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <button onClick={handleLogout} className="dropdown-item">
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="auth-button">
              <FontAwesomeIcon icon={faUser} />
              <span>Login / Sign Up</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 