import React from 'react';
import { Link } from 'react-router-dom';

const TestLink = () => {
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      zIndex: 1000,
      background: '#333',
      padding: '10px',
      borderRadius: '5px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      <Link to="/test-match" style={{ color: 'white', textDecoration: 'none' }}>
        Test Match Page
      </Link>
      <Link to="/milestone2-test" style={{ color: '#00ffcc', textDecoration: 'none' }}>
        Milestone 2 Test
      </Link>
    </div>
  );
};

export default TestLink; 