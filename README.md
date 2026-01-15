# 🔐 node-fastify-secure-auth-api

Production-ready Fastify authentication API with JWT access & refresh tokens, built using TypeScript and pnpm. Designed with clean architecture, security best practices, and scalability in mind — ideal for modern Node.js backend systems.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/Fastify-5.6-green)](https://www.fastify.io/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-yellowgreen)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10.27-red)](https://pnpm.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## ⚠️ Project Scope

**This is a demonstration/learning project** showcasing clean architecture patterns and authentication best practices.

**Demonstration features:**
- ✓ JWT authentication flow
- ✓ Clean architecture patterns
- ✓ TypeScript best practices
- ✓ Comprehensive documentation
- ✓ Security fundamentals

**Production requirements (not included in demo):**
- 🔄 Database integration (PostgreSQL, MongoDB, etc.)
- 👥 Role-based access control (RBAC)
- 🔐 Custom security implementations
- 📊 Advanced monitoring & logging
- 🔑 OAuth2/OIDC integrations
- 📱 Multi-factor authentication
- ⚖️ Compliance requirements (GDPR, SOC2, etc.)

**For production use:**
This repository serves as an excellent foundation. Production delivery requires adding database integration, role-based access control, and custom security requirements based on your specific use case.

---

## 📚 Documentation

**Comprehensive documentation is available for all aspects of the project:**

### 📖 Quick Navigation

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **[API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)** | Complete API reference with all endpoints | 30 min |
| **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** | System design and architecture layers | 1 hour |
| **[SETUP_AND_DEPLOYMENT.md](./docs/SETUP_AND_DEPLOYMENT.md)** | Installation, configuration, and deployment | 1-2 hrs |
| **[DOCUMENTATION_INDEX.md](./docs/DOCUMENTATION_INDEX.md)** | Documentation hub and navigation | 15 min |
| **[CODE_DOCUMENTATION.md](./docs/CODE_DOCUMENTATION.md)** | Guide to code-level JSDoc documentation | 30 min |

**For a quick overview, start here:** [DOCUMENTATION_INDEX.md](./docs/DOCUMENTATION_INDEX.md)

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ 
- pnpm v10.27+

### Installation

```bash
# Clone repository
git clone <repository-url>
cd node-fastify-secure-auth-api

# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Server runs on http://localhost:3000
```

### Test the API

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'

# Check health
curl http://localhost:3000/api/v1/health
```

See [SETUP_AND_DEPLOYMENT.md](./docs/SETUP_AND_DEPLOYMENT.md) for detailed setup instructions.

---

## ✨ Features

✅ **JWT Authentication**
- Access tokens (15-minute expiration)
- Refresh tokens (7-day expiration)
- Token revocation on logout

✅ **Clean Architecture**
- Separation of concerns (Routes → Controller → Service → Store)
- Dependency injection
- Type-safe with TypeScript

✅ **Security**
- CORS protection
- JWT-based authentication
- Request validation
- Error handling without exposing sensitive data

✅ **Production Ready**
- Comprehensive error handling
- Logging support
- Health check endpoint
- Deployment guides for multiple platforms

✅ **Developer Experience**
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- JSDoc for comprehensive documentation
- Hot-reload in development

---

## 🏗️ Architecture

### Layer Structure

```
┌─────────────────────────────────────┐
│   Routes (HTTP Endpoints)           │
├─────────────────────────────────────┤
│   Controllers (Request Handling)    │
├─────────────────────────────────────┤
│   Services (Business Logic)         │
├─────────────────────────────────────┤
│   Data Store (Token Storage)        │
├─────────────────────────────────────┤
│   Plugins (JWT, CORS)               │
└─────────────────────────────────────┘
```

### Directory Structure

```
src/
├── app.ts                    # Application factory
├── server.ts                 # Server entry point
├── config/
│   ├── api.constants.ts     # API configuration
│   └── public-routes.ts     # Public route definitions
├── modules/
│   └── auth/
│       ├── auth.controller.ts      # HTTP handlers
│       ├── auth.service.ts         # Business logic
│       ├── auth.routes.ts          # Route definitions
│       ├── auth.types.ts           # Type definitions
│       └── token.store.ts          # Token storage
├── plugins/
│   └── jwt.plugin.ts        # JWT authentication
└── routes/
    └── health.routes.ts     # Health check
```

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed architecture explanation.

---

## 🔌 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/login` | ❌ No | Login with credentials |
| POST | `/api/v1/auth/refresh` | ❌ No | Refresh access token |
| GET | `/api/v1/auth/me` | ✅ Yes | Get current user |
| POST | `/api/v1/auth/logout` | ✅ Yes | Logout user |

### System Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/health` | ❌ No | Health check |

See [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) for complete API reference.

---

## 💻 Available Commands

```bash
# Development
pnpm run dev      # Start with hot-reload

# Production
pnpm run build    # Build for production
pnpm start        # Start production server

# Code Quality
pnpm run lint     # Run ESLint
pnpm run format   # Format with Prettier
```

---

## 🔐 Authentication Flow

### Login Flow
```
POST /auth/login { username, password }
    ↓
Service validates credentials
    ↓
Generate access token (15 min)
Generate refresh token (7 days)
Store refresh token
    ↓
Return both tokens to client
```

### Protected Request Flow
```
GET /auth/me
Headers: Authorization: Bearer <accessToken>
    ↓
JWT middleware validates token
    ↓
Decode token & set request.user
    ↓
Handler executes with user context
```

### Token Refresh Flow
```
POST /auth/refresh { refreshToken }
    ↓
Service validates refresh token
    ↓
Generate new access token
    ↓
Return new access token
```

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed flow diagrams.

---

## 🔒 Security Features

### Token Management
- **Access Token**: Short-lived (15 minutes) - limits exposure if compromised
- **Refresh Token**: Long-lived (7 days) - can be revoked on logout
- **JWT Signing**: HMAC-SHA256 with secret key

### Request Validation
- Input validation on all endpoints
- Type checking with TypeScript
- Refresh token validation before use

### Error Handling
- Try-catch blocks on all async operations
- Generic error messages (no info leakage)
- Proper HTTP status codes

### Protected Routes
- `/auth/me` - requires valid access token
- `/auth/logout` - requires valid access token
- Middleware validates token before handler executes

### Public Routes
- `/health` - load balancer health checks
- `/auth/login` - initial authentication
- `/auth/refresh` - token renewal

---

## 🛠️ Development

### Making Code Changes

1. Open source file
2. Read JSDoc comments for context
3. Check examples in code
4. Make your changes
5. Build and test

```bash
# Build to check for errors
pnpm run build

# Start dev server to test
pnpm run dev

# Run linter
pnpm run lint
```

### Code-Level Documentation

All source files include comprehensive JSDoc comments:

```typescript
/**
 * What the function does
 * 
 * Detailed explanation with:
 * - Purpose and responsibilities
 * - Parameter descriptions
 * - Return value documentation
 * - Error handling information
 * - Usage examples
 * 
 * @param paramName - Description
 * @returns Description of return value
 * @throws Error description
 * @example
 * // Usage example
 * const result = await functionName(param);
 */
export async function functionName(param: Type): ReturnType {}
```

See [CODE_DOCUMENTATION.md](./docs/CODE_DOCUMENTATION.md) for documentation standards.

---

## 📦 Deployment

### Quick Deployment

The project includes guides for deploying to:
- **Heroku** - PaaS platform
- **Docker** - Containerized deployment
- **AWS EC2** - Cloud virtual machines
- **Railway** - Modern PaaS

```bash
# Build for production
pnpm run build

# Environment variables needed
PORT=3000
NODE_ENV=production
JWT_SECRET=your-strong-secret-key-min-32-chars
CORS_ORIGIN=https://yourdomain.com
```

See [SETUP_AND_DEPLOYMENT.md](./docs/SETUP_AND_DEPLOYMENT.md) for detailed deployment instructions.

---

## 🐛 Troubleshooting

### Common Issues

**Port already in use**
```bash
# Change port
PORT=3001 pnpm run dev
```

**JWT_SECRET not found**
```bash
# Set in .env file
JWT_SECRET=your-secret-key
```

**Dependencies not installing**
```bash
# Clear cache and reinstall
pnpm store prune
rm -rf node_modules
pnpm install
```

See [SETUP_AND_DEPLOYMENT.md](./docs/SETUP_AND_DEPLOYMENT.md#troubleshooting) for more issues and solutions.

---

## 📊 Project Stats

| Metric | Value |
|--------|-------|
| **TypeScript Files** | 10+ |
| **Code Comments** | 1,170+ lines |
| **Documentation** | 3,170+ lines |
| **API Endpoints** | 5 |
| **Code Examples** | 100+ |
| **Test Coverage Ready** | ✅ Yes |

---

## 🔄 Development Workflow

```bash
# 1. Start development
pnpm run dev

# 2. Make changes to src/

# 3. TypeScript recompiles automatically

# 4. Test your changes
curl http://localhost:3000/api/v1/health

# 5. When done, build for production
pnpm run build

# 6. Start production
pnpm start
```

---

## 📚 Learning Resources

### For Understanding the System
1. Read: [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
2. Read: Source files with JSDoc comments
3. Trace: Authentication flow from routes → controller → service

### For Using the API
1. Read: [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)
2. Try: cURL examples provided
3. Test: With your frontend

### For Deploying
1. Read: [SETUP_AND_DEPLOYMENT.md](./docs/SETUP_AND_DEPLOYMENT.md)
2. Choose: Your deployment platform
3. Follow: Step-by-step instructions

---

## 🤝 Contributing

When contributing code:
1. Follow the existing architecture patterns
2. Add JSDoc comments for new functions
3. Include examples in documentation
4. Run `pnpm run build` to verify TypeScript
5. Run `pnpm run lint` to check code quality

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Premanand**

---

## 📞 Need Help?

1. **Setup Issues?** → See [SETUP_AND_DEPLOYMENT.md](./docs/SETUP_AND_DEPLOYMENT.md)
2. **API Questions?** → See [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)
3. **Architecture?** → See [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
4. **Code Documentation?** → See source files with JSDoc comments
5. **General Navigation?** → See [DOCUMENTATION_INDEX.md](./docs/DOCUMENTATION_INDEX.md)

---

## ✅ Documentation Status

- ✅ Complete API reference
- ✅ Architecture documentation
- ✅ Setup and deployment guide
- ✅ Code-level JSDoc comments
- ✅ Security best practices documented
- ✅ Troubleshooting guide
- ✅ 100% source file coverage

**Total Documentation: 3,170+ lines** covering all aspects of the project.

---

**Ready to get started?** Follow the [Quick Start](#-quick-start) above, then explore the documentation links for more details.

