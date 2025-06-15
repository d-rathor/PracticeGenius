// frontend/src/pages/api/proxy/[...path].ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("--- [PROXY /api/proxy/[...path].ts] INTENTIONAL CRASH TEST ---");
  console.log(`[PROXY] Request URL: ${req.url}`);
  const uniqueErrorMessage = "CRASH_TEST_JUNE_15_1158_AM_PROXY_PATH_TS";
  console.log(`[PROXY] About to throw: ${uniqueErrorMessage}`);
  throw new Error(uniqueErrorMessage); 
  
  // This part should be unreachable
  res.status(500).json({ message: "This line should never be reached due to the intentional crash." });
}

export const config = {
  api: {
    // bodyParser: false, // Keep it simple for this test
  },
};