const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if .env file exists, create it if not
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('Creating .env file with default values...');
  const defaultEnv = `NEXT_PUBLIC_API_URL=http://localhost:8080
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=practicegenius-frontend-dev-secret
`;
  fs.writeFileSync(envPath, defaultEnv);
  console.log('.env file created successfully');
}

// Print startup information
console.log('Starting Practice Genius Frontend Development Server');
console.log('--------------------------------------------------');
console.log('Environment: Development');
console.log('Port: 3000');
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080');
console.log('--------------------------------------------------');

// Start the development server
const server = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// Handle server process events
server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code, signal) => {
  if (code !== 0) {
    console.error(`Server process exited with code ${code} and signal ${signal}`);
    process.exit(code);
  }
});

// Handle process termination signals
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  server.kill('SIGTERM');
});
