/**
 * Quick Test Script for Milestone 2
 * This script performs a quick scan of the critical components needed for Milestone 2
 * and reports their status. It can be run from any page in the application.
 */

function quickTest() {
  console.clear();
  console.log('%c==== Milestone 2 Quick Test ====', 'font-size: 16px; font-weight: bold; color: #4CAF50');
  
  // Check socketService
  const socketService = window.socketService;
  if (socketService) {
    console.log('✅ socketService is accessible');
    
    // Check required methods
    const requiredMethods = [
      'subscribeToMatch',
      'unsubscribeFromMatch', 
      'requestMatchDetails',
      'releaseComponent'
    ];
    
    let allMethodsExist = true;
    requiredMethods.forEach(method => {
      if (typeof socketService[method] === 'function') {
        console.log(`✅ socketService.${method} exists`);
      } else {
        console.log(`❌ socketService.${method} is missing`);
        allMethodsExist = false;
      }
    });
    
    if (allMethodsExist) {
      console.log('✅ All required socket methods are implemented');
    }
  } else {
    console.log('❌ socketService is not accessible');
  }
  
  // Check current page
  if (window.location.pathname.includes('/milestone2-test')) {
    console.log('✅ Currently on the Milestone2TestPage');
  } else {
    console.log('ℹ️ Not on the test page. Go to /milestone2-test to run the full test suite.');
  }
  
  // Check for LiveMatchTicker on the current page
  const ticker = document.querySelector('.live-ticker');
  if (ticker) {
    console.log('✅ LiveMatchTicker is present on the current page');
    
    // Check for match links
    const matchLinks = document.querySelectorAll('.match-link');
    if (matchLinks.length > 0) {
      console.log(`✅ Found ${matchLinks.length} match links in the ticker`);
    } else {
      console.log('❌ No match links found in the ticker');
    }
  } else {
    console.log('ℹ️ LiveMatchTicker is not on the current page');
  }
  
  // Check useMatchSubscription in scope
  try {
    const hookName = 'useMatchSubscription';
    const hookSource = Object.keys(window).find(key => 
      window[key] && 
      typeof window[key] === 'object' && 
      window[key].hasOwnProperty(hookName)
    );
    
    if (hookSource) {
      console.log(`✅ ${hookName} is available (exported from ${hookSource})`);
    } else {
      console.log(`ℹ️ ${hookName} is properly scoped (not globally available)`);
    }
  } catch (e) {
    console.log('ℹ️ Could not check for hook availability');
  }
  
  // Suggest next steps
  console.log('%c==== Next Steps ====', 'font-size: 14px; font-weight: bold; color: #2196F3');
  if (!window.location.pathname.includes('/milestone2-test')) {
    console.log('1. Go to /milestone2-test to run the full test suite');
    console.log('2. Or click the "Milestone 2 Test" link in the bottom right corner');
  } else {
    console.log('1. Check if matches appear in the LiveMatchTicker');
    console.log('2. Click on a match to test navigation to the detail page');
    console.log('3. Check that the match details are displayed correctly');
  }
}

// Auto-execute if not in a module context
if (typeof module === 'undefined') {
  quickTest();
} 

// Export for module usage
if (typeof module !== 'undefined') {
  module.exports = { quickTest };
}

// Add to window for easy access in console
window.quickTest = quickTest;
console.log('Run window.quickTest() to check Milestone 2 implementation status'); 