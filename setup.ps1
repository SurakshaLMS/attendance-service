# Organization Service Setup Script for Windows

Write-Host "🚀 Setting up Organization Service for Learning Management System..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
    
    # Extract major version number
    $majorVersion = ($nodeVersion -replace 'v','').Split('.')[0]
    if ([int]$majorVersion -lt 18) {
        Write-Host "❌ Node.js version 18 or higher is required. Current version: $nodeVersion" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18 or higher." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Check if MySQL is available
Write-Host "🔍 Checking for MySQL..." -ForegroundColor Yellow
try {
    mysql --version | Out-Null
    Write-Host "✅ MySQL client found" -ForegroundColor Green
} catch {
    Write-Host "⚠️  MySQL client not found. Please ensure MySQL is installed and running." -ForegroundColor Yellow
    Write-Host "   You can also use Docker: docker run --name mysql-org -e MYSQL_ROOT_PASSWORD=password -d -p 3306:3306 mysql:8.0" -ForegroundColor Cyan
}

# Create .env.example file
Write-Host "📄 Creating .env.example file..." -ForegroundColor Yellow
$envExample = @"
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
"@

Set-Content -Path ".env.example" -Value $envExample

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "📋 Copying .env.example to .env..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  Please update the DATABASE_URL and other settings in .env file" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Update your .env file with correct database credentials"
Write-Host "2. Create MySQL database: CREATE DATABASE organization_service;"
Write-Host "3. Run migrations: npm run prisma:migrate"
Write-Host "4. Start development server: npm run start:dev"
Write-Host ""
Write-Host "📚 API Documentation: See API_DOCUMENTATION.md" -ForegroundColor Cyan
Write-Host "🌐 Server will run on: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔧 Available commands:" -ForegroundColor Cyan
Write-Host "  npm run start:dev       - Start development server"
Write-Host "  npm run prisma:migrate  - Run database migrations"
Write-Host "  npm run prisma:studio   - Open Prisma Studio"
Write-Host "  npm run prisma:generate - Generate Prisma client"
Write-Host "  npm run test            - Run tests"
Write-Host ""
