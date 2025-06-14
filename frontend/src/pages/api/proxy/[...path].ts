import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

// --- Start of new code block for determining proxy target ---

const FALLBACK_PROD_BACKEND_URL = 'https://practicegenius-api.onrender.com';
// Netlify sets NEXT_PUBLIC_API_URL from its environment variables.
// For local dev, this might be undefined or set in a local .env.development or .env.local
let determinedTargetUrl = process.env.NEXT_PUBLIC_API_URL; 

console.log(`[PROXY DEBUG] Initial process.env.NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL}`);
console.log(`[PROXY DEBUG] Initial process.env.NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`[PROXY DEBUG] Initial process.env.VERCEL_ENV (Netlify equivalent is CONTEXT): ${process.env.CONTEXT}`); // Netlify uses CONTEXT (production, deploy-preview, branch-deploy)

// Netlify's equivalent of VERCEL_ENV is CONTEXT.
// 'production' is the context for the main live site.
// 'deploy-preview' for pull request previews.
// 'branch-deploy' for specific branches.
const isNetlifyProduction = process.env.CONTEXT === 'production';

if (isNetlifyProduction) {
  if (!determinedTargetUrl || determinedTargetUrl.includes('localhost') || determinedTargetUrl.includes('127.0.0.1')) {
    console.warn(`[PROXY WARNING] In Netlify Production (CONTEXT: ${process.env.CONTEXT}), NEXT_PUBLIC_API_URL was '${determinedTargetUrl}'. This is incorrect. Forcing to fallback: ${FALLBACK_PROD_BACKEND_URL}`);
    determinedTargetUrl = FALLBACK_PROD_BACKEND_URL;
  } else {
    console.log(`[PROXY INFO] In Netlify Production (CONTEXT: ${process.env.CONTEXT}), using NEXT_PUBLIC_API_URL: ${determinedTargetUrl}`);
  }
} else {
  // For local development or other Netlify contexts (deploy-preview, branch-deploy)
  if (!determinedTargetUrl) {
    const devDefaultUrl = 'http://localhost:8080'; // Default for local Next.js dev
    console.log(`[PROXY INFO] In non-production context (CONTEXT: ${process.env.CONTEXT}, NODE_ENV: ${process.env.NODE_ENV}), NEXT_PUBLIC_API_URL not set. Defaulting to ${devDefaultUrl}`);
    determinedTargetUrl = devDefaultUrl;
  } else {
    console.log(`[PROXY INFO] In non-production context (CONTEXT: ${process.env.CONTEXT}, NODE_ENV: ${process.env.NODE_ENV}), using NEXT_PUBLIC_API_URL: ${determinedTargetUrl}`);
  }
}

// Final safety net
if (!determinedTargetUrl) {
  console.error(`[PROXY CRITICAL] Target URL could not be determined after checks. Defaulting to ${FALLBACK_PROD_BACKEND_URL} as a last resort.`);
  determinedTargetUrl = FALLBACK_PROD_BACKEND_URL;
}

console.log(`[PROXY FINAL TARGET] The proxy will target: ${determinedTargetUrl}`);

// --- End of new code block ---


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Extract the path from the query parameters
  const { path } = req.query;
  const pathString = Array.isArray(path) ? path.join('/') : path || '';
  
  // Remove any leading slashes and the 'api' prefix if present
  // The proxy is at /api/proxy, so requests like /api/proxy/worksheets should map to /worksheets on the backend
  let apiPath = pathString.replace(/^\/|\/$/g, ''); 
  // Example: if pathString is "api/worksheets", apiPath becomes "worksheets"
  // If pathString is "worksheets", apiPath becomes "worksheets"
  // This logic seems fine if your frontend calls /api/proxy/worksheets or /api/proxy/api/worksheets

  // Construct the target URL using the determinedTargetUrl
  const targetUrl = `${determinedTargetUrl}/${apiPath}`;
  console.log(`[PROXY REQUEST] Forwarding ${req.method} request to: ${targetUrl}`);

  try {
    // Get the access token if user is authenticated
    const session = await getToken({ req });
    const token = session?.accessToken || '';

    const headersToForward: Record<string, string> = {};
    for (const key in req.headers) {
      if (req.headers.hasOwnProperty(key) && key.toLowerCase() !== 'host' && key.toLowerCase() !== 'connection' && key.toLowerCase() !== 'content-length') {
         // Exclude problematic headers
        if (req.headers[key]) { // Ensure value is not undefined
          headersToForward[key] = Array.isArray(req.headers[key]) ? (req.headers[key] as string[]).join(', ') : req.headers[key] as string;
        }
      }
    }
    if (token) {
      headersToForward['Authorization'] = `Bearer ${token}`;
    }
    // Ensure Content-Type is correctly passed, especially for FormData
    if (req.headers['content-type']) {
        headersToForward['Content-Type'] = req.headers['content-type'];
    } else if (req.method !== 'GET' && req.method !== 'HEAD') {
        // Default for POST/PUT if not specified, though client should set it
        headersToForward['Content-Type'] = 'application/json';
    }
    
    headersToForward['Accept'] = 'application/json, */*'; // Be more flexible with accept
    headersToForward['host'] = new URL(determinedTargetUrl).host; // Set host to the target's host

    // Forward the request to the backend API
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headersToForward,
      // Only include body for non-GET/HEAD requests
      // For FormData, body should be passed directly, not JSON.stringify
      body: (req.method !== 'GET' && req.method !== 'HEAD') ? 
            (req.headers['content-type']?.includes('multipart/form-data') ? req : JSON.stringify(req.body)) 
            : undefined,
      // @ts-ignore
      duplex: (req.method !== 'GET' && req.method !== 'HEAD') ? 'half' : undefined, // Required for Node.js 18+ fetch with streams/FormData
    });

    // Forward the response status
    res.status(response.status);
    
    // Forward all headers from the backend
    response.headers.forEach((value, key) => {
      // Skip content-encoding as it can cause issues with Next.js
      // Also skip transfer-encoding
      if (key.toLowerCase() !== 'content-encoding' && key.toLowerCase() !== 'transfer-encoding') {
        res.setHeader(key, value);
      }
    });

    // Add/Override CORS headers - ensure these are appropriate for your security model
    res.setHeader('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_FRONTEND_URL || '*'); // Be specific in production
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle OPTIONS preflight request
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    // Handle different response types
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return res.json(data);
    } else if (contentType?.includes('text/plain') || contentType?.includes('text/html')) {
      const data = await response.text();
      return res.send(data);
    } else {
      // For binary data like images or PDFs, stream the response
      // Note: Next.js API routes might have limitations with direct streaming of large files.
      // Consider if direct download from backend or pre-signed URLs are better for large files.
      if (response.body) {
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        return res.end();
      } else {
        return res.send(''); // Or handle as an error if body is expected
      }
    }
  } catch (error: any) {
    console.error('[PROXY ERROR] API proxy failed:', error);
    console.error('[PROXY ERROR DETAILS] Error message:', error.message);
    if (error.cause) {
        console.error('[PROXY ERROR DETAILS] Error cause:', error.cause);
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error in proxy',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error.cause || null
    });
  }
}

// Handle preflight requests and bodyParser config
export const config = {
  api: {
    bodyParser: false, // Set to false to handle FormData correctly, let fetch handle body parsing/streaming
  },
};