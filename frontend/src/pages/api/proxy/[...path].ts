import type { NextApiRequest, NextApiResponse } from 'next';
import type { ReadableStream } from 'node:stream/web'; // Ensure correct import for ReadableStream
import { WritableStream } from 'node:stream/web'; // Ensure correct import for WritableStream

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Disable this Next.js API route in production, as Netlify redirects should handle it.
  if (process.env.NODE_ENV === 'production') {
    console.log('[PROXY /api/proxy/[...path].ts] This route is disabled in production. Netlify redirects should handle proxying.');
    res.status(404).json({ message: 'API proxy not available through this route in production. Check Netlify redirects.' });
    return;
  }

  // Existing local development proxy logic
  const { path } = req.query;
  const targetPath = Array.isArray(path) ? path.join('/') : path;
  
  // Use NEXT_PUBLIC_API_URL for local development, as Netlify UI sets this for local context
  // Fallback to localhost:8080 if not set, though it should be.
  const backendApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'; 

  if (!targetPath) {
    console.error('[PROXY /api/proxy/[...path].ts] Target path is required but was not provided.');
    return res.status(400).json({ error: 'Target path is required' });
  }

  // Construct the target URL. Ensure no double slashes if backendApiUrl has a trailing slash.
  const cleanBackendApiUrl = backendApiUrl.endsWith('/') ? backendApiUrl.slice(0, -1) : backendApiUrl;
  const cleanTargetPath = targetPath.startsWith('/') ? targetPath.slice(1) : targetPath; // Ensure targetPath doesn't start with / if backendApiUrl is just domain
  
  // Assuming your lib/api.ts calls /api/proxy/api/worksheets, 
  // and we want to hit backend at /api/worksheets.
  // The targetPath will be 'api/worksheets'.
  // So, targetUrl should be `${cleanBackendApiUrl}/${cleanTargetPath}` if targetPath already includes 'api/'
  // Or, if targetPath is just 'worksheets', it would be `${cleanBackendApiUrl}/api/${cleanTargetPath}`.
  // Given the log `Failed to proxy http://localhost:8080/api/proxy/api/worksheets`,
  // it seems `req.url` in `lib/api.ts` is `/api/proxy/api/worksheets`.
  // And `path` from `req.query` would be `['api', 'worksheets']`.
  // So `targetPath` becomes `api/worksheets`.
  // The targetUrl should then be `backendApiUrl (http://localhost:8080)` + `/` + `targetPath (api/worksheets)`
  // which is `http://localhost:8080/api/worksheets`. This seems correct for local.

  const targetUrl = `${cleanBackendApiUrl}/${cleanTargetPath}`;
  console.log(`[PROXY /api/proxy/[...path].ts] LOCAL DEV: Forwarding to: ${targetUrl}`);

  try {
    const headersToForward = { ...req.headers };
    delete headersToForward.host; // Let fetch set the correct host
    delete headersToForward.connection; // Let fetch handle connection management
    // Remove 'cookie' to prevent forwarding user's browser cookies to the backend if not intended
    delete headersToForward.cookie; 
    // Add any specific headers your backend might require, e.g., an API key for local dev
    // headersToForward['x-dev-proxy-source'] = 'netlify-nextjs-proxy';

    let bodyToSend: BodyInit | null | undefined = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.headers['content-type']?.includes('multipart/form-data')) {
        // For multipart/form-data, pass the request object itself as the body.
        // Ensure you have `export const config = { api: { bodyParser: false } };` if not already.
        bodyToSend = req as unknown as ReadableStream<Uint8Array>;
      } else if (req.body) {
        bodyToSend = JSON.stringify(req.body);
        headersToForward['content-length'] = Buffer.byteLength(bodyToSend).toString();
        if (!headersToForward['content-type']) { // Ensure content-type is set for JSON
            headersToForward['content-type'] = 'application/json';
        }
      }
    }
    
    const proxyResponse = await fetch(targetUrl, {
      method: req.method,
      headers: headersToForward as HeadersInit,
      body: bodyToSend,
      // @ts-ignore
      duplex: (req.method !== 'GET' && req.method !== 'HEAD' && bodyToSend instanceof ReadableStream) ? 'half' : undefined,
    });

    res.status(proxyResponse.status);
    proxyResponse.headers.forEach((value, name) => {
      // Do not forward 'transfer-encoding' or 'content-encoding' if they might conflict
      if (!['transfer-encoding', 'content-encoding'].includes(name.toLowerCase())) {
        res.setHeader(name, value);
      }
    });
    
    if (proxyResponse.body) {
      // @ts-ignore
      await proxyResponse.body.pipeTo(new WritableStream({
        write(chunk) {
          res.write(chunk);
        },
        close() {
          res.end();
        },
        abort(err) {
          console.error('[PROXY /api/proxy/[...path].ts] LOCAL DEV: Stream aborted:', err);
          if (!res.writableEnded) {
            res.status(500).end('Proxy stream error');
          }
        },
      }));
    } else {
      res.end();
    }

  } catch (error: any) {
    console.error(`[PROXY /api/proxy/[...path].ts] LOCAL DEV: Error proxying to ${targetUrl}:`, error);
    if (!res.writableEnded) {
        if (error.code === 'ECONNREFUSED') {
            res.status(502).json({ error: 'Bad Gateway: Could not connect to the backend service.' , details: `Connection refused at ${targetUrl}`});
        } else {
            res.status(500).json({ error: 'Internal Server Error during proxying', details: error.message });
        }
    }
  }
}

// If you are dealing with multipart/form-data, you might need this:
export const config = {
  api: {
    bodyParser: false, // Disables Next.js's default body parser for this route
  },
};