import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Only allow POST requests for this endpoint
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/worksheets`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch worksheets: ${response.status}`);
    }
    
    const data = await response.json();
    const worksheets = data.data || [];
    
    if (worksheets.length < 3) {
      return res.status(400).json({ error: 'Not enough worksheets to update' });
    }
    
    // Update subscription levels for testing
    const updateResults = await Promise.all([
      // Update first worksheet to Essential
      updateWorksheetSubscriptionLevel(worksheets[0]._id, 'Essential'),
      
      // Update second worksheet to Premium
      updateWorksheetSubscriptionLevel(worksheets[1]._id, 'Premium')
    ]);
    
    res.status(200).json({ 
      message: 'Test worksheets updated successfully', 
      results: updateResults 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

async function updateWorksheetSubscriptionLevel(id: string, subscriptionLevel: string) {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/worksheets/${id}`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ subscriptionLevel })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update worksheet ${id}: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      id,
      subscriptionLevel,
      success: true,
      data
    };
  } catch (error: any) {
    return {
      id,
      subscriptionLevel,
      success: false,
      error: error.message
    };
  }
}
