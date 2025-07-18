# Organization API Test Guide

## Overview
This guide provides comprehensive testing instructions for all organization management APIs with industrial security standards.

## Prerequisites
- Node.js 18+ installed
- Valid JWT token for authentication
- Organization service running locally or accessible endpoint
- Testing tools: Postman, curl, or automated testing framework

## Base Configuration

### Environment Variables
```bash
# Set these in your environment
export API_BASE_URL="http://localhost:3000"
export JWT_TOKEN="your-jwt-token-here"
export ORGANIZATION_ID="1"
export USER_ID="123"
```

### Headers for All Requests
```javascript
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

---

## 1. Authentication and Setup Tests

### 1.1 Test JWT Token Validation
```bash
# Test with valid token
curl -X GET \
  "${API_BASE_URL}/organizations/health" \
  -H "Authorization: Bearer ${JWT_TOKEN}"

# Expected: 200 OK with system health data

# Test with invalid token
curl -X GET \
  "${API_BASE_URL}/organizations/health" \
  -H "Authorization: Bearer invalid-token"

# Expected: 401 Unauthorized
```

### 1.2 Test Rate Limiting
```bash
# Send multiple requests rapidly
for i in {1..105}; do
  curl -X GET \
    "${API_BASE_URL}/organizations/health" \
    -H "Authorization: Bearer ${JWT_TOKEN}" \
    -w "%{http_code}\n" -s -o /dev/null
done

# Expected: First 100 requests return 200, then 429 (Rate Limited)
```

---

## 2. Organization Management Tests

### 2.1 Create Institute Organization
```bash
curl -X POST \
  "${API_BASE_URL}/organizations/institute" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "instituteId": 1,
    "name": "Test Engineering Council",
    "description": "Test organization for engineering students",
    "logo": "https://example.com/logo.png",
    "category": "Academic",
    "tags": ["engineering", "academic", "student-council"],
    "requiresVerification": true,
    "visibility": "PUBLIC"
  }'

# Expected: 201 Created with organization details
# Save the returned organization ID for subsequent tests
```

### 2.2 Create Global Organization
```bash
curl -X POST \
  "${API_BASE_URL}/organizations/global" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Global Student Association",
    "description": "Test global organization for all students",
    "logo": "https://example.com/global-logo.png",
    "category": "International",
    "tags": ["global", "international", "student-association"],
    "allowedInstitutes": [1, 2, 3],
    "requiresVerification": true,
    "visibility": "PUBLIC"
  }'

# Expected: 201 Created with global organization details
```

### 2.3 Search Organizations
```bash
# Basic search
curl -X GET \
  "${API_BASE_URL}/organizations?query=Test&limit=10&offset=0" \
  -H "Authorization: Bearer ${JWT_TOKEN}"

# Advanced search with filters
curl -X GET \
  "${API_BASE_URL}/organizations?type=INSTITUTE&visibility=PUBLIC&category=Academic&sortBy=createdAt&sortOrder=desc" \
  -H "Authorization: Bearer ${JWT_TOKEN}"

# Expected: 200 OK with paginated results
```

### 2.4 Get Organization Details
```bash
curl -X GET \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}" \
  -H "Authorization: Bearer ${JWT_TOKEN}"

# Expected: 200 OK with detailed organization information
```

### 2.5 Update Organization
```bash
curl -X PUT \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Test Engineering Council",
    "description": "Updated description for testing",
    "visibility": "PRIVATE"
  }'

# Expected: 200 OK with updated organization details
# Note: Requires appropriate role (PRESIDENT, VICE_PRESIDENT, or ADMIN)
```

---

## 3. User Management Tests

### 3.1 Enroll User with Enrollment Key
```bash
curl -X POST \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/users/enroll" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "enrollmentKey": "your-enrollment-key-here",
    "password": "SecurePassword123!",
    "role": "MEMBER",
    "notes": "Test enrollment"
  }'

# Expected: 201 Created with enrollment status
```

### 3.2 Assign User to Organization
```bash
curl -X POST \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/users/assign" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 123,
    "role": "SECRETARY",
    "password": "SecurePassword123!",
    "notes": "Test assignment"
  }'

# Expected: 201 Created with user assignment details
# Note: Requires appropriate role permissions
```

### 3.3 Get Organization Users
```bash
# Get all users
curl -X GET \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/users" \
  -H "Authorization: Bearer ${JWT_TOKEN}"

