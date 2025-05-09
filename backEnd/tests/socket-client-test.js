import { io } from 'socket.io-client';
import readline from 'readline';

// Create readline interface for interactive commands
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Test client for WebSocket server
 */
function startTestClient() {
  const serverUrl = process.env.TEST_SERVER_URL || 'http://localhost:3099';
  
  console.log(`Connecting to WebSocket server at ${serverUrl}...`);
  console.log('Debug: Using enhanced connection settings');
  
  // Basic HTTP fetch to check if server is reachable
  // This helps identify if the issue is with the server or with Socket.IO
  console.log('Testing HTTP connection to server...');
  fetch(`${serverUrl}/health`)
    .then(response => {
      console.log(`HTTP connection successful with status: ${response.status}`);
    })
    .catch(error => {
      console.log(`HTTP connection failed: ${error.message}`);
      console.log('This may indicate the server is unreachable or not running.');
    });
  
  // Connect to test server with modified settings
  const socket = io(serverUrl, {
    // Force XHR polling transport only for debugging
    transports: ['polling'],
    // Disable automatic reconnection to handle it manually
    reconnection: false,
    // Longer timeouts
    timeout: 60000,
    // Explicitly set path
    path: '/socket.io/',
    // Force new connection
    forceNew: true,
    // No multiplexing
    multiplex: false,
    // Options for debugging
    query: {
      clientType: 'test',
      sessionId: Date.now().toString(),
      debug: 'true'
    },
    // Explicit extraHeaders
    extraHeaders: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true'
    }
  });
  
  // Manual reconnection logic
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  
  function attemptReconnect() {
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      console.log(`Manual reconnection attempt ${reconnectAttempts}...`);
      
      // Wait before attempting to reconnect
      setTimeout(() => {
        if (socket.connected) return;
        
        // Create new connection
        socket.connect();
      }, 2000);
    } else {
      console.log('Maximum reconnection attempts reached. Please check server status.');
      console.log('\nPossible causes:');
      console.log('1. Server not running on port 3099');
      console.log('2. CORS issues preventing connection');
      console.log('3. Firewall or network blocking polling transport');
      console.log('\nTry running the test with polling explicitly:');
      console.log('- Edit socket-client-test.js and socket-server-test.js');
      console.log('- Ensure both use only "polling" transport');
      console.log('\nPress CTRL+C to exit or type "exit"');
    }
  }
  
  // Track connection state
  let isConnected = false;
  
  // Add more event listeners for debugging
  socket.io.on("error", (error) => {
    console.log(`Socket.IO Low-level Error: ${error.message}`);
    if (!isConnected) attemptReconnect();
  });
  
  socket.io.on("reconnect_attempt", (attempt) => {
    console.log(`Socket.IO reconnection attempt ${attempt}`);
  });
  
  socket.io.on("reconnect_error", (error) => {
    console.log(`Socket.IO reconnection error: ${error.message}`);
  });
  
  socket.io.engine?.on("upgrade", (transport) => {
    console.log(`Socket transport upgraded to: ${transport.name}`);
  });
  
  socket.io.engine?.on("upgradeError", (error) => {
    console.log(`Socket transport upgrade error: ${error.message}`);
  });
  
  // Track subscription state
  const subscriptions = {
    matches: new Set(),
    events: new Set()
  };
  
  // Connection events
  socket.on('connect', () => {
    isConnected = true;
    reconnectAttempts = 0;
    console.log('\n✅ Connected to server with ID:', socket.id);
    
    // Log transport being used
    if (socket.io?.engine?.transport) {
      console.log(`Transport: ${socket.io.engine.transport.name}`);
    }
    
    showHelp();
    promptCommand();
    
    // Request live matches immediately
    socket.emit('request_live_matches');
  });
  
  socket.on('disconnect', (reason) => {
    isConnected = false;
    console.log('\n❌ Disconnected from server. Reason:', reason);
    
    // Only attempt reconnect for certain disconnect reasons
    if (reason === 'io server disconnect' || 
        reason === 'transport close' || 
        reason === 'transport error') {
      attemptReconnect();
    }
  });
  
  socket.on('connect_error', (error) => {
    console.error('\n❌ Connection error:', error.message);
    if (!isConnected) attemptReconnect();
  });
  
  // Data events
  socket.on('live_matches', (matches) => {
    console.log(`\n📊 Received ${matches.length} live matches:`);
    matches.forEach((match, index) => {
      const homeTeam = match.homeTeam?.name || 'Unknown';
      const awayTeam = match.awayTeam?.name || 'Unknown';
      
      console.log(`  ${index + 1}. [${match._id}] ${homeTeam} ${match.homeScore}-${match.awayScore} ${awayTeam} (${match.minute}')`);
    });
    
    promptCommand();
  });
  
  socket.on('match_updated', (match) => {
    console.log(`\n🔄 Match updated: ${match._id}`);
    const homeTeam = match.homeTeam?.name || 'Unknown';
    const awayTeam = match.awayTeam?.name || 'Unknown';
    
    console.log(`  ${homeTeam} ${match.homeScore}-${match.awayScore} ${awayTeam} (${match.minute}')`);
    promptCommand();
  });
  
  socket.on('match_event', (data) => {
    console.log(`\n📣 Match event for ${data.matchId}:`, data.event);
    promptCommand();
  });
  
  socket.on('goal_scored', (data) => {
    console.log(`\n⚽ GOAL in match ${data.matchId}!`);
    console.log(`  New score: ${data.match.homeTeam.name} ${data.match.homeScore}-${data.match.awayScore} ${data.match.awayTeam.name}`);
    promptCommand();
  });
  
  socket.on('card_shown', (data) => {
    console.log(`\n🟨 Card in match ${data.matchId}:`, data.event);
    promptCommand();
  });
  
  socket.on('error', (error) => {
    console.error(`\n❌ Received error from server:`, error);
    promptCommand();
  });
  
  socket.on('broadcast', (data) => {
    console.log(`\n📢 Broadcast message:`, data.message);
    promptCommand();
  });
  
  socket.on('subscription_success', (data) => {
    console.log(`\n✅ Successfully subscribed to match ${data.matchId}`);
    subscriptions.matches.add(data.matchId);
    promptCommand();
  });
  
  socket.on('unsubscription_success', (data) => {
    console.log(`\n✅ Successfully unsubscribed from match ${data.matchId}`);
    subscriptions.matches.delete(data.matchId);
    promptCommand();
  });
  
  // Handle heartbeat
  setInterval(() => {
    socket.emit('heartbeat', { timestamp: Date.now() });
  }, 30000);
  
  // Handle commands
  function promptCommand() {
    rl.question('Command > ', (cmd) => {
      handleCommand(cmd.trim());
    });
  }
  
  function handleCommand(cmd) {
    // Parse command
    const parts = cmd.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    switch (command) {
      case 'help':
        showHelp();
        promptCommand();
        break;
        
      case 'matches':
        // Request live matches
        socket.emit('request_live_matches');
        break;
        
      case 'subscribe':
        // Subscribe to match updates
        if (!args[0]) {
          console.log('❌ Please provide a match ID');
          promptCommand();
          return;
        }
        socket.emit('subscribe_match', args[0]);
        break;
        
      case 'unsubscribe':
        // Unsubscribe from match updates
        if (!args[0]) {
          console.log('❌ Please provide a match ID');
          promptCommand();
          return;
        }
        socket.emit('unsubscribe_match', args[0]);
        break;
        
      case 'event':
        // Subscribe to event type
        if (!args[0]) {
          console.log('❌ Please provide an event type (goals, cards, substitutions)');
          promptCommand();
          return;
        }
        socket.emit('subscribe_event', args[0]);
        console.log(`✅ Subscribed to event type: ${args[0]}`);
        subscriptions.events.add(args[0]);
        promptCommand();
        break;
        
      case 'status':
        // Show connection status
        socket.emit('status');
        console.log(`Current subscriptions:`);
        console.log(`  Matches: ${Array.from(subscriptions.matches).join(', ') || 'None'}`);
        console.log(`  Events: ${Array.from(subscriptions.events).join(', ') || 'None'}`);
        promptCommand();
        break;
        
      case 'transport':
        // Show current transport
        console.log(`Current transport: ${socket.io.engine.transport.name}`);
        promptCommand();
        break;
        
      case 'reconnect':
        // Force reconnection
        console.log('Forcing reconnection...');
        socket.disconnect().connect();
        break;
        
      case 'disconnect':
        // Disconnect from server
        console.log('Disconnecting from server...');
        socket.disconnect();
        promptCommand();
        break;
        
      case 'exit':
      case 'quit':
        // Exit the client
        console.log('Exiting...');
        socket.disconnect();
        rl.close();
        process.exit(0);
        break;
        
      default:
        console.log('❌ Unknown command. Type "help" for available commands.');
        promptCommand();
    }
  }
  
  function showHelp() {
    console.log('\nAvailable commands:');
    console.log('  help         - Show this help message');
    console.log('  matches      - Request live matches');
    console.log('  subscribe ID - Subscribe to updates for match ID');
    console.log('  unsubscribe ID - Unsubscribe from match ID');
    console.log('  event TYPE   - Subscribe to event type (goals, cards, substitutions)');
    console.log('  status       - Show connection status and subscriptions');
    console.log('  transport    - Show current transport (websocket/polling)');
    console.log('  reconnect    - Force reconnection');
    console.log('  disconnect   - Disconnect from server');
    console.log('  exit/quit    - Exit the client');
  }
  
  // Clean disconnection on CTRL+C
  process.on('SIGINT', () => {
    console.log('\nDisconnecting from server...');
    socket.disconnect();
    rl.close();
    process.exit(0);
  });
}

// Start the test client
startTestClient(); 