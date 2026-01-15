# Setup and Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Environment Configuration](#environment-configuration)
4. [Running the Application](#running-the-application)
5. [Testing](#testing)
6. [Building for Production](#building-for-production)
7. [Deployment](#deployment)
8. [Production Configuration](#production-configuration)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements
- **Operating System:** Windows, macOS, or Linux
- **Node.js:** v18.x or higher
- **Package Manager:** pnpm v10.27.0 (recommended) or npm v9+
- **RAM:** Minimum 512MB (1GB recommended)
- **Disk Space:** Minimum 500MB

### Required Software
```bash
# Check Node.js version
node --version
# Should output v18.0.0 or higher

# Check npm version
npm --version
# Should output v9.0.0 or higher

# Install pnpm globally
npm install -g pnpm@10.27.0

# Verify pnpm installation
pnpm --version
# Should output 10.27.0
```

### Knowledge Requirements
- Basic understanding of Node.js and Express/Fastify
- Familiarity with TypeScript
- Understanding of JWT and authentication concepts
- Basic command-line/terminal usage

---

## Local Development Setup

### Step 1: Clone the Repository

```bash
# Clone the project
git clone <repository-url>
cd node-fastify-secure-auth-api
```

### Step 2: Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# OR using npm
npm install

# OR using yarn
yarn install
```

The installation will install the following:
- **fastify** - Web framework
- **@fastify/jwt** - JWT authentication
- **@fastify/cors** - CORS middleware
- **typescript** - Type checking
- **ts-node-dev** - Development server

### Step 3: Verify Installation

```bash
# Check if all dependencies are installed
pnpm list

# Verify TypeScript installation
pnpm run build --version
```

### Step 4: Create Environment Configuration

Create a `.env` file in the root directory:

```bash
# For Windows PowerShell
New-Item -Path ".\.env" -ItemType File

# For Linux/macOS
touch .env
```

**Edit `.env` file with the following content:**

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345

# API Configuration
API_PREFIX=/api/v1

# CORS Configuration (development)
CORS_ORIGIN=*
```

⚠️ **Important:** Never commit `.env` file to version control. Add to `.gitignore`:

```
.env
.env.local
.env.*.local
```

---

## Environment Configuration

### Development Environment

Create `.env.development`:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=dev-secret-key-not-for-production
API_PREFIX=/api/v1
CORS_ORIGIN=*
LOG_LEVEL=debug
```

### Production Environment

Create `.env.production`:

```env
PORT=3000
NODE_ENV=production
JWT_SECRET=your-strong-production-secret-key-min-32-chars
API_PREFIX=/api/v1
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
LOG_LEVEL=info
```

### Environment Variables Reference

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `PORT` | number | 3000 | Server port |
| `NODE_ENV` | string | development | Environment (development/production) |
| `JWT_SECRET` | string | required | Secret key for JWT signing |
| `API_PREFIX` | string | /api/v1 | API version prefix |
| `CORS_ORIGIN` | string | * | Allowed CORS origins |
| `LOG_LEVEL` | string | info | Logging level |

---

## Running the Application

### Development Mode

```bash
# Start development server with hot reload
pnpm run dev

# Expected output:
# ✓ Server running at http://localhost:3000
# ✓ Ready for connections
```

The server will:
- Start on `http://localhost:3000`
- Watch for file changes and auto-reload
- Display detailed logs

### Production Mode

```bash
# First, build the project
pnpm run build

# Then start the production server
pnpm start

# Expected output:
# ✓ Server running at http://localhost:3000
# ✓ Ready for connections
```

### Accessing the API

Once the server is running:

```bash
# Test health endpoint
curl http://localhost:3000/api/v1/health

# Expected response:
# {"status":"ok"}
```

---

## Testing

### Test Login Endpoint

```bash
# Using cURL (Windows PowerShell)
$body = @{
    username = "admin"
    password = "Admin@123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/v1/auth/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

# OR using bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'
```

**Expected Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer"
}
```

### Test Protected Endpoint

```bash
# Save the access token from login response
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Test /me endpoint
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer $token"
```

### Test Refresh Token

```bash
$refreshToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$refreshToken\"}"
```

### Manual Testing with Postman

1. Open Postman
2. Create collection "Fastify Auth API"
3. Create requests:

**Login Request:**
- Method: POST
- URL: `http://localhost:3000/api/v1/auth/login`
- Headers: `Content-Type: application/json`
- Body:
  ```json
  {
    "username": "admin",
    "password": "Admin@123"
  }
  ```

**Get User Request:**
- Method: GET
- URL: `http://localhost:3000/api/v1/auth/me`
- Headers:
  - `Authorization: Bearer <access_token>`
  - `Content-Type: application/json`

---

## Building for Production

### Build TypeScript

```bash
# Compile TypeScript to JavaScript
pnpm run build

# Output directory: dist/
# Check build output
ls -la dist/

# Expected files:
# - dist/server.js
# - dist/app.js
# - dist/config/
# - dist/modules/
# - dist/plugins/
# - dist/routes/
```

### Verify Build

```bash
# Check if main entry point exists
ls -la dist/server.js

# Check TypeScript syntax
pnpm run build --noEmit
```

### Clean Build

```bash
# Remove previous build
rm -r dist/

# Rebuild from scratch
pnpm run build
```

---

## Deployment

### Deployment Platforms

#### 1. **Heroku Deployment**

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create new app
heroku create your-app-name

# Set environment variables
heroku config:set JWT_SECRET="your-production-secret" -a your-app-name
heroku config:set NODE_ENV="production" -a your-app-name

# Deploy
git push heroku main

# View logs
heroku logs --tail -a your-app-name
```

#### 2. **Docker Deployment**

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm@10.27.0

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build application
RUN pnpm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["pnpm", "start"]
```

Build and run Docker image:

```bash
# Build image
docker build -t fastify-auth-api:1.0.0 .

# Run container
docker run -p 3000:3000 \
  -e JWT_SECRET="your-secret" \
  -e NODE_ENV="production" \
  fastify-auth-api:1.0.0
```

#### 3. **AWS EC2 Deployment**

```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Update system
sudo yum update -y

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install pnpm
npm install -g pnpm@10.27.0

# Clone repository
git clone <repository-url>
cd node-fastify-secure-auth-api

# Install dependencies
pnpm install

# Create .env file with production variables
sudo nano .env

# Build application
pnpm run build

# Install PM2 for process management
npm install -g pm2

# Start application with PM2
pm2 start dist/server.js --name "fastify-auth-api"

# Save PM2 config
pm2 save
pm2 startup
```

#### 4. **Railway Deployment**

```bash
# Login to Railway
railway login

# Initialize project
railway init

# Set environment variables
railway variables set JWT_SECRET="your-secret"
railway variables set NODE_ENV="production"

# Deploy
railway up
```

### Environment Setup on Production

1. Set all required environment variables
2. Use strong JWT secret (minimum 32 characters)
3. Restrict CORS origins to your domain
4. Use HTTPS only
5. Enable logging and monitoring
6. Set up SSL/TLS certificates

---

## Production Configuration

### Security Checklist

- [ ] Change JWT_SECRET to a strong, random value (32+ characters)
- [ ] Set NODE_ENV=production
- [ ] Restrict CORS_ORIGIN to your domain only
- [ ] Use HTTPS/SSL certificates
- [ ] Implement rate limiting
- [ ] Set up monitoring and alerts
- [ ] Configure backup strategy
- [ ] Enable request logging
- [ ] Implement firewall rules
- [ ] Set up DDoS protection

### Performance Optimization

```env
# Production .env
PORT=3000
NODE_ENV=production
JWT_SECRET=your-strong-production-secret-min-32-chars
API_PREFIX=/api/v1
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=error
```

### Monitoring Setup

Monitor these metrics:
- Server uptime
- Response times
- Error rates
- Memory usage
- CPU usage
- Failed login attempts

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Port Already in Use

**Error:** `listen EADDRINUSE: address already in use :::3000`

**Solution:**

```bash
# Find process using port 3000
lsof -i :3000        # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>         # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port
PORT=3001 pnpm run dev
```

#### 2. Dependencies Not Installing

**Error:** `npm ERR! code ERESOLVE`

**Solution:**

```bash
# Clear npm cache
pnpm store prune

# Delete node_modules
rm -rf node_modules

# Reinstall
pnpm install
```

#### 3. JWT_SECRET Not Found

**Error:** `Error: JWT_SECRET is not defined`

**Solution:**

```bash
# Verify .env file exists in root directory
ls -la | grep .env

# Check content
cat .env | grep JWT_SECRET

# Ensure JWT_SECRET is set
echo "JWT_SECRET=your-secret" > .env
```

#### 4. Build Fails

**Error:** `TypeScript compilation errors`

**Solution:**

```bash
# Check TypeScript configuration
cat tsconfig.json

# Clear dist folder
rm -rf dist/

# Rebuild
pnpm run build

# Check errors
pnpm run build 2>&1 | head -50
```

#### 5. Server Crashes on Startup

**Error:** `Cannot find module`

**Solution:**

```bash
# Verify all dependencies installed
pnpm list

# Check if dist folder exists
ls -la dist/

# Rebuild application
pnpm run build

# Start with logging
DEBUG=* pnpm start
```

#### 6. CORS Issues

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**

```env
# Update .env with correct CORS_ORIGIN
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

Restart the server after changing environment variables.

#### 7. Token Validation Fails

**Error:** `401 Unauthorized`

**Solution:**

- Verify token format: `Bearer <token>`
- Check token expiration
- Verify JWT_SECRET matches between token generation and verification
- Test with fresh token from login

### Debug Mode

```bash
# Enable detailed logging
DEBUG=fastify:* pnpm run dev

# With specific module
DEBUG=fastify:auth pnpm run dev

# All debug output
DEBUG=* pnpm run dev
```

### Check Logs

```bash
# View application logs
tail -f logs/app.log

# Search for errors
grep "ERROR" logs/app.log

# Real-time monitoring
watch -n 1 tail logs/app.log
```

---

## Health Checks

### Endpoint Health

```bash
# Check if server is running
curl -f http://localhost:3000/api/v1/health

# With verbose output
curl -v http://localhost:3000/api/v1/health
```

### Application Health

```bash
# Check Node process
ps aux | grep node

# Check port
lsof -i :3000

# Check logs
pm2 logs fastify-auth-api
```

---

## Maintenance

### Regular Tasks

- [ ] Monitor disk space
- [ ] Check for security updates
- [ ] Review logs for errors
- [ ] Rotate JWT secrets periodically
- [ ] Update dependencies
- [ ] Backup database (when implemented)

### Update Dependencies

```bash
# Check for updates
pnpm outdated

# Update all dependencies
pnpm update

# Update specific package
pnpm update fastify
```

### Clean Up

```bash
# Remove unused dependencies
pnpm prune

# Clear cache
pnpm store prune

# Remove build artifacts
rm -rf dist/
```

---

## Support

For issues or questions:

1. Check this troubleshooting guide
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md)
3. Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
4. Review application logs
5. Contact project maintainer

---

**Last Updated:** January 15, 2026
