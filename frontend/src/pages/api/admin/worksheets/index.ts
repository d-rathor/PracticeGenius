import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

/**
 * @route   GET /api/admin/worksheets
 * @desc    Get all worksheets (admin only)
 * @access  Private/Admin
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get token from request headers
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      console.log('No authorization token found');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Forward request to backend API
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/worksheets`;
    console.log('Fetching worksheets from backend:', apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error('Backend API error response status:', response.status);
      
      // Forward the error response
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch worksheets' }));
      return res.status(response.status).json(errorData);
    }

    // Parse and return the worksheets data
    const data = await response.json();
    console.log('Worksheets fetched successfully:', data);
    
    // Return the data in the format expected by the frontend
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in worksheets API route:', error);
    return res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
}
