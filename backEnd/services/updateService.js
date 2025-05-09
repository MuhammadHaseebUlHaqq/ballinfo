import { updateMatchAndNotify, getActiveLiveMatches } from './matchService.js';

// Cache for tracking when we last updated each match
const matchUpdateCache = new Map();

// Update intervals and control parameters
const UPDATE_INTERVAL = 60000; // 1 minute between updates for the same match
const POLLING_INTERVAL = 10000; // Check every 10 seconds for matches to update
const CLOCK_UPDATE_PROBABILITY = 0.7; // 70% chance to update the clock
const MAJOR_EVENT_PROBABILITY = 0.1; // 10% chance for major events (goals, cards)

/**
 * Initialize the periodic update service
 * @param {object} io - Socket.IO server instance
 */
export function initializeUpdateService(io) {
  console.log('Starting periodic match update service');
  
  // Set up interval for periodic updates
  const intervalId = setInterval(async () => {
    try {
      // Get all current live matches
      const liveMatches = await getActiveLiveMatches();
      
      // Nothing to update if no live matches
      if (!liveMatches || liveMatches.length === 0) {
        console.log('No live matches found to update');
        return;
      }
      
      console.log(`Found ${liveMatches.length} live matches to potentially update`);
      
      // Update the client's live match list regardless of individual updates
      io.emit('live_matches', liveMatches);
      
      // Check each match for updates if enough time has passed since last update
      for (const match of liveMatches) {
        const matchId = match._id.toString();
        const lastUpdate = matchUpdateCache.get(matchId) || 0;
        const now = Date.now();
        
        // Only update if enough time has passed since the last update
        if (now - lastUpdate > UPDATE_INTERVAL) {
          try {
            console.log(`Generating update for match ${matchId}`);
            
            // In a real app, you'd fetch updates from an external API
            // Here we're just simulating with random score updates
            await simulateMatchUpdate(io, match);
            
            // Record the update time
            matchUpdateCache.set(matchId, now);
          } catch (error) {
            console.error(`Error updating match ${matchId}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error in periodic match update:', error);
    }
  }, POLLING_INTERVAL);
  
  // Return the interval ID so it can be cleared if needed
  return intervalId;
}

/**
 * Simulate a match update (for testing)
 * In production, replace with real API calls
 * @param {object} io - Socket.IO server instance
 * @param {object} match - Match object to update
 */
async function simulateMatchUpdate(io, match) {
  // Basic validation
  if (!match || !match._id) return;
  
  // Always include lastUpdated
  let updateData = { lastUpdated: new Date() };
  
  // Decide if we should update the match clock (high probability)
  if (Math.random() < CLOCK_UPDATE_PROBABILITY) {
    // Update the clock by 1-3 minutes, but don't exceed 90 (or 120 for extra time)
    const maxMinute = match.status === 'EXTRATIME' ? 120 : 90;
    updateData.minute = Math.min(maxMinute, match.minute + Math.floor(Math.random() * 3) + 1);
    
    // If we reach the maximum minute, potentially change status
    if (updateData.minute >= maxMinute) {
      // 50% chance to end the match when max time is reached
      if (Math.random() > 0.5) {
        updateData.status = 'FINISHED';
        console.log(`Match ${match._id} finished at minute ${updateData.minute}`);
      }
    }
  }
  
  // Only simulate major events occasionally
  if (Math.random() < MAJOR_EVENT_PROBABILITY) {
    // Determine what type of event to generate
    const updateTypes = ['goal', 'yellowCard', 'redCard', 'substitution'];
    const weights = [0.5, 0.3, 0.1, 0.1]; // Goals more likely than cards or subs
    
    // Weighted random selection of event type
    const randomValue = Math.random();
    let cumulativeWeight = 0;
    let selectedType = updateTypes[0];
    
    for (let i = 0; i < updateTypes.length; i++) {
      cumulativeWeight += weights[i];
      if (randomValue <= cumulativeWeight) {
        selectedType = updateTypes[i];
        break;
      }
    }
    
    // Handle the selected event type
    switch (selectedType) {
      case 'goal':
        // Random team scores
        if (Math.random() > 0.5) {
          updateData.homeScore = match.homeScore + 1;
          console.log(`Home team scored in match ${match._id}. New score: ${updateData.homeScore}-${match.awayScore}`);
        } else {
          updateData.awayScore = match.awayScore + 1;
          console.log(`Away team scored in match ${match._id}. New score: ${match.homeScore}-${updateData.awayScore}`);
        }
        break;
        
      case 'yellowCard':
        // Yellow card is just simulated, no actual DB update for the event
        console.log(`Yellow card in match ${match._id}`);
        break;
        
      case 'redCard':
        // Red card is just simulated, no actual DB update for the event
        console.log(`Red card in match ${match._id}`);
        break;
        
      case 'substitution':
        // Substitution is just simulated, no actual DB update for the event
        console.log(`Substitution in match ${match._id}`);
        break;
    }
  }
  
  // Only update if we have changes to make
  if (Object.keys(updateData).length > 1) { // > 1 because we always include lastUpdated
    await updateMatchAndNotify(io, match._id, updateData);
  }
}

/**
 * Stop the update service
 * @param {number} intervalId - Interval ID returned by initializeUpdateService
 */
export function stopUpdateService(intervalId) {
  if (intervalId) {
    clearInterval(intervalId);
    console.log('Stopped periodic match update service');
  }
} 