# Get users with filters
curl -X GET \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/users?role=MEMBER&status=APPROVED&limit=20" \
  -H "Authorization: Bearer ${JWT_TOKEN}"

# Expected: 200 OK with paginated user list
```

### 3.4 Get Specific User
```bash
curl -X GET \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/users/${USER_ID}" \
  -H "Authorization: Bearer ${JWT_TOKEN}"

# Expected: 200 OK with detailed user information
```

### 3.5 Update User Role
```bash
curl -X PUT \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/users/${USER_ID}/role" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "TREASURER",
    "notes": "Promoted to treasurer for testing"
  }'

# Expected: 200 OK with updated user details
# Note: Requires appropriate role permissions
```

### 3.6 Verify User
```bash
# Approve user
curl -X PUT \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/users/${USER_ID}/verify" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "approved": true,
    "notes": "Approved after verification"
  }'

# Reject user
curl -X PUT \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/users/${USER_ID}/verify" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "approved": false,
    "notes": "Rejected due to incomplete documents"
  }'

# Expected: 200 OK with verification result
```

### 3.7 Remove User
```bash
curl -X DELETE \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/users/${USER_ID}" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "User graduated and no longer eligible"
  }'

# Expected: 200 OK with removal confirmation
```

---

## 4. Bulk Operations Tests

### 4.1 Bulk Assign Users
```bash
curl -X POST \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/users/bulk-assign" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "users": [
      {
        "userId": 124,
        "role": "MEMBER",
        "password": "SecurePassword123!",
        "notes": "Bulk assignment test 1"
      },
      {
        "userId": 125,
        "role": "MEMBER",
        "password": "SecurePassword456!",
        "notes": "Bulk assignment test 2"
      }
    ]
  }'

# Expected: 200 OK with bulk operation results
```

### 4.2 Bulk User Operations
```bash
# Bulk role update
curl -X POST \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/users/bulk-operation" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": [124, 125, 126],
    "role": "MODERATOR",
    "notes": "Bulk promotion to moderator"
  }'

# Bulk approval
curl -X POST \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/users/bulk-operation" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": [124, 125, 126],
    "approved": true,
    "notes": "Bulk approval for semester start"
  }'

# Expected: 200 OK with bulk operation results
```

---

## 5. Organization Settings Tests

### 5.1 Get Organization Settings
```bash
curl -X GET \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/settings" \
  -H "Authorization: Bearer ${JWT_TOKEN}"

# Expected: 200 OK with organization settings
# Note: Requires appropriate role permissions
```

### 5.2 Update Organization Settings
```bash
curl -X PUT \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/settings" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "allowPublicEnrollment": false,
    "requireEmailVerification": true,
    "autoApproveEnrollments": false,
    "maxMembers": 200,
    "allowedDomains": ["university.edu", "college.edu"],
    "customFields": {
      "studentIdRequired": true,
      "transcriptRequired": true
    }
  }'

# Expected: 200 OK with updated settings
```

### 5.3 Regenerate Enrollment Key
```bash
curl -X POST \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/settings/regenerate-key" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Testing key regeneration"
  }'

# Expected: 200 OK with new enrollment key
```

---

## 6. Statistics and Analytics Tests

### 6.1 Get Organization Statistics
```bash
# Basic stats
curl -X GET \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/stats" \
  -H "Authorization: Bearer ${JWT_TOKEN}"

# Stats with filters
curl -X GET \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/stats?startDate=2025-01-01T00:00:00Z&endDate=2025-07-18T23:59:59Z&role=MEMBER" \
  -H "Authorization: Bearer ${JWT_TOKEN}"

# Expected: 200 OK with organization statistics
```

### 6.2 Get Organization Analytics
```bash
curl -X GET \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/analytics" \
  -H "Authorization: Bearer ${JWT_TOKEN}"

# Expected: 200 OK with detailed analytics
# Note: Requires appropriate role permissions
```

### 6.3 Get Organization Activity
```bash
curl -X GET \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/activity?limit=20&offset=0" \
  -H "Authorization: Bearer ${JWT_TOKEN}"

# Expected: 200 OK with activity log
```

---

## 7. Data Export Tests

### 7.1 Export Organization Data
```bash
# Export as Excel
curl -X POST \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/export" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "xlsx",
    "fields": ["users", "roles", "activity"],
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": "2025-07-18T23:59:59Z"
  }'

