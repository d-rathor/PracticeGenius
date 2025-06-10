const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url.endsWith('/health')) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('OK');
  }
  
  res.writeHead(404);
  res.end('Not Found');
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Health check server running on port ${PORT}`);
});
