import { io } from 'socket.io-client';

/**
 * Basic non-interactive Socket.IO client for testing connectivity
 * This script uses a simpler approach that may be more reliable for initial testing
 */
async function runBasicSocketTest() {
  console.log('Starting basic Socket.IO client test...');
  
  const serverUrl = 'http://localhost:3099';
  
  // First test raw HTTP connectivity
  console.log(`Testing HTTP connection to ${serverUrl}/test-connection...`);
  
  try {
    const response = await fetch(`${serverUrl}/test-connection`);
    const data = await response.json();
    console.log('HTTP connection successful:', data.message);
    console.log('Server timestamp:', new Date(data.timestamp).toISOString());
  } catch (error) {
    console.error('HTTP connection failed:', error.message);
    console.error('Cannot proceed if HTTP connection fails. Please check if server is running.');
    process.exit(1);
  }
  
  console.log('\nAttempting Socket.IO connection using polling transport...');
  
  // Create Socket.IO client with minimal options
  const socket = io(serverUrl, {
    transports: ['polling'],
    reconnection: true,
    reconnectionAttempts: 3,
    timeout: 10000,
    path: '/socket.io/',
    forceNew: true,
    query: { clientType: 'basicTest' }
  });
  
  // Set timeout for connection
  const connectionTimeout = setTimeout(() => {
    console.log('Connection timeout after 10 seconds. Server might not support Socket.IO.');
    socket.disconnect();
    process.exit(1);
  }, 10000);
  
  // Connection events
  socket.on('connect', () => {
    clearTimeout(connectionTimeout);
    console.log('✅ Connected successfully to Socket.IO server!');
    console.log(`Socket ID: ${socket.id}`);
    console.log(`Transport: ${socket.io.engine.transport.name}`);
    
    // Request live matches
    console.log('\nRequesting live matches...');
    socket.emit('request_live_matches');
    
    // Set a timeout to disconnect after receiving data or timeout
    setTimeout(() => {
      console.log('\nTest complete. Disconnecting...');
      socket.disconnect();
      process.exit(0);
    }, 10000);
  });
  
  socket.on('disconnect', (reason) => {
    console.log(`Disconnected: ${reason}`);
  });
  
  socket.on('connect_error', (error) => {
    console.error(`Connection error: ${error.message}`);
  });
  
  // Listen for live matches data
  socket.on('live_matches', (matches) => {
    console.log(`\nReceived ${matches.length} live matches:`);
    matches.forEach((match, index) => {
      const homeTeam = match.homeTeam?.name || 'Unknown';
      const awayTeam = match.awayTeam?.name || 'Unknown';
      
      console.log(`  ${index + 1}. ${homeTeam} ${match.homeScore}-${match.awayScore} ${awayTeam} (${match.minute}')`);
    });
  });
  
  // Listen for errors from server
  socket.on('error', (error) => {
    console.error(`Server error: ${error.message || JSON.stringify(error)}`);
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Shutting down client...');
    socket.disconnect();
    process.exit(0);
  });
}

// Run the test
runBasicSocketTest(); 