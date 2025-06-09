const http = require('http');

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({
    success: true,
    message: 'Simple HTTP server is running',
    timestamp: new Date().toISOString()
  }));
});

// Start server
const PORT = 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple HTTP server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});

// Keep the process alive
console.log('Server process will remain active until manually terminated');

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
