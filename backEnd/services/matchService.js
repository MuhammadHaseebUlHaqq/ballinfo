import Match from '../models/Match.js';

/**
 * Get all currently active live matches
 * @param {object} options - Optional parameters
 * @param {number} options.limit - Maximum number of matches to fetch
 * @returns {Array} Array of live match objects
 */
export async function getActiveLiveMatches(options = {}) {
  const { limit = 20 } = options;
  
  try {
    // Find matches with status 'LIVE'
    const matches = await Match.find({ status: 'LIVE' })
      .populate('homeTeam', 'name shortName crest')
      .populate('awayTeam', 'name shortName crest')
      .sort({ startTime: -1 })
      .limit(limit);
    
    return matches;
  } catch (error) {
    console.error('Error fetching live matches:', error);
    throw error;
  }
}

/**
 * Get a specific match by ID
 * @param {string} matchId - Match ID
 * @returns {object} Match data
 */
export async function getMatchById(matchId) {
  try {
    const match = await Match.findById(matchId)
      .populate('homeTeam', 'name shortName crest venue founded')
      .populate('awayTeam', 'name shortName crest venue founded');
    
    if (!match) {
      throw new Error(`Match with ID ${matchId} not found`);
    }
    
    return match;
  } catch (error) {
    console.error(`Error fetching match ${matchId}:`, error);
    throw error;
  }
}

/**
 * Update match data and notify subscribed clients
 * @param {object} io - Socket.IO server instance
 * @param {string} matchId - ID of the match to update
 * @param {object} updateData - New match data
 * @returns {object} Updated match
 */
export async function updateMatchAndNotify(io, matchId, updateData) {
  try {
    // Always set lastUpdated to now
    updateData.lastUpdated = new Date();
    
    // Update match in database
    const updatedMatch = await Match.findByIdAndUpdate(
      matchId,
      { $set: updateData },
      { new: true }
    ).populate('homeTeam', 'name shortName crest')
      .populate('awayTeam', 'name shortName crest');
    
    if (!updatedMatch) {
      console.error(`Match not found: ${matchId}`);
      return null;
    }
    
    // Notify all clients subscribed to this match
    io.to(`match:${matchId}`).emit('match_updated', updatedMatch);
    console.log(`Notified subscribers about update to match ${matchId}`);
    
    // Check if the update is significant enough to notify all clients
    const significantUpdates = ['homeScore', 'awayScore', 'status', 'minute', 'events'];
    const hasSignificantUpdates = Object.keys(updateData).some(key => significantUpdates.includes(key));
    
    if (hasSignificantUpdates) {
      // Also update the general live matches list for all connected clients
      const liveMatches = await getActiveLiveMatches();
      io.emit('live_matches', liveMatches);
      console.log(`Broadcasted updated live matches list to all clients`);
    }
    
    return updatedMatch;
  } catch (error) {
    console.error('Error updating match:', error);
    throw error;
  }
}

/**
 * Add an event to a match (goal, card, substitution, etc.)
 * @param {object} io - Socket.IO server instance
 * @param {string} matchId - Match ID
 * @param {object} eventData - Event data
 * @returns {object} Updated match
 */
export async function addMatchEventAndNotify(io, matchId, eventData) {
  try {
    // Validate the event data
    if (!eventData.type || !eventData.minute || !eventData.team || !eventData.player) {
      throw new Error('Invalid event data: missing required fields');
    }
    
    // Add timestamp if not provided
    if (!eventData.timestamp) {
      eventData.timestamp = new Date();
    }
    
    // Update match by pushing the new event
    const updatedMatch = await Match.findByIdAndUpdate(
      matchId,
      { 
        $push: { events: eventData },
        $set: { lastUpdated: new Date() }
      },
      { new: true }
    ).populate('homeTeam', 'name shortName crest')
      .populate('awayTeam', 'name shortName crest');
    
    if (!updatedMatch) {
      throw new Error(`Match with ID ${matchId} not found`);
    }
    
    // Notify all clients subscribed to this match
    io.to(`match:${matchId}`).emit('match_updated', updatedMatch);
    
    // Also emit a specific event based on the event type
    io.to(`match:${matchId}`).emit('match_event', {
      matchId,
      event: eventData
    });
    
    // Notify subscribers to specific event types
    if (['goal', 'ownGoal', 'penalty'].includes(eventData.type)) {
      io.to('event:goals').emit('goal_scored', {
        matchId,
        event: eventData,
        match: {
          id: updatedMatch._id,
          homeTeam: updatedMatch.homeTeam,
          awayTeam: updatedMatch.awayTeam,
          homeScore: updatedMatch.homeScore,
          awayScore: updatedMatch.awayScore
        }
      });
    } else if (['yellowCard', 'redCard'].includes(eventData.type)) {
      io.to('event:cards').emit('card_shown', {
        matchId,
        event: eventData,
        match: {
          id: updatedMatch._id,
          homeTeam: updatedMatch.homeTeam,
          awayTeam: updatedMatch.awayTeam
        }
      });
    } else if (eventData.type === 'substitution') {
      io.to('event:substitutions').emit('substitution_made', {
        matchId,
        event: eventData,
        match: {
          id: updatedMatch._id,
          homeTeam: updatedMatch.homeTeam,
          awayTeam: updatedMatch.awayTeam
        }
      });
    }
    
    return updatedMatch;
  } catch (error) {
    console.error('Error adding match event:', error);
    throw error;
  }
}

/**
 * Update match score and notify clients
 * @param {object} io - Socket.IO server instance
 * @param {string} matchId - Match ID
 * @param {number} homeScore - Home team score
 * @param {number} awayScore - Away team score
 * @returns {object} Updated match
 */
export async function updateScore(io, matchId, homeScore, awayScore) {
  return updateMatchAndNotify(io, matchId, { homeScore, awayScore });
}

/**
 * Update match status (LIVE, FINISHED, etc.)
 * @param {object} io - Socket.IO server instance
 * @param {string} matchId - Match ID
 * @param {string} status - New match status
 * @returns {object} Updated match
 */
export async function updateStatus(io, matchId, status) {
  return updateMatchAndNotify(io, matchId, { status });
} 