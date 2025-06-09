import { NextApiRequest, NextApiResponse } from 'next';

/**
 * @route   GET /api/admin/subscription-plans
 * @desc    Get all subscription plans (admin only)
 * @access  Private/Admin
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('=== API ENDPOINT CALLED: /api/admin/subscription-plans ===');
  console.log('Request method:', req.method);
  console.log('Request headers:', req.headers);
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Fetching subscription plans from backend...');
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/subscription-plans`;
    console.log('API URL:', apiUrl);
    
    // Add a timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    console.log('Sending fetch request to backend...');
    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    console.log('Response received from backend');
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (!response.ok) {
      console.error('Error response from backend:', response.status, response.statusText);
      let errorData;
      try {
        errorData = await response.json();
        console.error('Error data:', errorData);
      } catch (e) {
        console.error('Could not parse error response as JSON');
        errorData = { message: response.statusText };
      }
      return res.status(response.status).json(errorData);
    }

    const responseData = await response.json();
    console.log('Subscription plans response data:', responseData);
    
    // Handle the backend response format which is { success: boolean, data: SubscriptionPlan[] }
    let plansArray = [];
    if (responseData && responseData.success && Array.isArray(responseData.data)) {
      plansArray = responseData.data;
    } else if (Array.isArray(responseData)) {
      plansArray = responseData;
    }
    
    console.log('Returning plans array of length:', plansArray.length);
    return res.status(200).json(plansArray);
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return res.status(500).json({ message: 'Server error', details: error instanceof Error ? error.message : String(error) });
  }
}
