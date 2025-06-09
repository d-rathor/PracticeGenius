import { NextApiRequest, NextApiResponse } from 'next';

/**
 * @route   POST /api/admin/create-subscription-plans
 * @desc    Create subscription plans (admin only)
 * @access  Private/Admin
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Subscription plans data based on the pricing page
    const subscriptionPlans = [
      {
        name: 'Basic',
        description: 'Perfect for individual students or parents',
        price: {
          monthly: 12.99,
          yearly: 9.99
        },
        currency: 'USD',
        features: [
          'Access to 100+ basic worksheets',
          'Download up to 10 worksheets per month',
          'Basic progress tracking',
          'Email support'
        ],
        downloadLimit: 10,
        isActive: true
      },
      {
        name: 'Premium',
        description: 'Great for families and homeschooling',
        price: {
          monthly: 24.99,
          yearly: 19.99
        },
        currency: 'USD',
        features: [
          'Access to 500+ premium worksheets',
          'Unlimited downloads',
          'Advanced progress tracking',
          'Priority email support',
          'Customizable worksheets',
          'Up to 3 student profiles'
        ],
        downloadLimit: 0,
        isActive: true,
        isPopular: true
      },
      {
        name: 'Professional',
        description: 'Ideal for teachers and educational institutions',
        price: {
          monthly: 59.99,
          yearly: 49.99
        },
        currency: 'USD',
        features: [
          'Access to all 1,000+ worksheets',
          'Unlimited downloads',
          'Comprehensive progress tracking',
          'Priority phone and email support',
          'Customizable worksheets',
          'Unlimited student profiles',
          'Bulk worksheet generation',
          'Advanced analytics'
        ],
        downloadLimit: 0,
        isActive: true
      }
    ];

    // Create each subscription plan using the backend API
    const results = [];
    for (const plan of subscriptionPlans) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/subscription-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(plan)
      });

      if (!response.ok) {
        const errorData = await response.json();
        results.push({ name: plan.name, success: false, error: errorData.message });
      } else {
        const data = await response.json();
        results.push({ name: plan.name, success: true, data });
      }
    }

    return res.status(200).json({ message: 'Subscription plans creation attempted', results });
  } catch (error) {
    console.error('Error creating subscription plans:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
