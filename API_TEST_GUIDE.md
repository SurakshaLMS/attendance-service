# Organization Service API Testing

## Server Status
✅ **Server is running successfully on: http://localhost:3000**

## Available API Endpoints

### Base URL: `http://localhost:3000/api`

---

## 🏢 Institute Organization Endpoints

### 1. Create Institute Organization
```bash
POST /api/organizations/institute
Headers: Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "instituteId": 1,
  "name": "Computer Science Club",
  "description": "A club for CS students",
  "requiresVerification": false
}
```

### 2. Enroll in Institute Organization
```bash
POST /api/organizations/institute/enroll
Headers: Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "enrollmentKey": "cs-club-2024",
  "password": "myOrgPassword123",
  "role": "MEMBER"
}
```

### 3. Login to Institute Organization
```bash
POST /api/organizations/institute/login
Content-Type: application/json

{
  "userId": 1,
  "organizationId": 1,
  "password": "myOrgPassword123"
}
```

### 4. Assign User Directly (President/VP only)
```bash
POST /api/organizations/institute/:orgId/assign
Headers: Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "userId": 2,
  "role": "SECRETARY",
  "password": "newUserPassword123"
}
```

### 5. Verify User Enrollment
```bash
POST /api/organizations/institute/users/:userId/verify
Headers: Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "approved": true
}
```

---

## 🌍 Global Organization Endpoints

### 1. Create Global Organization
```bash
POST /api/organizations/global
Headers: Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Global Tech Community",
  "description": "A global tech community",
  "requiresVerification": true
}
```

### 2. Enroll in Global Organization
```bash
POST /api/organizations/global/enroll
Headers: Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "enrollmentKey": "global-tech-2024",
  "password": "myGlobalPassword123",
  "role": "MEMBER"
}
```

### 3. Login to Global Organization
```bash
POST /api/organizations/global/login
Content-Type: application/json

{
  "userId": 1,
  "organizationId": 1,
  "password": "myGlobalPassword123"
}
```

---

## 🏢 Institute Organization Management (New Module)

### 1. Get Organization Details
```bash
GET /api/institute-organizations/:orgId
Headers: Authorization: Bearer <org_jwt_token>
```

### 2. Get Organization Members
```bash
GET /api/institute-organizations/:orgId/members
Headers: Authorization: Bearer <org_jwt_token>
```

### 3. Get Pending Verifications (President/VP/Secretary only)
```bash
GET /api/institute-organizations/:orgId/pending-verifications
Headers: Authorization: Bearer <org_jwt_token>
```

### 4. Get Organization Statistics (President/VP/Secretary only)
```bash
GET /api/institute-organizations/:orgId/stats
Headers: Authorization: Bearer <org_jwt_token>
```

### 5. Update User Role (President/VP only)
```bash
PUT /api/institute-organizations/:orgId/members/:userId/role
Headers: Authorization: Bearer <org_jwt_token>
Content-Type: application/json

{
  "role": "TREASURER"
}
```

### 6. Remove User (President/VP only)
```bash
DELETE /api/institute-organizations/:orgId/members/:userId
Headers: Authorization: Bearer <org_jwt_token>
```

### 7. Update Organization Settings (President/VP only)
```bash
PUT /api/institute-organizations/:orgId/settings
Headers: Authorization: Bearer <org_jwt_token>
Content-Type: application/json

{
  "name": "Updated Organization Name",
  "description": "Updated description",
  "requiresVerification": true
}
```

### 8. Regenerate Enrollment Key (President/VP/Secretary only)
```bash
POST /api/institute-organizations/:orgId/enrollment-key/regenerate
Headers: Authorization: Bearer <org_jwt_token>
```

---

## 📚 Lecture Endpoints

### 1. Create Lecture
```bash
POST /api/organizations/lectures
Headers: Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Introduction to TypeScript",
  "description": "Learn TypeScript basics",
  "content": "TypeScript is a typed superset of JavaScript...",
  "visibility": "PUBLIC",
  "level": "GLOBAL"
}
```

### 2. Get Public Lectures
```bash
GET /api/organizations/lectures/public
```

### 3. Get Institute Organization Lectures (Members only)
```bash
GET /api/organizations/institute/:orgId/lectures
Headers: Authorization: Bearer <jwt_token>
```

### 4. Get Global Organization Lectures (Members only)
```bash
GET /api/organizations/global/:orgId/lectures
Headers: Authorization: Bearer <jwt_token>
```

### 5. Enroll in Lecture
```bash
POST /api/organizations/lectures/:lectureId/enroll
Headers: Authorization: Bearer <jwt_token>
```

---

## 🔄 Sync Endpoints

### 1. Sync Users from Main LMS
```bash
POST /api/sync/users
Headers: Authorization: Bearer <jwt_token>
```

### 2. Sync Institutes from Main LMS
```bash
POST /api/sync/institutes
Headers: Authorization: Bearer <jwt_token>
```

### 3. Sync All Data
```bash
POST /api/sync/all
Headers: Authorization: Bearer <jwt_token>
```

---

## 👤 User Endpoints

### 1. Get My Organizations
```bash
GET /api/organizations/my-organizations
Headers: Authorization: Bearer <jwt_token>
```

---

## 🔐 Authentication Flow

### Step 1: Get JWT from Main LMS
```bash
# This would come from your main LMS authentication
# The token should include user info and institute IDs
```

### Step 2: Login to Organization
```bash
# Use the organization-specific login endpoints
# This returns a new JWT with organization context
```

### Step 3: Use Organization JWT
```bash
# Use the organization JWT for all subsequent requests
# This JWT includes organization membership and role info
```

---

## 🛡️ Guards and Permissions

### Role-Based Access Control
- **PRESIDENT**: Full access to all organization features
- **VICE_PRESIDENT**: Can assign users, manage settings, verify members
- **SECRETARY**: Can view stats, manage verifications, regenerate keys
- **TREASURER**: Standard member with some admin features
- **MODERATOR**: Content moderation capabilities
- **MEMBER**: Basic access to organization content

### Organization Membership Guards
- **OrganizationMemberGuard**: Ensures user is active member of institute organization
- **GlobalOrganizationMemberGuard**: Ensures user is active member of global organization
- **RolesGuard**: Checks if user has required role for specific actions

---

## 🧪 Testing the API

### Health Check
```bash
curl http://localhost:3000/api
# Should return: "Hello World!"
```

### Test Database Connection
The server startup logs show successful database connection to:
- **Host**: database-1.c218yqq22nq7.us-east-1.rds.amazonaws.com
- **Database**: organization
- **Status**: ✅ Connected successfully

---

## 📊 Features Implemented

✅ **Database Setup**
- AWS RDS MySQL connection configured
- All tables created successfully
- Migration completed without errors

✅ **Authentication & Authorization**
- JWT-based authentication
- Separate organization passwords
- Role-based access control
- Organization membership guards

✅ **Institute Organization Management**
- Complete CRUD operations
- Member management
- Role assignment and updates
- Settings management
- Statistics and analytics

✅ **Global Organization Support**
- Cross-institute organizations
- Global user management
- Separate authentication flow

✅ **Lecture System**
- Public and private lectures
- Organization-specific content
- Enrollment tracking

✅ **Guards & Security**
- Member-only access to organization features
- Role-based permissions
- Input validation and sanitization

✅ **API Structure**
- RESTful API design
- Proper error handling
- Comprehensive endpoint coverage

The service is now fully operational and ready for production use! 🎉
