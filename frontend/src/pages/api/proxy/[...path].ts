// frontend/src/pages/api/proxy/[...path].ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // --- Start of function ---
  console.log(`--- [PROXY /api/proxy/[...path].ts] FUNCTION EXECUTION STARTED ---`);
  console.log(`[PROXY] Request URL: ${req.url}`);
  console.log(`[PROXY] Request Method: ${req.method}`);
  console.log(`[PROXY] Request Query: ${JSON.stringify(req.query)}`);
  console.log(`[PROXY] Runtime NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`[PROXY] Runtime NETLIFY_CONTEXT: ${process.env.NETLIFY_CONTEXT}`);
  console.log(`[PROXY] Runtime NEXT_PUBLIC_API_URL (from function env): ${process.env.NEXT_PUBLIC_API_URL}`);
  // --- End of diagnostic logs ---

  res.status(418).json({ 
    message: "I'm a teapot. This Next.js proxy function at pages/api/proxy/[...path].ts was executed.",
    note: "This indicates the Netlify redirect for /api/proxy/* is NOT working as expected or is being bypassed.",
    requestUrl: req.url,
    query: req.query,
    diagnostics: {
      nodeEnv: process.env.NODE_ENV,
      netlifyContext: process.env.NETLIFY_CONTEXT,
      nextPublicApiUrlInFunctionScope: process.env.NEXT_PUBLIC_API_URL
    }
  });
  
  console.log(`--- [PROXY /api/proxy/[...path].ts] FUNCTION EXECUTION COMPLETED ---`);
}

export const config = {
  api: {
    // bodyParser: false, // Temporarily remove to simplify; add back if streams are definitely needed by this dummy version
  },
};