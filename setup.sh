#!/bin/bash

# Organization Service Setup Script

echo "🚀 Setting up Organization Service for Learning Management System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if MySQL is available
echo "🔍 Checking MySQL connection..."
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL client not found. Please ensure MySQL is installed and running."
    echo "   You can also use Docker: docker run --name mysql-org -e MYSQL_ROOT_PASSWORD=password -d -p 3306:3306 mysql:8.0"
fi

# Create .env.example file
echo "📄 Creating .env.example file..."
cat > .env.example << EOL
# Database - Update with your MySQL credentials
DATABASE_URL="mysql://username:password@localhost:3306/organization_service"

# JWT - Change these in production
JWT_SECRET="your-secret-key-here-change-this-in-production"
JWT_EXPIRES_IN="24h"

# Main LMS API (for syncing users and institutes)
MAIN_LMS_API_URL="http://localhost:3001"
MAIN_LMS_API_KEY="your-main-lms-api-key"

# Server
PORT=3000
EOL

# Check if .env exists
if [ ! -f .env ]; then
    echo "📋 Copying .env.example to .env..."
    cp .env.example .env
    echo "⚠️  Please update the DATABASE_URL and other settings in .env file"
else
    echo "✅ .env file already exists"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update your .env file with correct database credentials"
echo "2. Create MySQL database: CREATE DATABASE organization_service;"
echo "3. Run migrations: npm run prisma:migrate"
echo "4. Start development server: npm run start:dev"
echo ""
echo "📚 API Documentation: See API_DOCUMENTATION.md"
echo "🌐 Server will run on: http://localhost:3000"
echo ""
echo "🔧 Available commands:"
echo "  npm run start:dev       - Start development server"
echo "  npm run prisma:migrate  - Run database migrations"
echo "  npm run prisma:studio   - Open Prisma Studio"
echo "  npm run prisma:generate - Generate Prisma client"
echo "  npm run test            - Run tests"
echo ""
