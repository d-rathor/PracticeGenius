import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

const API_URL = process.env.API_URL || 'http://localhost:8080';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Extract the path from the query parameters
  const { path } = req.query;
  const pathString = Array.isArray(path) ? path.join('/') : path || '';
  
  // Remove any leading slashes and the 'api' prefix if present
  let apiPath = pathString.replace(/^\/|\/$/g, '');
  if (apiPath.startsWith('api/')) {
    apiPath = apiPath.substring(4);
  }

  // Construct the target URL
  const targetUrl = `${API_URL}/${apiPath}`;

  try {
    // Get the access token if user is authenticated
    const session = await getToken({ req });
    const token = session?.accessToken || '';

    // Forward the request to the backend API
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...(req.headers as Record<string, string>),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Remove the host header to avoid issues with the backend
        'host': new URL(API_URL).host,
      },
      // Only include body for non-GET/HEAD requests
      ...(req.method !== 'GET' && req.method !== 'HEAD' ? { body: JSON.stringify(req.body) } : {}),
    });

    // Forward the response status and headers
    res.status(response.status);
    
    // Forward all headers from the backend
    response.headers.forEach((value, key) => {
      // Skip content-encoding as it can cause issues with Next.js
      if (key.toLowerCase() !== 'content-encoding') {
        res.setHeader(key, value);
      }
    });

    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_FRONTEND_URL || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle different response types
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return res.json(data);
    } else {
      const data = await response.text();
      return res.send(data);
    }
  } catch (error) {
    console.error('API proxy error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Handle preflight requests
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
