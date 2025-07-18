# Organization Service API Documentation

## Overview
The Organization Service provides comprehensive management capabilities for both institute-specific and global organizations with enterprise-grade security features.

## Security Features
- **JWT Authentication**: All endpoints require valid JWT tokens
- **Role-based Access Control**: Granular permissions based on organization roles
- **Multi-layer Security Guards**: Organization membership and role validation
- **Input Validation**: Comprehensive validation with sanitization
- **Audit Logging**: Complete audit trail for all operations
- **Rate Limiting**: Protection against abuse
- **Security Monitoring**: Real-time security event logging

## Base URL
```
https://api.latus.com/organizations
```

## Authentication
All API endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Error Responses
All endpoints return standardized error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "timestamp": "2025-07-18T10:30:00Z",
  "requestId": "req_123456"
}
```

## Common HTTP Status Codes
- `200 OK`: Success
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## 1. Organization Management

### 1.1 Create Organization
**POST** `/`

Creates a new organization. The type (institute/global) is determined by the payload structure.

**Request Body:**
```json
{
  "name": "Engineering Student Council",
  "description": "Official student council for engineering department",
  "logo": "https://example.com/logo.png",
  "requiresVerification": true,
  "visibility": "PUBLIC"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Organization created successfully",
  "data": {
    "id": 1,
    "name": "Engineering Student Council",
    "description": "Official student council for engineering department",
    "logo": "https://example.com/logo.png",
    "requiresVerification": true,
    "visibility": "PUBLIC",
    "enrollmentKey": "abc123def456",
    "createdAt": "2025-07-18T10:30:00Z",
    "updatedAt": "2025-07-18T10:30:00Z",
    "memberCount": 0,
    "activeMembers": 0,
    "pendingMembers": 0
  },
  "timestamp": "2025-07-18T10:30:00Z",
  "requestId": "req_123456"
}
```

### 1.2 Search Organizations
**GET** `/`

Search and filter organizations with pagination.

**Query Parameters:**
- `query` (string, optional): Search term for name/description
- `type` (string, optional): "INSTITUTE" or "GLOBAL"
- `visibility` (string, optional): "PUBLIC", "PRIVATE", "RESTRICTED"
- `category` (string, optional): Organization category
- `tags` (array, optional): Array of tag filters
- `limit` (number, optional): Results per page (default: 20, max: 100)
- `offset` (number, optional): Page offset (default: 0)
- `sortBy` (string, optional): Sort field (default: "createdAt")
- `sortOrder` (string, optional): "asc" or "desc" (default: "desc")

**Response:**
```json
{
  "success": true,
  "message": "Organizations retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Engineering Student Council",
      "description": "Official student council for engineering department",
      "logo": "https://example.com/logo.png",
      "requiresVerification": true,
      "visibility": "PUBLIC",
      "createdAt": "2025-07-18T10:30:00Z",
      "updatedAt": "2025-07-18T10:30:00Z",
      "memberCount": 25,
      "activeMembers": 23,
      "pendingMembers": 2,
      "isUserMember": true,
      "userRole": "MEMBER",
      "userStatus": "APPROVED"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  },
  "timestamp": "2025-07-18T10:30:00Z",
  "requestId": "req_123456"
}
```

### 1.3 Get Organization Details
**GET** `/{id}`

Retrieve detailed information about a specific organization.

**Path Parameters:**
- `id` (number): Organization ID

**Response:**
```json
{
  "success": true,
  "message": "Organization retrieved successfully",
  "data": {
    "id": 1,
    "name": "Engineering Student Council",
    "description": "Official student council for engineering department",
    "logo": "https://example.com/logo.png",
    "requiresVerification": true,
    "visibility": "PUBLIC",
    "settings": {
      "allowPublicEnrollment": true,
      "requireEmailVerification": false,
      "autoApproveEnrollments": false,
      "maxMembers": 100
    },
    "enrollmentKey": "abc123def456",
    "createdAt": "2025-07-18T10:30:00Z",
    "updatedAt": "2025-07-18T10:30:00Z",
    "memberCount": 25,
    "activeMembers": 23,
    "pendingMembers": 2,
    "isUserMember": true,
    "userRole": "MEMBER",
    "userStatus": "APPROVED"
  },
  "timestamp": "2025-07-18T10:30:00Z",
  "requestId": "req_123456"
}
```

### 1.4 Update Organization
**PUT** `/{id}`

Update organization details. Requires PRESIDENT, VICE_PRESIDENT, or ADMIN role.

**Path Parameters:**
- `id` (number): Organization ID

**Request Body:**
```json
{
  "name": "Updated Engineering Student Council",
  "description": "Updated description",
  "logo": "https://example.com/new-logo.png",
  "visibility": "PRIVATE"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Organization updated successfully",
  "data": {
    "id": 1,
    "name": "Updated Engineering Student Council",
    "description": "Updated description",
    "logo": "https://example.com/new-logo.png",
    "visibility": "PRIVATE",
    "updatedAt": "2025-07-18T11:00:00Z"
  },
  "timestamp": "2025-07-18T11:00:00Z",
  "requestId": "req_123456"
}
```

### 1.5 Delete Organization
**DELETE** `/{id}`

Delete an organization. Requires PRESIDENT or ADMIN role.

**Path Parameters:**
- `id` (number): Organization ID

**Response:**
```json
{
  "success": true,
  "message": "Organization deleted successfully",
  "timestamp": "2025-07-18T11:00:00Z",
  "requestId": "req_123456"
}
```

---

## 2. Institute Organizations

### 2.1 Create Institute Organization
**POST** `/institute`

Create a new institute-specific organization.

**Request Body:**
```json
{
  "instituteId": 1,
  "name": "Computer Science Department Council",
  "description": "Student council for CS department",
  "logo": "https://example.com/cs-logo.png",
  "category": "Academic",
  "tags": ["student-council", "academic", "computer-science"],
  "requiresVerification": true,
  "visibility": "PUBLIC"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Institute organization created successfully",
  "data": {
    "id": 1,
    "instituteId": 1,
    "institute": {
      "id": 1,
      "name": "MIT",
      "logo": "https://example.com/mit-logo.png"
    },
    "name": "Computer Science Department Council",
    "description": "Student council for CS department",
    "category": "Academic",
    "tags": ["student-council", "academic", "computer-science"],
    "logo": "https://example.com/cs-logo.png",
    "requiresVerification": true,
    "visibility": "PUBLIC",
    "enrollmentKey": "inst_abc123def456",
    "createdAt": "2025-07-18T10:30:00Z",
    "updatedAt": "2025-07-18T10:30:00Z",
    "memberCount": 0,
    "activeMembers": 0,
    "pendingMembers": 0
  },
  "timestamp": "2025-07-18T10:30:00Z",
  "requestId": "req_123456"
}
```

### 2.2 Get Institute Organizations
**GET** `/institute/{instituteId}`

Retrieve all organizations for a specific institute.

**Path Parameters:**
- `instituteId` (number): Institute ID

**Query Parameters:**
- Same as general organization search parameters

**Response:**
```json
{
  "success": true,
  "message": "Institute organizations retrieved successfully",
  "data": [
    {
      "id": 1,
      "instituteId": 1,
      "institute": {
        "id": 1,
        "name": "MIT",
        "logo": "https://example.com/mit-logo.png"
      },
      "name": "Computer Science Department Council",
      "category": "Academic",
      "tags": ["student-council", "academic", "computer-science"],
      "memberCount": 15,
      "activeMembers": 14,
      "pendingMembers": 1
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false
  },
  "timestamp": "2025-07-18T10:30:00Z",
  "requestId": "req_123456"
}
```

---

## 3. Global Organizations

### 3.1 Create Global Organization
**POST** `/global`

Create a new global organization that spans multiple institutes.

**Request Body:**
```json
{
  "name": "International Student Association",
  "description": "Global organization for international students",
  "logo": "https://example.com/isa-logo.png",
  "category": "International",
  "tags": ["international", "global", "student-association"],
  "allowedInstitutes": [1, 2, 3, 4],
  "requiresVerification": true,
  "visibility": "PUBLIC"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Global organization created successfully",
  "data": {
    "id": 1,
    "name": "International Student Association",
    "description": "Global organization for international students",
    "logo": "https://example.com/isa-logo.png",
    "category": "International",
    "tags": ["international", "global", "student-association"],
    "allowedInstitutes": [1, 2, 3, 4],
    "allowedInstituteNames": ["MIT", "Stanford", "Harvard", "Caltech"],
    "requiresVerification": true,
    "visibility": "PUBLIC",
    "enrollmentKey": "global_abc123def456",
    "createdAt": "2025-07-18T10:30:00Z",
    "updatedAt": "2025-07-18T10:30:00Z",
    "memberCount": 0,
    "activeMembers": 0,
    "pendingMembers": 0
  },
  "timestamp": "2025-07-18T10:30:00Z",
  "requestId": "req_123456"
}
```

### 3.2 Get Global Organizations
**GET** `/global`

Retrieve all global organizations.

**Query Parameters:**
- Same as general organization search parameters

**Response:**
```json
{
  "success": true,
  "message": "Global organizations retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "International Student Association",
      "description": "Global organization for international students",
      "category": "International",
      "tags": ["international", "global", "student-association"],
      "allowedInstitutes": [1, 2, 3, 4],
      "allowedInstituteNames": ["MIT", "Stanford", "Harvard", "Caltech"],
      "memberCount": 150,
      "activeMembers": 142,
      "pendingMembers": 8
    }
  ],
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false
  },
  "timestamp": "2025-07-18T10:30:00Z",
  "requestId": "req_123456"
}
```

---

## 4. User Management

### 4.1 Enroll User
**POST** `/{id}/users/enroll`

Enroll a user in an organization using an enrollment key.

**Path Parameters:**
- `id` (number): Organization ID

**Request Body:**
```json
{
  "enrollmentKey": "abc123def456",
  "password": "SecurePassword123!",
  "role": "MEMBER",
  "notes": "Joining as a regular member"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User enrolled successfully",
  "data": {
    "success": true,
    "message": "Enrollment successful",
    "enrollment": {
      "id": 1,
      "status": "PENDING",
      "role": "MEMBER",
      "requiresApproval": true,
      "approvalUrl": "https://app.latus.com/organizations/1/approvals/1"
    }
  },
  "timestamp": "2025-07-18T10:30:00Z",
  "requestId": "req_123456"
}
```

### 4.2 Assign User
**POST** `/{id}/users/assign`

Assign a user to an organization (admin function). Requires PRESIDENT, VICE_PRESIDENT, or ADMIN role.

**Path Parameters:**
- `id` (number): Organization ID

**Request Body:**
```json
{
  "userId": 123,
  "role": "SECRETARY",
  "password": "SecurePassword123!",
  "notes": "Appointed as secretary for the new term"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User assigned successfully",
  "data": {
    "id": 1,
    "user": {
      "id": 123,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "isActive": true,
      "lastLogin": "2025-07-18T09:00:00Z"
    },
    "role": "SECRETARY",
    "verificationStatus": "APPROVED",
    "joinedAt": "2025-07-18T10:30:00Z",
    "lastActive": "2025-07-18T10:30:00Z",
    "notes": "Appointed as secretary for the new term",
    "permissions": ["manage_events", "view_members", "send_notifications"]
  },
  "timestamp": "2025-07-18T10:30:00Z",
  "requestId": "req_123456"
}
```

### 4.3 Get Organization Users
**GET** `/{id}/users`

Retrieve all users in an organization with filtering and pagination.

**Path Parameters:**
- `id` (number): Organization ID

**Query Parameters:**
- `query` (string, optional): Search term for user name/email
- `role` (string, optional): Filter by role
- `status` (string, optional): Filter by verification status
- `includeInactive` (boolean, optional): Include inactive users
- `limit` (number, optional): Results per page (default: 20)
- `offset` (number, optional): Page offset (default: 0)
- `sortBy` (string, optional): Sort field (default: "joinedAt")
- `sortOrder` (string, optional): "asc" or "desc" (default: "desc")

**Response:**
```json
{
  "success": true,
  "message": "Organization users retrieved successfully",
  "data": [
    {
      "id": 1,
      "user": {
        "id": 123,
        "name": "John Doe",
        "email": "john.doe@example.com",
        "avatar": "https://example.com/avatar.jpg",
        "isActive": true,
        "lastLogin": "2025-07-18T09:00:00Z"
      },
      "role": "SECRETARY",
      "verificationStatus": "APPROVED",
      "joinedAt": "2025-07-18T10:30:00Z",
      "lastActive": "2025-07-18T10:30:00Z",
      "notes": "Appointed as secretary for the new term",
      "permissions": ["manage_events", "view_members", "send_notifications"]
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 20,
    "totalPages": 2,
    "hasNext": true,
    "hasPrevious": false
  },
  "timestamp": "2025-07-18T10:30:00Z",
  "requestId": "req_123456"
}
```

### 4.4 Get Organization User
**GET** `/{id}/users/{userId}`

Retrieve detailed information about a specific user in an organization.

**Path Parameters:**
- `id` (number): Organization ID
- `userId` (number): User ID

**Response:**
```json
{
  "success": true,
  "message": "Organization user retrieved successfully",
  "data": {
    "id": 1,
    "user": {
      "id": 123,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "isActive": true,
      "lastLogin": "2025-07-18T09:00:00Z"
    },
    "role": "SECRETARY",
    "verificationStatus": "APPROVED",
    "joinedAt": "2025-07-18T10:30:00Z",
    "lastActive": "2025-07-18T10:30:00Z",
    "notes": "Appointed as secretary for the new term",
    "permissions": ["manage_events", "view_members", "send_notifications"]
  },
  "timestamp": "2025-07-18T10:30:00Z",
  "requestId": "req_123456"
}
```

### 4.5 Update User Role
**PUT** `/{id}/users/{userId}/role`

Update a user's role in an organization. Requires PRESIDENT, VICE_PRESIDENT, or ADMIN role.

**Path Parameters:**
- `id` (number): Organization ID
- `userId` (number): User ID

**Request Body:**
```json
{
  "role": "TREASURER",
  "notes": "Promoted to treasurer position"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "id": 1,
    "user": {
      "id": 123,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "isActive": true,
      "lastLogin": "2025-07-18T09:00:00Z"
    },
    "role": "TREASURER",
    "verificationStatus": "APPROVED",
    "joinedAt": "2025-07-18T10:30:00Z",
    "lastActive": "2025-07-18T10:30:00Z",
    "notes": "Promoted to treasurer position",
    "permissions": ["manage_finances", "view_members", "manage_events"]
  },
  "timestamp": "2025-07-18T10:30:00Z",
  "requestId": "req_123456"
}
```

### 4.6 Verify User
**PUT** `/{id}/users/{userId}/verify`

Approve or reject a user's membership in an organization. Requires PRESIDENT, VICE_PRESIDENT, or ADMIN role.

**Path Parameters:**
- `id` (number): Organization ID
- `userId` (number): User ID

**Request Body:**
```json
{
  "approved": true,
  "notes": "Approved after verification of student ID"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User approved successfully",
  "data": {
    "id": 1,
    "user": {
      "id": 123,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "isActive": true,
      "lastLogin": "2025-07-18T09:00:00Z"
    },
    "role": "MEMBER",
    "verificationStatus": "APPROVED",
    "joinedAt": "2025-07-18T10:30:00Z",
    "lastActive": "2025-07-18T10:30:00Z",
    "notes": "Approved after verification of student ID",
    "permissions": ["view_members", "attend_events"]
  },
  "timestamp": "2025-07-18T10:30:00Z",
  "requestId": "req_123456"
}
```

### 4.7 Remove User
**DELETE** `/{id}/users/{userId}`

Remove a user from an organization. Requires PRESIDENT, VICE_PRESIDENT, or ADMIN role.

**Path Parameters:**
- `id` (number): Organization ID
- `userId` (number): User ID

**Request Body:**
```json
{
  "reason": "Graduated and no longer eligible"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User removed successfully",
  "timestamp": "2025-07-18T10:30:00Z",
  "requestId": "req_123456"
}
```

---

## 5. Bulk Operations

### 5.1 Bulk Assign Users
**POST** `/{id}/users/bulk-assign`

Assign multiple users to an organization in a single operation. Requires PRESIDENT, VICE_PRESIDENT, or ADMIN role.

**Path Parameters:**
- `id` (number): Organization ID

**Request Body:**
```json
{
  "users": [
    {
      "userId": 123,
      "role": "MEMBER",
      "password": "SecurePassword123!",
      "notes": "Bulk assignment - new members"
    },
    {
      "userId": 124,
      "role": "MEMBER",
      "password": "SecurePassword456!",
      "notes": "Bulk assignment - new members"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk user assignment completed",
  "data": {
    "success": true,
    "totalProcessed": 2,
    "successCount": 2,
    "failureCount": 0,
    "results": [
      {
        "userId": 123,
        "success": true
      },
      {
        "userId": 124,
        "success": true
      }
    ],
    "summary": {
      "processed": 2,
      "successful": 2,
      "failed": 0,
      "skipped": 0
    }
  },
  "timestamp": "2025-07-18T10:30:00Z",
  "requestId": "req_123456"
}
```

### 5.2 Bulk User Operation
**POST** `/{id}/users/bulk-operation`

Perform bulk operations on multiple users (role update, verification, etc.). Requires PRESIDENT, VICE_PRESIDENT, or ADMIN role.

**Path Parameters:**
- `id` (number): Organization ID

**Request Body:**
```json
{
  "userIds": [123, 124, 125],
  "role": "MEMBER",
  "approved": true,
  "notes": "Bulk approval for new semester"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk user operation completed",
  "data": {
    "success": true,
    "totalProcessed": 3,
    "successCount": 3,
    "failureCount": 0,
    "results": [
      {
        "userId": 123,
        "success": true
      },
      {
        "userId": 124,
        "success": true
      },
      {
        "userId": 125,
        "success": true
      }
    ],
    "summary": {
      "processed": 3,
      "successful": 3,
      "failed": 0,
      "skipped": 0
    }
  },
  "timestamp": "2025-07-18T10:30:00Z",
  "requestId": "req_123456"
}
```

---

## 6. Organization Settings

### 6.1 Get Organization Settings
**GET** `/{id}/settings`

Retrieve organization settings. Requires PRESIDENT, VICE_PRESIDENT, or ADMIN role.

**Path Parameters:**
- `id` (number): Organization ID

**Response:**
```json
{
  "success": true,
  "message": "Organization settings retrieved successfully",
  "data": {
    "allowPublicEnrollment": true,
    "requireEmailVerification": false,
    "autoApproveEnrollments": false,
    "maxMembers": 100,
    "allowedDomains": ["university.edu", "college.edu"],
    "customFields": {
      "studentIdRequired": true,
      "transcriptRequired": false
    },
    "enrollmentKey": "abc123def456",
    "lastKeyRegeneration": "2025-07-01T00:00:00Z",
    "keyRegenerationHistory": [
      {
        "regeneratedAt": "2025-07-01T00:00:00Z",
        "regeneratedBy": "admin@university.edu",
        "reason": "Security audit requirement"
      }
    ]
  },
  "timestamp": "2025-07-18T10:30:00Z",
  "requestId": "req_123456"
}
```

### 6.2 Update Organization Settings
**PUT** `/{id}/settings`

Update organization settings. Requires PRESIDENT, VICE_PRESIDENT, or ADMIN role.

**Path Parameters:**
- `id` (number): Organization ID

**Request Body:**
```json
{
  "allowPublicEnrollment": false,
  "requireEmailVerification": true,
  "autoApproveEnrollments": false,
  "maxMembers": 150,
  "allowedDomains": ["university.edu"],
  "customFields": {
    "studentIdRequired": true,
    "transcriptRequired": true,
    "recommendationRequired": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Organization settings updated successfully",
  "data": {
    "allowPublicEnrollment": false,
    "requireEmailVerification": true,
    "autoApproveEnrollments": false,
    "maxMembers": 150,
    "allowedDomains": ["university.edu"],
    "customFields": {
      "studentIdRequired": true,
      "transcriptRequired": true,
      "recommendationRequired": false
    },
    "enrollmentKey": "abc123def456",
    "lastKeyRegeneration": "2025-07-01T00:00:00Z"
  },
  "timestamp": "2025-07-18T10:30:00Z",
  "requestId": "req_123456"
}
```

### 6.3 Regenerate Enrollment Key
**POST** `/{id}/settings/regenerate-key`

Regenerate the organization's enrollment key. Requires PRESIDENT, VICE_PRESIDENT, or ADMIN role.

**Path Parameters:**
- `id` (number): Organization ID

**Request Body:**
```json
{
  "reason": "Security breach - regenerating as precaution"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Enrollment key regenerated successfully",
  "data": {
    "enrollmentKey": "new_abc123def456"
  },
  "timestamp": "2025-07-18T10:30:00Z",
  "requestId": "req_123456"
}
```

---

## 7. Statistics and Analytics

### 7.1 Get Organization Statistics
**GET** `/{id}/stats`

Retrieve organization statistics and metrics.

**Path Parameters:**
- `id` (number): Organization ID

**Query Parameters:**
- `startDate` (string, optional): Start date for statistics (ISO format)
- `endDate` (string, optional): End date for statistics (ISO format)
- `role` (string, optional): Filter by role
- `status` (string, optional): Filter by status
- `includeInactive` (boolean, optional): Include inactive members

**Response:**
```json
{
  "success": true,
  "message": "Organization statistics retrieved successfully",
  "data": {
    "totalMembers": 25,
    "activeMembers": 23,
    "pendingMembers": 2,
    "membersByRole": {
      "PRESIDENT": 1,
      "VICE_PRESIDENT": 1,
      "SECRETARY": 1,
      "TREASURER": 1,
      "MODERATOR": 3,
      "MEMBER": 18
    },
    "membersByStatus": {
      "PENDING": 2,
      "APPROVED": 23,
      "REJECTED": 0
    },
    "recentActivity": {
      "newMembers": 5,
      "approvedMembers": 4,
      "rejectedMembers": 1,
      "leftMembers": 0
    },
    "growthStats": {
      "thisMonth": 5,
      "lastMonth": 3,
      "growthRate": 0.67
    },
    "engagementStats": {
      "activeToday": 8,
      "activeThisWeek": 18,
      "activeThisMonth": 23,
      "averageSessionTime": 45
    }
  },
  "timestamp": "2025-07-18T10:30:00Z",
  "requestId": "req_123456"
}
```

### 7.2 Get Organization Analytics
**GET** `/{id}/analytics`

Retrieve detailed analytics for an organization. Requires PRESIDENT, VICE_PRESIDENT, or ADMIN role.

**Path Parameters:**
- `id` (number): Organization ID

**Query Parameters:**
- Same as statistics endpoint

**Response:**
```json
{
  "success": true,
  "message": "Organization analytics retrieved successfully",
  "data": {
    "timeRange": {
      "start": "2025-06-18T00:00:00Z",
      "end": "2025-07-18T23:59:59Z"
    },
    "overview": {
      "totalMembers": 25,
      "newMembers": 5,
      "activeMembers": 23,
      "memberRetentionRate": 0.92,
      "averageSessionDuration": 45
    },
    "membershipTrends": [
      {
        "date": "2025-06-18T00:00:00Z",
        "newMembers": 2,
        "leftMembers": 0,
        "totalMembers": 20
      },
      {
        "date": "2025-07-18T00:00:00Z",
        "newMembers": 5,
        "leftMembers": 0,
        "totalMembers": 25
      }
    ],
    "activityMetrics": [
      {
        "date": "2025-07-17T00:00:00Z",
        "activeUsers": 18,
        "sessions": 45,
        "pageViews": 234,
        "averageSessionTime": 42
      },
      {
        "date": "2025-07-18T00:00:00Z",
        "activeUsers": 8,
        "sessions": 23,
        "pageViews": 134,
        "averageSessionTime": 38
      }
    ],
    "engagementMetrics": {
      "dailyActiveUsers": 8,
      "weeklyActiveUsers": 18,
      "monthlyActiveUsers": 23,
      "topFeatures": [
        {
          "feature": "Events",
          "usage": 85,
          "uniqueUsers": 20
        },
        {
          "feature": "Discussions",
          "usage": 67,
          "uniqueUsers": 15
        }
      ]
    },
    "demographics": {
      "byInstitute": [
        {
          "instituteName": "MIT",
          "count": 25,
          "percentage": 100
        }
      ],
      "byRole": [
        {
          "role": "MEMBER",
          "count": 18,
          "percentage": 72
        },
        {
          "role": "MODERATOR",
          "count": 3,
          "percentage": 12
        }
      ],
      "byJoinDate": [
        {
          "month": "2025-06",
          "count": 20
        },
        {
          "month": "2025-07",
          "count": 5
        }
      ]
    }
  },
  "timestamp": "2025-07-18T10:30:00Z",
  "requestId": "req_123456"
}
```

### 7.3 Get Organization Activity
**GET** `/{id}/activity`

Retrieve recent activity and events for an organization.

**Path Parameters:**
- `id` (number): Organization ID

**Query Parameters:**
- `startDate` (string, optional): Start date for activity (ISO format)
- `endDate` (string, optional): End date for activity (ISO format)
- `action` (string, optional): Filter by action type
- `userId` (number, optional): Filter by user ID
- `limit` (number, optional): Results per page (default: 50)
- `offset` (number, optional): Page offset (default: 0)

**Response:**
```json
{
  "success": true,
  "message": "Organization activity retrieved successfully",
  "data": [
    {
      "id": 1,
      "action": "USER_JOINED",
      "actor": {
        "id": 123,
        "name": "John Doe",
        "avatar": "https://example.com/avatar.jpg"
      },
      "target": {
        "id": 1,
        "name": "Engineering Student Council",
        "type": "ORGANIZATION"
      },
      "description": "John Doe joined the organization",
      "metadata": {
        "role": "MEMBER",
        "enrollmentMethod": "invitation"
      },
      "timestamp": "2025-07-18T10:30:00Z",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 50,
    "totalPages": 3,
    "hasNext": true,
    "hasPrevious": false
  },
  "timestamp": "2025-07-18T10:30:00Z",
  "requestId": "req_123456"
}
```

---

## 8. Data Export

### 8.1 Export Organization Data
**POST** `/{id}/export`

Export organization data in various formats. Requires PRESIDENT, VICE_PRESIDENT, or ADMIN role.

**Path Parameters:**
- `id` (number): Organization ID

**Request Body:**
```json
{
  "format": "xlsx",
  "fields": ["users", "roles", "activity", "statistics"],
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2025-07-18T23:59:59Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Organization data export completed",
  "data": {
    "success": true,
    "message": "Export completed successfully",
    "downloadUrl": "https://api.latus.com/organizations/1/export/org_data_20250718.xlsx",
    "fileName": "org_data_20250718.xlsx",
    "fileSize": 2048576,
    "format": "xlsx",
    "recordCount": 150,
    "generatedAt": "2025-07-18T10:30:00Z",
    "expiresAt": "2025-07-25T10:30:00Z"
  },
  "timestamp": "2025-07-18T10:30:00Z",
  "requestId": "req_123456"
}
```

### 8.2 Download Exported Data
**GET** `/{id}/export/{fileName}`

Download previously exported data file. Requires PRESIDENT, VICE_PRESIDENT, or ADMIN role.

**Path Parameters:**
- `id` (number): Organization ID
- `fileName` (string): Name of the exported file

**Response:**
Binary file download with appropriate headers.

---

## 9. Notifications

### 9.1 Send Notification
**POST** `/{id}/notifications`

Send notifications to organization members. Requires PRESIDENT, VICE_PRESIDENT, or ADMIN role.

**Path Parameters:**
- `id` (number): Organization ID

**Request Body:**
```json
{
  "title": "Important Meeting Tomorrow",
  "message": "Please attend the monthly general meeting tomorrow at 3 PM in the main hall.",
  "type": "info",
  "userIds": [123, 124, 125],
  "roles": ["MEMBER", "MODERATOR"],
  "sendEmail": true,
  "sendPush": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "data": {
    "sent": 23,
    "failed": 2
  },
  "timestamp": "2025-07-18T10:30:00Z",
  "requestId": "req_123456"
}
```

---

## 10. Audit and Security

### 10.1 Get Audit Logs
**GET** `/{id}/audit-logs`

Retrieve audit logs for an organization. Requires PRESIDENT, VICE_PRESIDENT, or ADMIN role.

**Path Parameters:**
- `id` (number): Organization ID

**Query Parameters:**
- `startDate` (string, optional): Start date for logs (ISO format)
- `endDate` (string, optional): End date for logs (ISO format)
- `action` (string, optional): Filter by action type
- `userId` (number, optional): Filter by user ID
- `limit` (number, optional): Results per page (default: 50)
- `offset` (number, optional): Page offset (default: 0)

**Response:**
```json
{
  "success": true,
  "message": "Audit logs retrieved successfully",
  "data": [
    {
      "id": 1,
      "action": "UPDATE_USER_ROLE",
      "actor": {
        "id": 100,
        "name": "Admin User",
        "email": "admin@university.edu"
      },
      "target": {
        "id": 123,
        "type": "USER",
        "name": "John Doe"
      },
      "description": "Updated user role from MEMBER to SECRETARY",
      "metadata": {
        "previousRole": "MEMBER",
        "newRole": "SECRETARY",
        "reason": "Promoted to officer position"
      },
      "timestamp": "2025-07-18T10:30:00Z",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "severity": "MEDIUM",
      "category": "USER_MANAGEMENT"
    }
  ],
  "pagination": {
    "total": 500,
    "page": 1,
    "limit": 50,
    "totalPages": 10,
    "hasNext": true,
    "hasPrevious": false
  },
  "timestamp": "2025-07-18T10:30:00Z",
  "requestId": "req_123456"
}
```

### 10.2 Get Security Alerts
**GET** `/{id}/security-alerts`

Retrieve security alerts for an organization. Requires PRESIDENT, VICE_PRESIDENT, or ADMIN role.

**Path Parameters:**
- `id` (number): Organization ID

**Query Parameters:**
- Same as audit logs endpoint

**Response:**
```json
{
  "success": true,
  "message": "Security alerts retrieved successfully",
  "data": [
    {
      "id": 1,
      "type": "MULTIPLE_FAILED_ATTEMPTS",
      "severity": "HIGH",
      "title": "Multiple Failed Login Attempts",
      "description": "User attempted to login with incorrect credentials 5 times in 10 minutes",
      "affectedUsers": 1,
      "organizationId": 1,
      "detectedAt": "2025-07-18T10:00:00Z",
      "resolvedAt": null,
      "status": "ACTIVE",
      "actions": [
        {
          "label": "Block User",
          "url": "/api/organizations/1/users/123/block",
          "method": "POST"
        },
        {
          "label": "Reset Password",
          "url": "/api/organizations/1/users/123/reset-password",
          "method": "POST"
        }
      ],
      "metadata": {
        "userId": 123,
        "attemptCount": 5,
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0"
      }
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 50,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false
  },
  "timestamp": "2025-07-18T10:30:00Z",
  "requestId": "req_123456"
}
```

---

## 11. Role Permissions

### 11.1 Get Role Permissions
**GET** `/{id}/roles/permissions`

Retrieve permission matrix for all roles in an organization.

**Path Parameters:**
- `id` (number): Organization ID

**Response:**
```json
{
  "success": true,
  "message": "Role permissions retrieved successfully",
  "data": [
    {
      "role": "PRESIDENT",
      "permissions": [
        {
          "id": 1,
          "name": "manage_organization",
          "description": "Full organization management access",
          "category": "ADMINISTRATION",
          "resource": "organization",
          "action": "*",
          "isDefault": true,
          "createdAt": "2025-07-18T10:30:00Z",
          "updatedAt": "2025-07-18T10:30:00Z"
        }
      ],
      "canManageUsers": true,
      "canManageOrganization": true,
      "canViewAuditLogs": true,
      "canExportData": true,
      "canSendNotifications": true,
      "maxMembersCanManage": 1000,
      "restrictedActions": []
    },
    {
      "role": "MEMBER",
      "permissions": [
        {
          "id": 10,
          "name": "view_members",
          "description": "View organization members",
          "category": "GENERAL",
          "resource": "users",
          "action": "read",
          "isDefault": true,
          "createdAt": "2025-07-18T10:30:00Z",
          "updatedAt": "2025-07-18T10:30:00Z"
        }
      ],
      "canManageUsers": false,
      "canManageOrganization": false,
      "canViewAuditLogs": false,
      "canExportData": false,
      "canSendNotifications": false,
      "maxMembersCanManage": 0,
      "restrictedActions": ["delete_organization", "manage_settings", "bulk_operations"]
    }
  ],
  "timestamp": "2025-07-18T10:30:00Z",
  "requestId": "req_123456"
}
```

---

## 12. System Health

### 12.1 Get System Health
**GET** `/health`

Retrieve system health status and metrics.

**Response:**
```json
{
  "success": true,
  "message": "System health retrieved successfully",
  "data": {
    "status": "HEALTHY",
    "uptime": 86400,
    "version": "1.0.0",
    "environment": "production",
    "services": {
      "database": {
        "status": "CONNECTED",
        "responseTime": 10,
        "lastChecked": "2025-07-18T10:30:00Z"
      },
      "auth": {
        "status": "ACTIVE",
        "responseTime": 5,
        "lastChecked": "2025-07-18T10:30:00Z"
      },
      "cache": {
        "status": "CONNECTED",
        "responseTime": 2,
        "lastChecked": "2025-07-18T10:30:00Z"
      }
    },
    "metrics": {
      "totalOrganizations": 150,
      "totalUsers": 5000,
      "activeUsers": 2500,
      "requestsPerMinute": 120,
      "averageResponseTime": 150,
      "errorRate": 0.001
    },
    "lastUpdated": "2025-07-18T10:30:00Z"
  },
  "timestamp": "2025-07-18T10:30:00Z",
  "requestId": "req_123456"
}
```

---

## Security Considerations

### Authentication and Authorization
- All endpoints require valid JWT tokens
- Role-based access control with granular permissions
- Organization membership verification
- Multi-layer security guards

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting

### Audit and Compliance
- Comprehensive audit logging
- Security event monitoring
- Real-time security alerts
- Data export capabilities
- GDPR compliance features

### Performance and Reliability
- Caching strategies
- Database query optimization
- Load balancing
- Circuit breaker patterns
- Health monitoring

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General endpoints**: 100 requests per minute per user
- **Authentication endpoints**: 10 requests per minute per IP
- **Bulk operations**: 5 requests per minute per user
- **Export operations**: 2 requests per minute per user

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1658145600
```

---

## Webhooks

The system supports webhooks for real-time event notifications:

### Supported Events
- `user.joined`: User joins organization
- `user.left`: User leaves organization
- `user.role_changed`: User role updated
- `user.verified`: User verification status changed
- `organization.created`: New organization created
- `organization.updated`: Organization details updated
- `organization.deleted`: Organization deleted
- `security.alert`: Security alert triggered

### Webhook Payload Example
```json
{
  "event": "user.joined",
  "timestamp": "2025-07-18T10:30:00Z",
  "data": {
    "organizationId": 1,
    "userId": 123,
    "role": "MEMBER",
    "verificationStatus": "PENDING"
  },
  "signature": "sha256=abc123def456..."
}
```

---

## SDK and Client Libraries

Official SDKs are available for:
- **JavaScript/TypeScript**: `@latus/organization-sdk`
- **Python**: `latus-organization-python`
- **Java**: `latus-organization-java`
- **C#**: `Latus.Organization.SDK`

### JavaScript Example
```javascript
import { OrganizationClient } from '@latus/organization-sdk';

const client = new OrganizationClient({
  baseUrl: 'https://api.latus.com',
  token: 'your-jwt-token'
});

// Get organization details
const org = await client.organizations.get(1);

// Enroll user
const enrollment = await client.organizations.enrollUser(1, {
  enrollmentKey: 'abc123def456',
  password: 'SecurePassword123!',
  role: 'MEMBER'
});
```

---

## Support and Resources

- **Documentation**: https://docs.latus.com/organizations
- **API Reference**: https://api.latus.com/docs
- **Status Page**: https://status.latus.com
- **Support**: support@latus.com
- **GitHub**: https://github.com/latus/organization-service

---

*This documentation is version 1.0.0 and was last updated on July 18, 2025.*
