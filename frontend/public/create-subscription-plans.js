/**
 * Script to create subscription plans directly from the browser
 * 
 * To use this script:
 * 1. Open your browser console on any page of your application
 * 2. Copy and paste the entire contents of this file
 * 3. Press Enter to execute
 */

(async function() {
  console.log('Starting subscription plans creation...');
  
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

  // Get the token from localStorage
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No authentication token found. Please log in first.');
    return;
  }

  console.log('Authentication token found.');
  
  // Create each subscription plan using the backend API
  const results = [];
  for (const plan of subscriptionPlans) {
    console.log(`Creating ${plan.name} plan...`);
    try {
      const response = await fetch('http://localhost:8080/api/subscription-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(plan)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to create ${plan.name} plan:`, errorData);
        results.push({ name: plan.name, success: false, error: errorData.message });
      } else {
        const data = await response.json();
        console.log(`Successfully created ${plan.name} plan:`, data);
        results.push({ name: plan.name, success: true, data });
      }
    } catch (error) {
      console.error(`Error creating ${plan.name} plan:`, error);
      results.push({ name: plan.name, success: false, error: error.message });
    }
  }

  console.log('Subscription plans creation completed.');
  console.log('Results:', results);
  
  // Display results in a more readable format
  console.table(results.map(r => ({
    'Plan Name': r.name,
    'Success': r.success,
    'Details': r.success ? 'Plan created successfully' : (r.error || 'Unknown error')
  })));
  
  console.log('You can now refresh the page and check if the subscription plans are available.');
})();