# Expected: 200 OK with export details and download URL
```

### 7.2 Download Exported Data
```bash
# Use the fileName from the export response
curl -X GET \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/export/org_data_20250718.xlsx" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -o "downloaded_org_data.xlsx"

# Expected: File download with appropriate headers
```

---

## 8. Notification Tests

### 8.1 Send Notification
```bash
# Send to specific users
curl -X POST \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/notifications" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "message": "This is a test notification for API testing",
    "type": "info",
    "userIds": [123, 124, 125],
    "sendEmail": true,
    "sendPush": false
  }'

# Send to roles
curl -X POST \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/notifications" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Role-based Notification",
    "message": "This notification is sent to all members and moderators",
    "type": "warning",
    "roles": ["MEMBER", "MODERATOR"],
    "sendEmail": true,
    "sendPush": true
  }'

# Expected: 200 OK with notification results
```

---

## 9. Audit and Security Tests

### 9.1 Get Audit Logs
```bash
# Get all audit logs
curl -X GET \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/audit-logs" \
  -H "Authorization: Bearer ${JWT_TOKEN}"

# Get filtered audit logs
curl -X GET \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/audit-logs?action=UPDATE_USER_ROLE&startDate=2025-07-01T00:00:00Z&limit=50" \
  -H "Authorization: Bearer ${JWT_TOKEN}"

# Expected: 200 OK with audit log entries
# Note: Requires appropriate role permissions
```

### 9.2 Get Security Alerts
```bash
curl -X GET \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/security-alerts" \
  -H "Authorization: Bearer ${JWT_TOKEN}"

# Expected: 200 OK with security alerts
# Note: Requires appropriate role permissions
```

### 9.3 Test Security Measures
```bash
# Test SQL injection prevention
curl -X GET \
  "${API_BASE_URL}/organizations/1; DROP TABLE users; --" \
  -H "Authorization: Bearer ${JWT_TOKEN}"

# Expected: 400 Bad Request or 404 Not Found (not SQL error)

# Test XSS prevention
curl -X PUT \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<script>alert(\"XSS\")</script>Test Org",
    "description": "Test description"
  }'

# Expected: 400 Bad Request with validation error
```

---

## 10. Role Permission Tests

### 10.1 Get Role Permissions
```bash
curl -X GET \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/roles/permissions" \
  -H "Authorization: Bearer ${JWT_TOKEN}"

# Expected: 200 OK with role permission matrix
```

### 10.2 Test Role-based Access
```bash
# Test unauthorized access (assuming current user is MEMBER)
curl -X DELETE \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}" \
  -H "Authorization: Bearer ${JWT_TOKEN}"

# Expected: 403 Forbidden (Members cannot delete organizations)

# Test authorized access (assuming current user is PRESIDENT)
curl -X PUT \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/settings" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "maxMembers": 150
  }'

# Expected: 200 OK (Presidents can update settings)
```

---

## 11. System Health Tests

### 11.1 Get System Health
```bash
curl -X GET \
  "${API_BASE_URL}/organizations/health" \
  -H "Authorization: Bearer ${JWT_TOKEN}"

# Expected: 200 OK with system health information
```

---

## 12. Error Handling Tests

### 12.1 Test Validation Errors
```bash
# Missing required fields
curl -X POST \
  "${API_BASE_URL}/organizations/institute" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": ""
  }'

# Expected: 400 Bad Request with validation errors
```

### 12.2 Test Not Found Errors
```bash
curl -X GET \
  "${API_BASE_URL}/organizations/99999" \
  -H "Authorization: Bearer ${JWT_TOKEN}"

# Expected: 404 Not Found
```

### 12.3 Test Permission Errors
```bash
# Test with insufficient permissions
curl -X DELETE \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/users/123" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Test removal"
  }'

# Expected: 403 Forbidden if user doesn't have permission
```

---

## 13. Performance Tests

### 13.1 Load Testing
```bash
# Test concurrent requests
seq 1 50 | xargs -I {} -P 10 curl -X GET \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -w "%{time_total}\n" -s -o /dev/null

# Expected: All requests complete within acceptable time limits
```

### 13.2 Pagination Performance
```bash
# Test large pagination
curl -X GET \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/users?limit=100&offset=0" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -w "Time: %{time_total}s\n"

# Expected: Response within acceptable time limits
```

---

## 14. Integration Tests

### 14.1 Full User Journey Test
```bash
#!/bin/bash

