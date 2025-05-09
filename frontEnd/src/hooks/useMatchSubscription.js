import { useState, useEffect, useRef } from 'react';
import socketService from '../services/socketService';

/**
 * Custom hook for subscribing to real-time match updates
 * @param {string} matchId - ID of match to subscribe to
 * @returns {object} Match data and loading state
 */
export function useMatchSubscription(matchId) {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const mountedRef = useRef(true);
  
  useEffect(() => {
    // Set mounted ref to true when component mounts
    mountedRef.current = true;
    
    // Function to safely update state only if component is mounted
    const safeSetState = (setter, value) => {
      if (mountedRef.current) {
        setter(value);
      }
    };
    
    if (!matchId) {
      safeSetState(setError, 'No match ID provided');
      safeSetState(setLoading, false);
      return;
    }
    
    console.log(`[useMatchSubscription] Subscribing to match: ${matchId}`);
    
    // Callback for receiving match updates
    const handleMatchUpdate = (updatedMatch) => {
      if (updatedMatch._id === matchId) {
        console.log(`[useMatchSubscription] Match updated: ${matchId}`, updatedMatch);
        safeSetState(setMatch, updatedMatch);
        safeSetState(setLoading, false);
      }
    };
    
    // Callback for receiving match events
    const handleMatchEvent = (eventData) => {
      if (eventData.matchId === matchId) {
        console.log(`[useMatchSubscription] Match event: ${matchId}`, eventData);
        safeSetState(setEvents, prevEvents => [...prevEvents, eventData]);
      }
    };
    
    // Subscribe to match updates
    socketService.subscribeToMatch(matchId);
    socketService.subscribe('match_updated', handleMatchUpdate);
    socketService.subscribe('match_event', handleMatchEvent);
    
    // Handle socket errors
    const handleError = (err) => {
      console.error(`[useMatchSubscription] Error for match ${matchId}:`, err);
      safeSetState(setError, typeof err === 'string' ? err : (err.message || 'Unknown error'));
      safeSetState(setLoading, false);
    };
    
    socketService.subscribe('error', handleError);
    
    // Request current match data if not provided
    if (!match) {
      socketService.requestMatchDetails(matchId);
    }
    
    // Clean up subscriptions when unmounting
    return () => {
      console.log(`[useMatchSubscription] Unsubscribing from match: ${matchId}`);
      socketService.unsubscribeFromMatch(matchId);
      socketService.unsubscribe('match_updated', handleMatchUpdate);
      socketService.unsubscribe('match_event', handleMatchEvent);
      socketService.unsubscribe('error', handleError);
      mountedRef.current = false;
    };
  }, [matchId, match]);
  
  return { match, events, loading, error };
}

export default useMatchSubscription; 