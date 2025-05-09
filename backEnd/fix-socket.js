// This script patches the socket service to fix the WebSocket read-only property issue

import fs from 'fs';
import path from 'path';

const socketServicePath = path.join(process.cwd(), 'mainServer', 'services', 'socketService.js');

console.log('Patching socket service at:', socketServicePath);

try {
  // Read the file content
  let content = fs.readFileSync(socketServicePath, 'utf-8');
  
  // Replace the problematic line that tries to set the read-only name property
  content = content.replace(
    /socket\.conn\.transport\.name\s*=\s*['"]polling['"]/g, 
    '// Removed attempt to modify read-only property\n                socket.mobileClient = true;'
  );
  
  // Write the modified content back to the file
  fs.writeFileSync(socketServicePath, content, 'utf-8');
  
  console.log('Socket service patched successfully!');
  console.log('You can now start the server with "npm start"');
} catch (error) {
  console.error('Error patching socket service:', error);
} 