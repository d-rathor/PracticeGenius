import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

// --- Start of new code block for determining proxy target ---

const FALLBACK_PROD_BACKEND_URL = 'https://practicegenius-api.onrender.com';
let determinedTargetUrl = process.env.NEXT_PUBLIC_API_URL; 

console.log(`[PROXY DEBUG] Initial process.env.NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL}`);
console.log(`[PROXY DEBUG] Initial process.env.NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`[PROXY DEBUG] Initial process.env.VERCEL_ENV (Netlify equivalent is CONTEXT): ${process.env.CONTEXT}`); 

const isNetlifyProduction = process.env.CONTEXT === 'production';

if (isNetlifyProduction) {
  if (!determinedTargetUrl || determinedTargetUrl.includes('localhost') || determinedTargetUrl.includes('127.0.0.1')) {
    console.warn(`[PROXY WARNING] In Netlify Production (CONTEXT: ${process.env.CONTEXT}), NEXT_PUBLIC_API_URL was '${determinedTargetUrl}'. This is incorrect. Forcing to fallback: ${FALLBACK_PROD_BACKEND_URL}`);
    determinedTargetUrl = FALLBACK_PROD_BACKEND_URL;
  } else {
    console.log(`[PROXY INFO] In Netlify Production (CONTEXT: ${process.env.CONTEXT}), using NEXT_PUBLIC_API_URL: ${determinedTargetUrl}`);
  }
} else {
  if (!determinedTargetUrl) {
    const devDefaultUrl = 'http://localhost:8080'; 
    console.log(`[PROXY INFO] In non-production context (CONTEXT: ${process.env.CONTEXT}, NODE_ENV: ${process.env.NODE_ENV}), NEXT_PUBLIC_API_URL not set. Defaulting to ${devDefaultUrl}`);
    determinedTargetUrl = devDefaultUrl;
  } else {
    console.log(`[PROXY INFO] In non-production context (CONTEXT: ${process.env.CONTEXT}, NODE_ENV: ${process.env.NODE_ENV}), using NEXT_PUBLIC_API_URL: ${determinedTargetUrl}`);
  }
}

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
  const { path } = req.query;
  const pathString = Array.isArray(path) ? path.join('/') : path || '';
  
  let apiPath = pathString.replace(/^\/|\/$/g, ''); 

  const targetUrl = `${determinedTargetUrl}/${apiPath}`;
  console.log(`[PROXY REQUEST] Forwarding ${req.method} request to: ${targetUrl}`);

  try {
    const session = await getToken({ req });
    const token = session?.accessToken || '';

    const headersToForward: Record<string, string> = {};
    for (const key in req.headers) {
      if (req.headers.hasOwnProperty(key) && key.toLowerCase() !== 'host' && key.toLowerCase() !== 'connection' && key.toLowerCase() !== 'content-length') {
        if (req.headers[key]) { 
          headersToForward[key] = Array.isArray(req.headers[key]) ? (req.headers[key] as string[]).join(', ') : req.headers[key] as string;
        }
      }
    }
    if (token) {
      headersToForward['Authorization'] = `Bearer ${token}`;
    }
    if (req.headers['content-type']) {
        headersToForward['Content-Type'] = req.headers['content-type'];
    } else if (req.method !== 'GET' && req.method !== 'HEAD') {
        headersToForward['Content-Type'] = 'application/json';
    }
    
    headersToForward['Accept'] = 'application/json, */*';
    headersToForward['host'] = new URL(determinedTargetUrl || FALLBACK_PROD_BACKEND_URL).host; 

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headersToForward,
      // *** THIS IS THE CORRECTED PART FOR THE BODY ***
      body: (req.method !== 'GET' && req.method !== 'HEAD') ?
            (req.headers['content-type']?.includes('multipart/form-data') ? (req as unknown as ReadableStream<Uint8Array>) : JSON.stringify(req.body))
            : undefined,
      // @ts-ignore
      duplex: (req.method !== 'GET' && req.method !== 'HEAD') ? 'half' : undefined, 
    });

    res.status(response.status);
    
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-encoding' && key.toLowerCase() !== 'transfer-encoding') {
        res.setHeader(key, value);
      }
    });

    res.setHeader('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_FRONTEND_URL || '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return res.json(data);
    } else if (contentType?.includes('text/plain') || contentType?.includes('text/html')) {
      const data = await response.text();
      return res.send(data);
    } else {
      if (response.body) {
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        return res.end();
      } else {
        return res.send(''); 
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

export const config = {
  api: {
    bodyParser: false, 
  },
};