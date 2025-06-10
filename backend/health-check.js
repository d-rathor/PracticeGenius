const http = require('http');

const PORT = process.env.PORT || 10000;

// Minimal health check server
const server = http.createServer((req, res) => {
  // Log all requests for debugging
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Always respond with 200 OK to any request
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('OK');
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Health check server running on port ${PORT}`);
  console.log(`Health check available at http://0.0.0.0:${PORT}/health`);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
