# Authentication API Troubleshooting Guide

## ✅ Your Authentication System is Working!

Based on the tests, your authentication system is functioning correctly with:
- ✅ User registration with validation
- ✅ User login with JWT tokens
- ✅ Password encryption with bcrypt
- ✅ Comprehensive error handling and validation
- ✅ Detailed error messages for debugging

## 🔧 How to Debug "Bad Request" Errors

### 1. Common Validation Errors

When you get a 400 Bad Request error, check these common issues:

#### **Email Validation**
```json
// ❌ Invalid email format
{
  "email": "invalid-email",
  "password": "password123"
}

// ✅ Valid email format
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### **Password Requirements**
```json
// ❌ Password too short
{
  "email": "user@example.com",
  "password": "123"
}

// ✅ Password meets minimum length (6 characters)
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### **Missing Required Fields for Registration**
```json
// ❌ Missing required fields
{
  "email": "user@example.com"
}

// ✅ All required fields provided
{
  "email": "user@example.com",
  "username": "username123",
  "firstName": "John",
  "lastName": "Doe",
  "password": "password123",
  "userType": "STUDENT"
}
```

### 2. Valid UserType Values

The `userType` field must be one of:
- `STUDENT`
- `INSTRUCTOR`
- `ADMIN`
- `STAFF`
- `GUEST`

### 3. API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/auth/login` | POST | User login |
| `/api/v1/auth/register` | POST | User registration |
| `/api/v1/auth/change-password` | PUT | Change password (requires auth) |
| `/api/v1/auth/set-password` | POST | Set password for user |

### 4. Example Valid Requests

#### Login Request:
```javascript
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Registration Request:
```javascript
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "username": "newuser123",
  "firstName": "John",
  "lastName": "Doe",
  "password": "securepassword123",
  "userType": "STUDENT"
}
```

### 5. Error Response Format

All errors return this format:
```json
{
  "statusCode": 400,
  "timestamp": "2025-07-17T21:30:40.258Z",
  "path": "/api/v1/auth/login",
  "method": "POST",
  "error": "Bad Request",
  "message": [
    "Please provide a valid email address",
    "Password must be at least 6 characters long"
  ],
  "requestId": "req_1752787840257_4cx3hzrry"
}
```

### 6. Using cURL for Testing

#### Test Login:
```bash
curl -X POST http://127.0.0.1:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "securepassword123"
  }'
```

#### Test Registration:
```bash
curl -X POST http://127.0.0.1:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User",
    "password": "password123",
    "userType": "STUDENT"
  }'
```

### 7. JavaScript/Axios Example

```javascript
const axios = require('axios');

async function loginUser() {
  try {
    const response = await axios.post('http://127.0.0.1:3000/api/v1/auth/login', {
      email: 'user@example.com',
      password: 'password123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful:', response.data);
    // You'll get an access_token for authenticated requests
  } catch (error) {
    if (error.response) {
      console.log('Error Status:', error.response.status);
      console.log('Error Details:', error.response.data);
    }
  }
}
```

### 8. Common HTTP Status Codes

- **200**: Success
- **400**: Bad Request (validation error)
- **401**: Unauthorized (wrong credentials)
- **404**: Not Found (wrong endpoint)
- **500**: Internal Server Error

### 9. Server Logs

Your server provides detailed logs. When debugging:
1. Check the terminal where your server is running
2. Look for error logs with request IDs
3. Match the request ID from your error response to server logs

### 10. Test Your API

Use the `test-auth.js` file to test your API:
```bash
node test-auth.js
```

## 🚀 Your API is Ready!

Your authentication system includes:
- Strong password encryption (bcrypt with salt)
- JWT token authentication
- Comprehensive validation
- Detailed error messages
- Security middleware (Helmet, Rate Limiting, CORS)
- Proper HTTP status codes

You can now use these endpoints in your frontend application!
