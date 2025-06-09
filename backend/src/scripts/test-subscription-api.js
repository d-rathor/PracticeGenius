// Simple script to test the subscription plans API
const http = require('http');

function testSubscriptionPlansAPI() {
  console.log('Testing subscription plans API...');
  
  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api/subscription-plans',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log('Response status:', res.statusCode);
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        console.log('Subscription plans data:');
        console.log(JSON.stringify(parsedData, null, 2));
        console.log('Number of plans:', Array.isArray(parsedData) ? parsedData.length : 'Not an array');
      } catch (e) {
        console.error('Error parsing response:', e);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error testing API:', error);
  });

  req.end();
}

testSubscriptionPlansAPI();
