import type { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'node:stream';
import { WritableStream as WebWritableStream } from 'node:stream/web';
// Removed unused import: import type { ReadableStream as WebReadableStreamType } from 'node:stream/web'; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV === 'production') {
    console.log('[PROXY /api/proxy/[...path].ts] This route is disabled in production. Netlify redirects should handle proxying.');
    res.status(404).json({ message: 'API proxy not available through this route in production. Check Netlify redirects.' });
    return;
  }

  const { path } = req.query;
  const targetPath = Array.isArray(path) ? path.join('/') : path;
  const backendApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  if (!targetPath) {
    console.error('[PROXY /api/proxy/[...path].ts] Target path is required but was not provided.');
    return res.status(400).json({ error: 'Target path is required' });
  }

  const cleanBackendApiUrl = backendApiUrl.endsWith('/') ? backendApiUrl.slice(0, -1) : backendApiUrl;
  const cleanTargetPath = targetPath.startsWith('/') ? targetPath.slice(1) : targetPath;
  const targetUrl = `${cleanBackendApiUrl}/${cleanTargetPath}`;
  console.log(`[PROXY /api/proxy/[...path].ts] LOCAL DEV: Forwarding to: ${targetUrl}`);

  try {
    const headersToForward: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
        if (value !== undefined) {
            headersToForward[key] = Array.isArray(value) ? value.join(', ') : value;
        }
    }

    delete headersToForward.host;
    delete headersToForward.connection;
    delete headersToForward.cookie;

    let bodyToSend: BodyInit | null | undefined = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.headers['content-type']?.includes('multipart/form-data')) {
        const nodeReadableStream = req as Readable;
        // @ts-ignore - Bypassing persistent type error for local dev path in Netlify build
        bodyToSend = Readable.toWeb(nodeReadableStream); 
      } else if (req.body) {
        bodyToSend = JSON.stringify(req.body);
        headersToForward['content-length'] = Buffer.byteLength(bodyToSend).toString();
        if (!headersToForward['content-type']) {
            headersToForward['content-type'] = 'application/json';
        }
      }
    }
    
    const proxyResponse = await fetch(targetUrl, {
      method: req.method,
      headers: headersToForward,
      body: bodyToSend,
      // @ts-ignore - Keep ts-ignore for duplex if it's problematic or refine its type
      duplex: (req.method !== 'GET' && req.method !== 'HEAD' && bodyToSend && typeof bodyToSend !== 'string' && !(bodyToSend instanceof URLSearchParams) && !(bodyToSend instanceof FormData) && !(bodyToSend instanceof Blob) && !(bodyToSend instanceof ArrayBuffer) && !(ArrayBuffer.isView(bodyToSend)) ) ? 'half' : undefined,
    });

    res.status(proxyResponse.status);
    proxyResponse.headers.forEach((value, name) => {
      if (!['transfer-encoding', 'content-encoding', 'connection'].includes(name.toLowerCase())) {
        res.setHeader(name, value);
      }
    });
    
    if (proxyResponse.body) {
      // @ts-ignore - If pipeTo also causes issues, this might be needed
      await proxyResponse.body.pipeTo(new WebWritableStream({
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

export const config = {
  api: {
    bodyParser: false,
  },
};