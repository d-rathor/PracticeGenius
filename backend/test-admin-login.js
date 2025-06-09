const axios = require('axios');

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    
    // Admin credentials
    const loginData = {
      email: 'admin@practicegenius.com',
      password: 'admin123'
    };
    
    // Make login request
    console.log('Sending login request...');
    const response = await axios.post('http://localhost:8080/api/auth/login', loginData);
    
    console.log('\n=== Login Successful ===');
    console.log('Status:', response.status);
    console.log('Token:', response.data.token);
    console.log('\nUser Details:');
    console.log('ID:', response.data.user.id);
    console.log('Name:', response.data.user.name);
    console.log('Email:', response.data.user.email);
    console.log('Role:', response.data.user.role);
    
    // Test getting profile with token
    console.log('\nTesting profile retrieval with token...');
    const profileResponse = await axios.get('http://localhost:8080/api/auth/me', {
      headers: {
        Authorization: `Bearer ${response.data.token}`
      }
    });
    
    console.log('\n=== Profile Retrieved Successfully ===');
    console.log('Status:', profileResponse.status);
    console.log('User Data:', JSON.stringify(profileResponse.data, null, 2));
    
  } catch (error) {
    console.error('\n=== Error ===');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
  }
}

// Run the test
testAdminLogin();
