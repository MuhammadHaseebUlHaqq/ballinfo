import React, { useEffect } from 'react';
import LiveMatchTicker from '../components/LiveMatchTicker';
import { Link } from 'react-router-dom';

const Milestone2TestPage = () => {
  useEffect(() => {
    // Inject verification script
    const scriptText = `
      /**
       * Milestone 2 Verification Script for BallInfo
       */
      function verifyMilestone2Components() {
        console.clear();
        console.log('%c===== BallInfo: Milestone 2 Verification =====', 'font-size: 14px; font-weight: bold; color: #2196f3');
        
        // Check socketService
        const socketService = window.socketService;
        if (!socketService) {
          console.error('❌ Cannot access socketService from window');
          return;
        }
        
        console.log('✅ socketService is accessible');
        
        // Check required methods
        ['subscribeToMatch', 'unsubscribeFromMatch', 'requestMatchDetails'].forEach(method => {
          if (typeof socketService[method] === 'function') {
            console.log('✅ socketService.' + method + ' method exists');
          } else {
            console.error('❌ socketService.' + method + ' method is missing');
          }
        });
        
        // Check for LiveMatchTicker
        const ticker = document.querySelector('.live-ticker');
        if (ticker) {
          console.log('✅ LiveMatchTicker component is rendered');
        } else {
          console.error('❌ LiveMatchTicker component not found');
        }
        
        // Check for match links
        const matchLinks = document.querySelectorAll('.match-link, a[href*="/match/"]');
        if (matchLinks.length > 0) {
          console.log('✅ Found ' + matchLinks.length + ' match links');
          
          // Click the first link programmatically (if user agrees)
          console.log('To test match detail navigation, you can click any match card.');
        } else {
          console.error('❌ No match links found');
        }
        
        console.log('%c===== End of Verification =====', 'font-size: 14px; font-weight: bold; color: #2196f3');
      }
      
      // Make function available globally
      window.verifyMilestone2Components = verifyMilestone2Components;
      
      // Auto-run after 2 seconds (allow time for matches to load)
      setTimeout(verifyMilestone2Components, 2000);
    `;
    
    const script = document.createElement('script');
    script.textContent = scriptText;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  
  return (
    <div className="milestone2-test-page" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Milestone 2 Test Page</h1>
      <p>This page is for testing Milestone 2 components:</p>
      <ul>
        <li>LiveMatchTicker with clickable match cards</li>
        <li>Socket subscription methods</li>
        <li>Match detail navigation</li>
      </ul>
      
      <div className="test-controls" style={{ 
        margin: '20px 0', 
        padding: '15px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '8px' 
      }}>
        <h3>Test Controls</h3>
        <button 
          onClick={() => window.verifyMilestone2Components()} 
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#2196f3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Run Verification
        </button>
        
        <Link to="/">
          <button style={{ 
            padding: '8px 16px', 
            backgroundColor: '#f44336', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}>
            Back to Home
          </button>
        </Link>
      </div>
      
      <div className="component-container" style={{ marginTop: '30px' }}>
        <h2>LiveMatchTicker Component</h2>
        <LiveMatchTicker />
      </div>
      
      <div className="instructions" style={{ 
        marginTop: '30px', 
        padding: '15px', 
        backgroundColor: '#e3f2fd', 
        borderRadius: '8px' 
      }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Check the console for verification results</li>
          <li>Verify that match cards appear in the ticker above</li>
          <li>Click on any match card to test navigation to match details</li>
          <li>Return to this page using the browser's back button</li>
        </ol>
      </div>
    </div>
  );
};

export default Milestone2TestPage; 