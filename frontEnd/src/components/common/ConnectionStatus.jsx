import React, { useState, useEffect } from 'react';
import socketService from '../../services/socketService';
import '../../styles/common/ConnectionStatus.css';

/**
 * Component to display socket connection status
 * Shows a small message when live updates are unavailable
 */
const ConnectionStatus = () => {
  const [connectionError, setConnectionError] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  
  useEffect(() => {
    // Listen for socket connection errors
    const handleSocketError = (error) => {
      if (error?.type === 'CONNECTION_ERROR') {
        setConnectionError(error);
        setShowMessage(true);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          setShowMessage(false);
        }, 5000);
      }
    };
    
    // Subscribe to socket error events
    socketService.subscribe('error', handleSocketError);
    
    return () => {
      // Unsubscribe on unmount
      socketService.unsubscribe('error');
    };
  }, []);
  
  if (!showMessage || !connectionError) {
    return null;
  }
  
  return (
    <div className="connection-status-container">
      <div className="connection-status-message">
        <span>Live updates unavailable. App will continue to function normally.</span>
        <button onClick={() => setShowMessage(false)} className="connection-status-close">
          ×
        </button>
      </div>
    </div>
  );
};

export default ConnectionStatus; 