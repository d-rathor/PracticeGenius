/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable output tracing for Netlify
  output: 'standalone',
  reactStrictMode: true,
  // Fix for static asset paths in production
  assetPrefix: process.env.NODE_ENV === 'production' ? '/' : '',
  // Ensure base path is set correctly
  basePath: '',
  // Removed swcMinify as it's no longer recognized in Next.js 15.3.3
  images: {
    // Replaced domains with remotePatterns as per Next.js 15.3.3 recommendation
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost'
      },
      {
        protocol: 'https',
        hostname: 'practicegenius-api.onrender.com'
      },
      {
        protocol: 'https',
        hostname: 'practicegenius-backend.onrender.com'
      }
    ],
    // Add unoptimized option to allow serving local images without optimization
    unoptimized: true,
  },
  // Add assetPrefix to ensure static assets are served correctly
  assetPrefix: '',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production' 
      ? 'https://practicegenius-api.onrender.com' 
      : 'http://localhost:8080',
  },
  // Add API proxy to forward requests to the backend server with extended timeout
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
  // Configure server options for longer timeouts
  serverRuntimeConfig: {
    // Increase timeout for API requests (10 minutes)
    timeout: 600000,
  },
  // Configure experimental features for better proxy handling
  experimental: {
    // Increase body size limit for large requests
    isrMemoryCacheSize: 0,
    // Better proxy timeout handling
    proxyTimeout: 600000, // 10 minutes
  },
};

module.exports = nextConfig;
