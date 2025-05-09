import React from 'react';
import LiveMatchTicker from '../components/LiveMatchTicker';
import ErrorBoundary from '../components/ErrorBoundary';

const TestMatchPage = () => {
  return (
    <div className="test-match-page" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Test Match Ticker</h1>
      <p>This is an isolated test page for the LiveMatchTicker component.</p>
      <div className="component-container">
        <ErrorBoundary>
          <LiveMatchTicker />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default TestMatchPage; 