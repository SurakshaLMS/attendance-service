# Organization Service - Learning Management System

This microservice manages organizations, lectures, and user enrollments for the Learning Management System.

## Features

- **Institute Organizations**: Organizations within specific institutes
- **Global Organizations**: Organizations not tied to specific institutes  
- **Separate Authentication**: Each organization has its own password system
- **Role-based Access**: Different user roles (President, Vice President, Secretary, etc.)
- **Lecture Management**: Public and private lectures for organizations
- **Enrollment System**: Enrollment keys and verification workflows
- **Sync Integration**: Automatic synchronization with main LMS

## Database Schema

### Core Tables
- `users` - Synced from main LMS
- `institutes` - Synced from main LMS
- `institute_organizations` - Organizations within institutes
- `global_organizations` - Global organizations
- `institute_organization_users` - Users in institute organizations with roles
- `global_organization_users` - Users in global organizations with roles
- `lectures` - Lecture content (public/private)
- `lecture_enrollments` - User lecture enrollments

## API Endpoints

### Authentication
- `POST /api/organizations/institute/login` - Login to institute organization
- `POST /api/organizations/global/login` - Login to global organization

### Institute Organizations
- `POST /api/organizations/institute` - Create institute organization
- `POST /api/organizations/institute/enroll` - Enroll in organization
- `POST /api/organizations/institute/:orgId/assign` - Assign user directly (President/VP only)
- `POST /api/organizations/institute/users/:userId/verify` - Verify user enrollment

### Global Organizations
- `POST /api/organizations/global` - Create global organization
- `POST /api/organizations/global/enroll` - Enroll in organization
- `POST /api/organizations/global/users/:userId/verify` - Verify user enrollment

### Lectures
- `POST /api/organizations/lectures` - Create lecture
- `GET /api/organizations/lectures/public` - Get public lectures
- `GET /api/organizations/institute/:orgId/lectures` - Get institute org lectures
- `GET /api/organizations/global/:orgId/lectures` - Get global org lectures
- `POST /api/organizations/lectures/:lectureId/enroll` - Enroll in lecture

### Sync (from Main LMS)
- `POST /api/sync/users` - Sync users from main LMS
- `POST /api/sync/institutes` - Sync institutes from main LMS
- `POST /api/sync/all` - Sync both users and institutes

### User Data
- `GET /api/organizations/my-organizations` - Get user's organizations

## Environment Variables

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/organization_service"

# JWT
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="24h"

# Main LMS API (for syncing)
MAIN_LMS_API_URL="http://localhost:3001"
MAIN_LMS_API_KEY="your-main-lms-api-key"

# Server
PORT=3000
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   - Create MySQL database
   - Update DATABASE_URL in .env file
   - Run Prisma migrations:
     ```bash
     npx prisma migrate dev --name init
     ```

3. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

4. **Start Development Server**
   ```bash
   npm run start:dev
   ```

## Usage Flow

### Organization Setup
1. Main LMS admin creates institute organizations
2. Organization gets unique enrollment key
3. Users from main LMS can enroll using enrollment key + separate password

### User Enrollment
1. User logs into main LMS
2. Navigates to organization section
3. Enters enrollment key and sets organization password
4. If verification required, admin approves enrollment
5. User can then login to organization with separate credentials

### Direct Assignment (Higher Roles)
- Presidents and Vice Presidents can assign users directly
- Bypasses enrollment key requirement
- Still requires separate password for organization access

### Lecture Access
- **Public Lectures**: Accessible without enrollment
- **Private Lectures**: Only for organization members
- **Enrollment Tracking**: System tracks who accessed what

### Token System
- Organization login issues JWT token
- Token includes main LMS institute IDs
- Allows cross-service authentication

## Role Hierarchy

### Institute Organizations
- `PRESIDENT` - Full admin access
- `VICE_PRESIDENT` - Can assign users, manage content
- `SECRETARY` - Manage content and members
- `TREASURER` - Financial management
- `MODERATOR` - Content moderation
- `MEMBER` - Basic access

### Global Organizations
- `ADMIN` - Super admin access
- `PRESIDENT` - Full admin access
- `VICE_PRESIDENT` - Can assign users, manage content
- `SECRETARY` - Manage content and members
- `TREASURER` - Financial management
- `MODERATOR` - Content moderation
- `MEMBER` - Basic access

## Security Features

- Separate password system for each organization
- Role-based access control
- JWT token authentication
- Input validation and sanitization
- CORS enabled for cross-origin requests
