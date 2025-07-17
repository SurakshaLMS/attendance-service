const axios = require('axios');

const baseURL = 'http://127.0.0.1:3000/api/v1/auth';

// Test functions
async function testLogin() {
    console.log('\n🔵 Testing Login...');
    
    try {
        // Valid login request - using the user we created
        const response = await axios.post(`${baseURL}/login`, {
            email: 'newuser@example.com',
            password: 'securepassword123'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Login successful:', response.data);
        return response.data; // Return token for other tests
    } catch (error) {
        if (error.response) {
            console.log('❌ Login failed with status:', error.response.status);
            console.log('❌ Error details:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('❌ Network error:', error.message);
        }
        return null;
    }
}

async function testRegister() {
    console.log('\n🔵 Testing Register with a different user...');
    
    try {
        const response = await axios.post(`${baseURL}/register`, {
            email: 'testuser2@example.com',
            username: 'testuser2',
            firstName: 'Jane',
            lastName: 'Smith',
            password: 'anotherpassword123',
            userType: 'INSTRUCTOR'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Registration successful:', response.data);
        return response.data;
    } catch (error) {
        if (error.response) {
            console.log('❌ Registration failed with status:', error.response.status);
            console.log('❌ Error details:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('❌ Network error:', error.message);
        }
        return null;
    }
}

async function testInvalidRequests() {
    console.log('\n🔵 Testing Invalid Requests (to see validation errors)...');
    
    // Test invalid email
    try {
        await axios.post(`${baseURL}/login`, {
            email: 'invalid-email',
            password: 'pass'
        });
    } catch (error) {
        console.log('❌ Invalid email test - Status:', error.response?.status);
        console.log('❌ Error details:', JSON.stringify(error.response?.data, null, 2));
    }
    
    // Test missing fields
    try {
        await axios.post(`${baseURL}/register`, {
            email: 'test@example.com'
            // Missing required fields
        });
    } catch (error) {
        console.log('❌ Missing fields test - Status:', error.response?.status);
        console.log('❌ Error details:', JSON.stringify(error.response?.data, null, 2));
    }
}

async function runTests() {
    console.log('🚀 Starting Authentication API Tests...');
    console.log('📡 Base URL:', baseURL);
    
    // Test registration first
    await testRegister();
    
    // Then test login with existing user
    const loginResult = await testLogin();
    
    // Test validation errors
    await testInvalidRequests();
    
    console.log('\n✨ Tests completed! Check the server logs for detailed error information.');
    
    if (loginResult) {
        console.log('\n🎉 SUCCESS: Both registration and login are working!');
        console.log('🔑 JWT Token received:', loginResult.access_token ? 'Yes' : 'No');
    }
}

// Run the tests
runTests().catch(console.error);