# 1. Create organization
ORG_RESPONSE=$(curl -s -X POST \
  "${API_BASE_URL}/organizations/institute" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "instituteId": 1,
    "name": "Integration Test Org",
    "description": "Organization for integration testing"
  }')

ORG_ID=$(echo $ORG_RESPONSE | jq -r '.data.id')
ENROLLMENT_KEY=$(echo $ORG_RESPONSE | jq -r '.data.enrollmentKey')

echo "Created organization: $ORG_ID"

# 2. Enroll user
curl -s -X POST \
  "${API_BASE_URL}/organizations/${ORG_ID}/users/enroll" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"enrollmentKey\": \"$ENROLLMENT_KEY\",
    \"password\": \"SecurePassword123!\",
    \"role\": \"MEMBER\"
  }"

echo "User enrolled successfully"

# 3. Get organization stats
curl -s -X GET \
  "${API_BASE_URL}/organizations/${ORG_ID}/stats" \
  -H "Authorization: Bearer ${JWT_TOKEN}"

echo "Retrieved organization stats"

# 4. Clean up (if needed)
curl -s -X DELETE \
  "${API_BASE_URL}/organizations/${ORG_ID}" \
  -H "Authorization: Bearer ${JWT_TOKEN}"

echo "Integration test completed"
```

---

## 15. Automated Testing with Jest

### 15.1 Test Setup
```javascript
// tests/setup.js
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const JWT_TOKEN = process.env.JWT_TOKEN;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${JWT_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

module.exports = { apiClient };
```

### 15.2 Organization Tests
```javascript
// tests/organization.test.js
const { apiClient } = require('./setup');

describe('Organization API Tests', () => {
  let organizationId;

  beforeAll(async () => {
    // Create test organization
    const response = await apiClient.post('/organizations/institute', {
      instituteId: 1,
      name: 'Test Organization',
      description: 'Test organization for API testing'
    });
    organizationId = response.data.data.id;
  });

  afterAll(async () => {
    // Clean up test organization
    if (organizationId) {
      await apiClient.delete(`/organizations/${organizationId}`);
    }
  });

  test('should create organization successfully', async () => {
    const response = await apiClient.post('/organizations/institute', {
      instituteId: 1,
      name: 'Another Test Organization',
      description: 'Another test organization'
    });

    expect(response.status).toBe(201);
    expect(response.data.success).toBe(true);
    expect(response.data.data.name).toBe('Another Test Organization');
  });

  test('should get organization details', async () => {
    const response = await apiClient.get(`/organizations/${organizationId}`);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.id).toBe(organizationId);
  });

  test('should update organization', async () => {
    const response = await apiClient.put(`/organizations/${organizationId}`, {
      name: 'Updated Test Organization',
      description: 'Updated description'
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.name).toBe('Updated Test Organization');
  });

  test('should handle validation errors', async () => {
    try {
      await apiClient.post('/organizations/institute', {
        // Missing required fields
        name: ''
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.success).toBe(false);
    }
  });
});
```

### 15.3 User Management Tests
```javascript
// tests/user-management.test.js
const { apiClient } = require('./setup');

describe('User Management API Tests', () => {
  let organizationId;
  let userId = 123; // Mock user ID

  beforeAll(async () => {
    // Create test organization
    const response = await apiClient.post('/organizations/institute', {
      instituteId: 1,
      name: 'User Management Test Org',
      description: 'Test organization for user management'
    });
    organizationId = response.data.data.id;
  });

  afterAll(async () => {
    // Clean up
    if (organizationId) {
      await apiClient.delete(`/organizations/${organizationId}`);
    }
  });

  test('should assign user to organization', async () => {
    const response = await apiClient.post(`/organizations/${organizationId}/users/assign`, {
      userId: userId,
      role: 'MEMBER',
      password: 'SecurePassword123!',
      notes: 'Test assignment'
    });

    expect(response.status).toBe(201);
    expect(response.data.success).toBe(true);
    expect(response.data.data.role).toBe('MEMBER');
  });

  test('should get organization users', async () => {
    const response = await apiClient.get(`/organizations/${organizationId}/users`);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(Array.isArray(response.data.data)).toBe(true);
  });

  test('should update user role', async () => {
    const response = await apiClient.put(`/organizations/${organizationId}/users/${userId}/role`, {
      role: 'MODERATOR',
      notes: 'Promoted to moderator'
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.role).toBe('MODERATOR');
  });
});
```

---

## 16. Testing Checklist

### Functional Testing
- [ ] All CRUD operations work correctly
- [ ] User enrollment and assignment work
- [ ] Role-based access control is enforced
- [ ] Bulk operations complete successfully
- [ ] Organization settings can be updated
- [ ] Data export functionality works
- [ ] Notifications are sent correctly

### Security Testing
- [ ] Authentication is required for all endpoints
- [ ] Authorization is properly enforced
- [ ] Input validation prevents injection attacks
- [ ] Rate limiting is functional
- [ ] Audit logging captures all actions
- [ ] Security alerts are generated

### Performance Testing
- [ ] Response times are acceptable
- [ ] Pagination works efficiently
- [ ] Concurrent requests are handled properly
- [ ] Large data sets are processed efficiently

### Error Handling
- [ ] Validation errors are properly formatted
- [ ] Not found errors return 404
- [ ] Permission errors return 403
- [ ] Server errors return 500
- [ ] All errors include meaningful messages

### Integration Testing
- [ ] Full user journey works end-to-end
- [ ] Database transactions are properly handled
- [ ] External service integrations work
- [ ] Webhook notifications are sent

---

## 17. Common Issues and Solutions

### Issue: Authentication Fails
**Solution**: Verify JWT token is valid and not expired
```bash
# Check token expiration
echo $JWT_TOKEN | cut -d. -f2 | base64 -d | jq .exp
```

### Issue: Permission Denied
**Solution**: Check user role and organization membership
```bash
# Get user's role in organization
curl -X GET \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}/users/${USER_ID}" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

### Issue: Rate Limiting
**Solution**: Implement exponential backoff or reduce request frequency
```bash
# Wait for rate limit reset
sleep 60
```

### Issue: Validation Errors
**Solution**: Check request body format and required fields
```bash
# Validate JSON format
echo '{"name": "test"}' | jq .
```

---

## 18. Test Data Management

### Test Data Creation Script
```bash
#!/bin/bash

# Create test organizations
for i in {1..5}; do
  curl -s -X POST \
    "${API_BASE_URL}/organizations/institute" \
    -H "Authorization: Bearer ${JWT_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{
      \"instituteId\": 1,
      \"name\": \"Test Organization $i\",
      \"description\": \"Test organization $i for API testing\"
    }" > /dev/null
  echo "Created test organization $i"
done
```

### Test Data Cleanup Script
```bash
#!/bin/bash

# Get all test organizations
ORGS=$(curl -s -X GET \
  "${API_BASE_URL}/organizations?query=Test%20Organization" \
  -H "Authorization: Bearer ${JWT_TOKEN}" | jq -r '.data[].id')

# Delete test organizations
for org_id in $ORGS; do
  curl -s -X DELETE \
    "${API_BASE_URL}/organizations/$org_id" \
    -H "Authorization: Bearer ${JWT_TOKEN}"
  echo "Deleted test organization $org_id"
done
```

---

## 19. Monitoring and Logging

### Check API Logs
```bash
# Check application logs
tail -f /var/log/organization-service/app.log

# Check security logs
tail -f /var/log/organization-service/security.log

# Check audit logs
tail -f /var/log/organization-service/audit.log
```

### Monitor Performance
```bash
# Monitor response times
curl -w "@curl-format.txt" -o /dev/null -s \
  "${API_BASE_URL}/organizations/${ORGANIZATION_ID}"

# Where curl-format.txt contains:
#     time_namelookup:  %{time_namelookup}\n
#        time_connect:  %{time_connect}\n
#     time_appconnect:  %{time_appconnect}\n
#    time_pretransfer:  %{time_pretransfer}\n
#       time_redirect:  %{time_redirect}\n
#  time_starttransfer:  %{time_starttransfer}\n
#                     ----------\n
#          time_total:  %{time_total}\n
```

---

## 20. Test Automation with CI/CD

### GitHub Actions Example
```yaml
# .github/workflows/api-tests.yml
name: API Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: test_db
        ports:
          - 3306:3306
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Start application
      run: npm start &
      env:
        DATABASE_URL: mysql://root:root@localhost:3306/test_db
        JWT_SECRET: test-secret
    
    - name: Wait for application
      run: sleep 10
    
    - name: Run API tests
      run: npm test
      env:
        API_BASE_URL: http://localhost:3000
        JWT_TOKEN: ${{ secrets.TEST_JWT_TOKEN }}
```

---

*This test guide is version 1.0.0 and covers comprehensive testing for the Organization Service API.*
