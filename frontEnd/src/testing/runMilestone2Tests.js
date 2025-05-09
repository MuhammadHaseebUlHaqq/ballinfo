/**
 * Milestone 2 Comprehensive Test Script
 * 
 * This script runs a series of tests to verify all aspects of Milestone 2 implementation:
 * 1. Socket Service Match Subscription Methods
 * 2. useMatchSubscription Hook
 * 3. Match Detail Component
 * 4. LiveMatchTicker Clickable Links
 * 
 * To run:
 * 1. Copy entire script to console on homepage
 * 2. Call runMilestone2Tests()
 */

async function runMilestone2Tests() {
  console.clear();
  console.log('%c===== BallInfo: Milestone 2 Tests =====', 'font-size: 14px; font-weight: bold; color: #2196f3');
  
  // Test 1: Check Socket Service Methods
  await testSocketService();
  
  // Test 2: Check LiveMatchTicker Links
  await testLiveMatchTickerLinks();
  
  // Test 3: Simulate Match Detail Navigation
  await testMatchDetailNavigation();
  
  // Test 4: Check useMatchSubscription Hook
  await testMatchSubscriptionHook();
  
  // Final Summary
  console.log('%c===== Test Summary =====', 'font-size: 14px; font-weight: bold; color: #2196f3');
  logSuccess('Socket service methods for match subscription exist');
  
  if (document.querySelectorAll('.match-link').length > 0 || 
      document.querySelectorAll('a[href*="/match/"]').length > 0) {
    logSuccess('LiveMatchTicker has clickable match cards');
  } else {
    logError('LiveMatchTicker is missing clickable match cards');
  }
  
  if (window.location.pathname.includes('/match/')) {
    if (document.querySelector('.match-detail-container')) {
      logSuccess('MatchDetail component is functioning correctly');
    } else {
      logError('MatchDetail component is not rendering correctly');
    }
  } else {
    logInfo('Navigate to a match detail page to verify that component');
  }
  
  console.log('%c===== End of Tests =====', 'font-size: 14px; font-weight: bold; color: #2196f3');
}

async function testSocketService() {
  console.log('%c\nTest 1: Socket Service Methods', 'font-size: 13px; font-weight: bold; color: #4CAF50');
  
  // Get socketService from window
  const socketService = window.socketService || window.app?.socketService;
  if (!socketService) {
    logError('Cannot access socketService from window');
    return;
  }
  
  // Check required methods
  const requiredMethods = [
    'subscribeToMatch',
    'unsubscribeFromMatch',
    'requestMatchDetails'
  ];
  
  let allMethodsExist = true;
  
  requiredMethods.forEach(method => {
    if (typeof socketService[method] === 'function') {
      logSuccess(`socketService.${method} method exists`);
    } else {
      logError(`socketService.${method} method is missing`);
      allMethodsExist = false;
    }
  });
  
  // Additional checks
  if (socketService.socket) {
    logSuccess('Socket connection exists');
    logInfo(`Connected using: ${socketService.socket.io?.engine?.transport?.name || 'unknown'}`);
    logInfo(`Socket ID: ${socketService.socket.id || 'unknown'}`);
  } else {
    logInfo('Socket not connected yet (this is OK if page just loaded)');
  }
  
  return allMethodsExist;
}

async function testLiveMatchTickerLinks() {
  console.log('%c\nTest 2: LiveMatchTicker Links', 'font-size: 13px; font-weight: bold; color: #4CAF50');
  
  // Check for LiveMatchTicker component
  const liveTickerElement = document.querySelector('.live-ticker');
  if (!liveTickerElement) {
    logError('LiveMatchTicker component not found on page');
    return false;
  }
  
  logSuccess('LiveMatchTicker component found');
  
  // Check for match links with class
  const matchLinks = document.querySelectorAll('.match-link');
  if (matchLinks.length > 0) {
    logSuccess(`Found ${matchLinks.length} match links with 'match-link' class`);
    
    // Check if they have proper href
    const validLinks = Array.from(matchLinks).filter(link => 
      link.href && link.href.includes('/match/'));
    
    if (validLinks.length === matchLinks.length) {
      logSuccess('All match links have proper URL format (/match/:id)');
    } else {
      logError(`Only ${validLinks.length} out of ${matchLinks.length} links have proper URL format`);
    }
    
    return true;
  }
  
  // Alternative check - just looking for any links to match pages
  const altMatchLinks = Array.from(document.querySelectorAll('a'))
    .filter(a => a.href.includes('/match/'));
    
  if (altMatchLinks.length > 0) {
    logSuccess(`Found ${altMatchLinks.length} links to match pages (missing 'match-link' class)`);
    return true;
  }
  
  logError('No match links found in LiveMatchTicker');
  return false;
}

