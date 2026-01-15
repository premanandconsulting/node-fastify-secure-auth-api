# Documentation Index

Welcome to the Node Fastify Secure Auth API documentation. This index will guide you through all available resources.

---

## Quick Start

### For First-Time Users
1. Read [SETUP_AND_DEPLOYMENT.md](./SETUP_AND_DEPLOYMENT.md) to get the API running locally
2. Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for endpoint usage
3. Review [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the codebase structure

### For Developers
1. Start with [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the project structure
2. Review [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for endpoint details
3. Check [SETUP_AND_DEPLOYMENT.md](./SETUP_AND_DEPLOYMENT.md) for deployment guidance

---

## Documentation Files

### 1. **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**
   - **Purpose:** Complete API reference guide
   - **Contents:**
     - Base URL and authentication details
     - All endpoint specifications (login, refresh, logout, me, health)
     - Request/response examples
     - Error handling and status codes
     - cURL examples for testing
     - Token structure documentation
   - **Audience:** API consumers, frontend developers, QA testers

### 2. **[ARCHITECTURE.md](./ARCHITECTURE.md)**
   - **Purpose:** Technical architecture and design patterns
   - **Contents:**
     - System architecture layers
     - Directory structure
     - Data flow diagrams
     - Key components overview
     - Security features
     - Token management strategy
     - Scalability considerations
     - Type definitions
     - Performance considerations
   - **Audience:** Backend developers, architects, code reviewers

### 3. **[SETUP_AND_DEPLOYMENT.md](./SETUP_AND_DEPLOYMENT.md)**
   - **Purpose:** Installation, configuration, and deployment guide
   - **Contents:**
     - Prerequisites and requirements
     - Local development setup
     - Environment configuration
     - Running the application
     - Testing procedures
     - Deployment instructions
     - Production configuration
     - Troubleshooting guide
   - **Audience:** DevOps engineers, developers, system administrators

---

## Project Overview

**Node Fastify Secure Auth API** is a production-ready authentication service built with:
- **Framework:** Fastify (Node.js)
- **Language:** TypeScript
- **Authentication:** JWT (JSON Web Tokens)
- **Package Manager:** pnpm

### Key Features
✅ JWT-based authentication with access & refresh tokens  
✅ Secure password validation  
✅ Token refresh mechanism  
✅ User session management  
✅ Health check endpoint  
✅ CORS support  
✅ TypeScript for type safety  
✅ Clean architecture patterns  

---

## Common Tasks

### I want to...

#### ...use the API
→ Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- Start with the login endpoint
- See the token structure
- Review error responses

#### ...set up the project locally
→ Read [SETUP_AND_DEPLOYMENT.md](./SETUP_AND_DEPLOYMENT.md)
- Follow the Prerequisites section
- Run the Local Development Setup
- Test with provided examples

#### ...understand the codebase
→ Read [ARCHITECTURE.md](./ARCHITECTURE.md)
- Review the Architecture Layers
- Check the Directory Structure
- Study the Data Flow diagrams

#### ...deploy to production
→ Read [SETUP_AND_DEPLOYMENT.md](./SETUP_AND_DEPLOYMENT.md)
- Review Production Configuration
- Follow Deployment instructions
- Check Environment Variables section

#### ...test an endpoint
→ Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- Check the Examples section
- Use provided cURL commands
- Review Request/Response format

#### ...fix an issue
→ Read [SETUP_AND_DEPLOYMENT.md](./SETUP_AND_DEPLOYMENT.md)
- Check the Troubleshooting Guide
- Review Environment Configuration
- Verify Prerequisites

---

## Authentication Flow

### Standard Login Flow
```
1. User sends credentials (username + password) to POST /auth/login
2. Server validates credentials
3. Server generates Access Token (1 hour expiration)
4. Server generates Refresh Token (7 days expiration)
5. Server returns both tokens to client
6. Client stores tokens securely
7. Client uses Access Token for subsequent requests
```

### Token Refresh Flow
```
1. Client detects Access Token will expire
2. Client sends Refresh Token to POST /auth/refresh
3. Server validates Refresh Token
4. Server generates new Access Token
5. Server returns new Access Token (and optionally new Refresh Token)
6. Client updates stored token
7. Client continues making requests with new token
```

### Logout Flow
```
1. User initiates logout
2. Client sends Refresh Token to POST /auth/logout
3. Server invalidates the Refresh Token
4. Server returns success message
5. Client clears stored tokens
6. Client redirects to login page
```

---

## Technology Stack

### Backend
- **Framework:** Fastify v5.6.2
- **Language:** TypeScript v5.9.3
- **Runtime:** Node.js (v18+)
- **Authentication:** @fastify/jwt v10.0.0

### Package Management
- **Package Manager:** pnpm v10.27.0
- **Monorepo:** No (single package)

### Development Tools
- **Linting:** ESLint v9.39.2
- **Formatting:** Prettier v3.7.4
- **Type Checking:** TypeScript v5.9.3
- **Development Server:** ts-node-dev v2.0.0

### Build & Deployment
- **Build Tool:** TypeScript Compiler
- **Build Output:** dist/ folder
- **Entry Point:** dist/server.js

---

## API Endpoints Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/v1/auth/login` | No | Authenticate user |
| POST | `/api/v1/auth/refresh` | No | Refresh access token |
| GET | `/api/v1/auth/me` | Yes | Get current user info |
| POST | `/api/v1/auth/logout` | Yes | Logout user |
| GET | `/api/v1/health` | No | Health check |

---

## Development Commands

```bash
# Install dependencies
pnpm install

# Development mode (hot reload)
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm start

# Run linter
pnpm run lint

# Format code
pnpm run format
```

---

## File Organization

### Source Code (`src/`)
- `app.ts` - Fastify app configuration
- `server.ts` - Server startup
- `config/` - Configuration files
- `modules/` - Feature modules (auth)
- `plugins/` - Fastify plugins
- `routes/` - Route handlers

### Documentation (`docs/`)
- `API_DOCUMENTATION.md` - API reference
- `ARCHITECTURE.md` - System design
- `SETUP_AND_DEPLOYMENT.md` - Installation guide
- `DOCUMENTATION_INDEX.md` - This file

### Configuration Files
- `package.json` - Project metadata
- `tsconfig.json` - TypeScript configuration
- `eslint.config.mjs` - ESLint configuration

---

## Important Notes

⚠️ **Security Notes:**
- Never commit `.env` files with secrets
- Always use HTTPS in production
- Rotate JWT secrets regularly
- Implement rate limiting in production
- Store refresh tokens securely (HTTP-only cookies)
- Never log sensitive data (passwords, tokens)

📝 **Development Notes:**
- Token store is in-memory (replace with DB for production)
- Uses demo credentials (admin/Admin@123)
- CORS accepts all origins (restrict in production)

---

## Support & Contributing

### Getting Help
1. Check the [Troubleshooting Guide](./SETUP_AND_DEPLOYMENT.md#troubleshooting)
2. Review error messages in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md#error-handling)
3. Check source code in corresponding modules

### Reporting Issues
- Include error message and steps to reproduce
- Provide environment details (Node version, OS)
- Attach relevant logs

### Contributing
- Follow TypeScript best practices
- Maintain clean architecture patterns
- Add tests for new features
- Update documentation accordingly

---

## Document Versions

| Document | Version | Updated |
|----------|---------|---------|
| API_DOCUMENTATION.md | 1.0.0 | January 2026 |
| ARCHITECTURE.md | 1.0.0 | January 2026 |
| SETUP_AND_DEPLOYMENT.md | 1.0.0 | January 2026 |
| DOCUMENTATION_INDEX.md | 1.0.0 | January 2026 |

---

## License

This project is licensed under the MIT License. See the [LICENSE](../LICENSE) file for details.

---

## Contact & Information

- **Author:** Premanand
- **Project:** node-fastify-secure-auth-api
- **Repository:** [GitHub](https://github.com)
- **Version:** 1.0.0

---

**Last Updated:** January 15, 2026
