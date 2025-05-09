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
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Container
} from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import GroupsIcon from '@mui/icons-material/Groups';
import NewspaperIcon from '@mui/icons-material/Newspaper';

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
    <AppBar position="static">
      <Container>
        <Toolbar disableGutters>
          <SportsSoccerIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
              flexGrow: 1
            }}
          >
            BALLINFO
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              component={Link}
              to="/"
              color="inherit"
              startIcon={<SportsSoccerIcon />}
            >
              Live Scores
            </Button>
            <Button
              component={Link}
              to="/teams"
              color="inherit"
              startIcon={<GroupsIcon />}
            >
              Teams
            </Button>
            <Button
              component={Link}
              to="/news"
              color="inherit"
              startIcon={<NewspaperIcon />}
            >
              News
            </Button>
            <Button
              component={Link}
              to="/test-match"
              color="inherit"
            >
              Test Ticker
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 