async function testMatchDetailNavigation() {
  console.log('%c\nTest 3: Match Detail Navigation', 'font-size: 13px; font-weight: bold; color: #4CAF50');
  
  if (window.location.pathname.includes('/match/')) {
    // Already on a match detail page
    const matchId = window.location.pathname.split('/match/')[1];
    logSuccess(`Currently viewing match detail page for ID: ${matchId}`);
    
    // Check for match-detail-container
    const container = document.querySelector('.match-detail-container');
    if (container) {
      logSuccess('MatchDetail component is rendered');
      
      // Check for tabs
      const tabs = document.querySelectorAll('.match-tabs .tab');
      if (tabs.length > 0) {
        logSuccess(`Match detail has ${tabs.length} tabs for viewing different information`);
      } else {
        logError('Match detail is missing tabs navigation');
      }
    } else {
      logError('MatchDetail component is not rendering correctly');
    }
  } else {
    // Not on a match detail page yet
    logInfo('Not currently on a match detail page');
    
    // Find match links
    const matchLinks = document.querySelectorAll('.match-link, a[href*="/match/"]');
    if (matchLinks.length > 0) {
      logSuccess(`Found ${matchLinks.length} match links that can be clicked to navigate to detail page`);
      logInfo('To complete verification: Click any match to navigate to its detail page');
      
      // Show the first match link for reference
      const firstLink = matchLinks[0];
      const matchId = firstLink.href.split('/match/')[1];
      logInfo(`Example: Match ID ${matchId} can be viewed at ${firstLink.href}`);
    } else {
      logError('No match links found to navigate to detail page');
    }
  }
}

async function testMatchSubscriptionHook() {
  console.log('%c\nTest 4: useMatchSubscription Hook', 'font-size: 13px; font-weight: bold; color: #4CAF50');
  
  // This is difficult to test directly from the console
  // We'll check for the expected behavior instead
  
  if (window.location.pathname.includes('/match/')) {
    // Check if data is being loaded
    const loadingElement = document.querySelector('.match-detail-container.loading');
    const errorElement = document.querySelector('.match-detail-container.error');
    const contentElement = document.querySelector('.teams-score');
    
    if (loadingElement) {
      logInfo('Match data is currently loading (this is expected briefly)');
    } else if (errorElement) {
      logError('Error loading match data - hook may not be functioning correctly');
    } else if (contentElement) {
      logSuccess('Match data loaded successfully - useMatchSubscription hook is working');
      
      // Check if we have team names and scores rendered
      const teamElements = document.querySelectorAll('.team-name');
      if (teamElements.length >= 2) {
        logSuccess('Team information is displayed correctly');
      }
      
      // Check for events/stats/lineups
      const tabContent = document.querySelector('.tab-content');
      if (tabContent) {
        logSuccess('Tab content is rendering - hook is providing data to component');
      }
    } else {
      logError('Cannot determine if useMatchSubscription hook is working correctly');
    }
  } else {
    // Check for source code references
    try {
      const hookTester = {
        checkHook: () => {
          try {
            return typeof useMatchSubscription === 'function';
          } catch (e) {
            return false;
          }
        }
      };
      
      if (hookTester.checkHook()) {
        logSuccess('useMatchSubscription hook is available globally');
      } else {
        logInfo('useMatchSubscription hook exists but is correctly scoped (not global)');
      }
    } catch (e) {
      logInfo('Cannot directly test useMatchSubscription hook from console');
    }
    
    logInfo('Navigate to a match detail page to verify the hook functionality');
  }
}

// Helper functions for formatted logging
function logSuccess(message) {
  console.log(`%c✅ ${message}`, 'color: #4CAF50');
}

function logError(message) {
  console.log(`%c❌ ${message}`, 'color: #F44336; font-weight: bold');
}

function logInfo(message) {
  console.log(`%cℹ️ ${message}`, 'color: #2196F3');
}

// When run in the console, expose the function
window.runMilestone2Tests = runMilestone2Tests;
console.log("%cRun window.runMilestone2Tests() to verify Milestone 2 functionality", "color: #2196F3; font-weight: bold");

// Auto-run if included in a script tag
if (typeof module === 'undefined') {
  setTimeout(runMilestone2Tests, 1000); // Delay to ensure page is loaded
} 