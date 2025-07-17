# Organization Service - Learning Management System

A microservice for managing organizations, lectures, and user enrollments in a Learning Management System. Built with NestJS, Prisma, MySQL, and TypeScript.

## 🚀 Features

- **Dual Organization Types**
  - Institute Organizations (tied to specific institutes)
  - Global Organizations (cross-institute)

- **Separate Authentication System**
  - Independent password system for each organization
  - JWT token authentication
  - Role-based access control

- **User Roles & Permissions**
  - Institute Orgs: President, Vice President, Secretary, Treasurer, Member, Moderator
  - Global Orgs: Admin, President, Vice President, Secretary, Treasurer, Member, Moderator

- **Lecture Management**
  - Public lectures (accessible to all)
  - Private lectures (members only)
  - Enrollment tracking and analytics

- **Enrollment System**
  - Unique enrollment keys per organization
  - Optional verification workflow
  - Direct assignment by higher roles

- **Sync Integration**
  - Automatic user/institute sync from main LMS
  - Real-time data consistency

## 🏗️ Architecture

```
Main LMS ←→ Organization Service
    ↓              ↓
   Users        Organizations
   Institutes   ↓
                Lectures
                Enrollments
```

## 📋 Prerequisites

- Node.js 18 or higher
- MySQL 8.0 or higher
- npm or yarn package manager

## ⚡ Quick Start

### Option 1: Automated Setup (Recommended)

**Windows (PowerShell):**
```powershell
.\setup.ps1
```

**Linux/macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd organization_service
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Database Setup**
   ```sql
   CREATE DATABASE organization_service;
   ```

4. **Run Migrations**
   ```bash
   npm run prisma:migrate
   ```

5. **Generate Prisma Client**
   ```bash
   npm run prisma:generate
   ```

6. **Seed Database (Optional)**
   ```bash
   npm run db:seed
   ```

7. **Start Development Server**
   ```bash
   npm run start:dev
   ```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start development server with hot reload |
| `npm run start:prod` | Start production server |
| `npm run build` | Build the application |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio (database GUI) |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run db:seed` | Seed database with sample data |

## 🌐 API Endpoints

### Authentication
- `POST /api/organizations/institute/login` - Login to institute organization
- `POST /api/organizations/global/login` - Login to global organization

### Institute Organizations
- `POST /api/organizations/institute` - Create organization
- `POST /api/organizations/institute/enroll` - Enroll in organization
- `POST /api/organizations/institute/:orgId/assign` - Assign user directly
- `POST /api/organizations/institute/users/:userId/verify` - Verify enrollment

### Global Organizations  
- `POST /api/organizations/global` - Create organization
- `POST /api/organizations/global/enroll` - Enroll in organization
- `POST /api/organizations/global/users/:userId/verify` - Verify enrollment

### Lectures
- `POST /api/organizations/lectures` - Create lecture
- `GET /api/organizations/lectures/public` - Get public lectures
- `GET /api/organizations/institute/:orgId/lectures` - Get org lectures
- `POST /api/organizations/lectures/:lectureId/enroll` - Enroll in lecture

### Data Sync
- `POST /api/sync/users` - Sync users from main LMS
- `POST /api/sync/institutes` - Sync institutes from main LMS
- `POST /api/sync/all` - Sync all data

### User Data
- `GET /api/organizations/my-organizations` - Get user's organizations

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API documentation.

## 🗄️ Database Schema

### Core Tables
- **users** - Synced from main LMS
- **institutes** - Synced from main LMS  
- **institute_organizations** - Organizations within institutes
- **global_organizations** - Cross-institute organizations
- **institute_organization_users** - Institute org memberships
- **global_organization_users** - Global org memberships
- **lectures** - Lecture content
- **lecture_enrollments** - User lecture access

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/organization_service"

# JWT Authentication
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="24h"

# Main LMS Integration
MAIN_LMS_API_URL="http://localhost:3001"
MAIN_LMS_API_KEY="your-main-lms-api-key"

# Server
PORT=3000
```

## 🔐 Security Features

- **Separate Authentication**: Each organization has independent password system
- **JWT Tokens**: Secure token-based authentication
- **Role-based Access**: Granular permission system
- **Input Validation**: Comprehensive data validation
- **CORS Protection**: Cross-origin request security

## 🧪 Testing

### Sample Data
After running the seed script, you can test with:

- **Test Users**: 
  - john.doe@example.com (President)
  - jane.smith@example.com (Vice President)
  - bob.wilson@example.com (Member)
- **Password**: `password123`
- **Enrollment Keys**: 
  - Institute: `cs-club-2024`
  - Global: `global-tech-2024`

### API Testing
```bash
# Login to institute organization
curl -X POST http://localhost:3000/api/organizations/institute/login \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "organizationId": 1, "password": "password123"}'

# Get public lectures
curl http://localhost:3000/api/organizations/lectures/public
```

## 🏃‍♂️ Usage Flow

1. **Organization Setup**
   - Admin creates organization with enrollment key
   - Sets verification requirements

2. **User Enrollment**
   - User enters enrollment key + sets organization password
   - Admin approves if verification required

3. **Organization Login**
   - User logs in with separate organization credentials
   - Receives JWT token for API access

4. **Content Access**
   - Access public lectures without enrollment
   - Access private lectures as organization member

## 🤝 Integration with Main LMS

The service integrates with your main LMS through:

1. **User Sync**: Automatic user data synchronization
2. **Institute Sync**: Institute information updates
3. **Token Validation**: Cross-service authentication
4. **API Integration**: RESTful API communication

## 📊 Monitoring & Debugging

- **Prisma Studio**: Database GUI at `npm run prisma:studio`
- **Logs**: Application logs for debugging
- **Health Check**: Server status monitoring
- **Error Handling**: Comprehensive error responses

## 🚀 Deployment

### Production Checklist

- [ ] Update `JWT_SECRET` with secure random string
- [ ] Configure production MySQL database
- [ ] Set up environment variables securely
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS for production domains
- [ ] Set up monitoring and logging
- [ ] Run database migrations
- [ ] Test API endpoints

### Docker Deployment (Optional)

```dockerfile
# Create Dockerfile for containerized deployment
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL server is running
   - Verify DATABASE_URL in .env
   - Ensure database exists

2. **Migration Errors**
   - Reset database: `npm run prisma:reset`
   - Regenerate client: `npm run prisma:generate`

3. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Validate user permissions

## 📝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- Review troubleshooting section above
- Open an issue on GitHub

---

**Built with ❤️ using NestJS, Prisma, and TypeScript**
