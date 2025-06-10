console.log('=== STARTING PRACTICE GENIUS API ===');
console.log('Timestamp:', new Date().toISOString());
console.log('Environment Variables:', {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  RENDER: process.env.RENDER,
  NODE_VERSION: process.version,
  PLATFORM: process.platform,
  ARCH: process.arch
});
console.log('Current working directory:', process.cwd());
console.log('File paths:', {
  __filename: __filename,
  __dirname: __dirname
});

const http = require('http');
const PORT = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Simple response for all requests
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Minimal Server: OK\n' + 
           `Path: ${req.url}\n` +
           `Method: ${req.method}\n` +
           `Port: ${PORT}\n`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Minimal server running on http://0.0.0.0:${PORT}`);
  console.log('Press Ctrl+C to stop the server');
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
