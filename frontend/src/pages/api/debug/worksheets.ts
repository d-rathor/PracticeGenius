import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/worksheets`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch worksheets: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Return the raw API response for debugging
    res.status(200).json({
      apiResponse: data,
      worksheetSample: data.data && data.data.length > 0 ? data.data[0] : null,
      hasData: !!data.data,
      dataIsArray: Array.isArray(data.data),
      dataLength: data.data ? data.data.length : 0
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
