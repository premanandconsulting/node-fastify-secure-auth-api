# Architecture Documentation

## Project Overview

Node Fastify Secure Auth API is a production-ready authentication service built with Fastify, TypeScript, and JWT tokens. It follows clean architecture principles with clear separation of concerns.

---

## Architecture Layers

### 1. **Presentation Layer (Routes)**
- **Location:** `src/routes/` and `src/modules/auth/auth.routes.ts`
- **Responsibility:** Define HTTP endpoints and route configuration
- **Key Files:**
  - `health.routes.ts` - Health check endpoint
  - `auth.routes.ts` - Authentication endpoints

### 2. **Controller Layer**
- **Location:** `src/modules/auth/auth.controller.ts`
- **Responsibility:** Handle HTTP requests/responses and validate input
- **Key Methods:**
  - `login()` - Handle login requests
  - `refresh()` - Handle token refresh requests
  - `logout()` - Handle logout requests
  - `me()` - Return current user info

### 3. **Service Layer**
- **Location:** `src/modules/auth/auth.service.ts`
- **Responsibility:** Business logic and token management
- **Key Methods:**
  - `login()` - Authenticate user credentials
  - `refresh()` - Issue new access tokens
  - `logout()` - Invalidate refresh tokens

### 4. **Data Layer**
- **Location:** `src/modules/auth/token.store.ts`
- **Responsibility:** Manage refresh token storage and validation
- **Implementation:** In-memory token store (can be replaced with database)

### 5. **Plugin Layer**
- **Location:** `src/plugins/`
- **Responsibility:** Fastify plugins for cross-cutting concerns
- **Key Plugins:**
  - `jwt.plugin.ts` - JWT authentication middleware
  - `jwt.ts` - JWT configuration and strategy

### 6. **Configuration Layer**
- **Location:** `src/config/`
- **Responsibility:** Environment variables and constants
- **Key Files:**
  - `env.ts` - Environment configuration
  - `api.constants.ts` - API constants

---

## Directory Structure

```
src/
├── app.ts                    # Fastify app setup
├── server.ts                 # Server entry point
├── config/
│   ├── api.constants.ts     # API URL prefix and constants
│   ├── env.ts               # Environment variables
│   └── public-routes.ts     # Public (unauthenticated) routes
├── modules/
│   └── auth/
│       ├── auth.controller.ts      # Request handlers
│       ├── auth.routes.ts          # Route definitions
│       ├── auth.service.ts         # Business logic
│       ├── auth.types.ts           # TypeScript interfaces
│       └── token.store.ts          # Token storage
├── plugins/
│   ├── jwt.plugin.ts        # JWT Fastify plugin registration
│   └── jwt.ts               # JWT strategy implementation
└── routes/
    └── health.routes.ts     # Health check endpoint
```

---

## Data Flow

### Login Flow
```
Client Request (POST /auth/login)
    ↓
Route Handler (auth.routes.ts)
    ↓
Controller (auth.controller.ts)
    ↓
Service (auth.service.ts)
    ↓
Token Generation & Storage
    ↓
Response (accessToken, refreshToken)
```

### Protected Request Flow
```
Client Request (with Authorization header)
    ↓
JWT Middleware (jwt.plugin.ts)
    ↓
Token Validation
    ↓
Request User Assignment
    ↓
Route Handler (auth.routes.ts)
    ↓
Controller (auth.controller.ts)
    ↓
Response
```

### Refresh Token Flow
```
Client Request (POST /auth/refresh)
    ↓
Route Handler (auth.routes.ts)
    ↓
Controller (auth.controller.ts)
    ↓
Validate Refresh Token
    ↓
Service (auth.service.ts)
    ↓
Generate New Access Token
    ↓
Response (new accessToken)
```

---

## Key Components

### JWT Plugin
- **File:** `src/plugins/jwt.plugin.ts`
- **Purpose:** Registers JWT authentication with Fastify
- **Features:**
  - Automatic token validation
  - `app.authenticate` decorator for protected routes
  - Error handling for invalid tokens

### Auth Service
- **File:** `src/modules/auth/auth.service.ts`
- **Responsibilities:**
  - User credential validation
  - Token generation (access & refresh)
  - Token refresh logic
  - Logout handling

### Token Store
- **File:** `src/modules/auth/token.store.ts`
- **Purpose:** Manage refresh token lifecycle
- **Operations:**
  - Store tokens
  - Validate tokens
  - Revoke tokens (logout)
  - Clean up expired tokens

---

## Security Features

### 1. JWT-Based Authentication
- Access tokens with 1-hour expiration
- Refresh tokens with 7-day expiration
- Tokens signed with secret key

### 2. Error Handling
- All endpoints have try-catch blocks
- Consistent error response format
- No sensitive information in error messages

### 3. Request Validation
- Input validation on all endpoints
- Type checking with TypeScript
- Refresh token validation before use

### 4. CORS Protection
- CORS plugin configured
- Configurable origin control
- Prevents unauthorized cross-origin requests

### 5. Protected Routes
- `/me` endpoint requires valid token
- `/logout` endpoint requires valid token
- Authentication middleware on protected routes

---

## Token Management

### Access Token
```
Payload:
{
  "sub": "username",      // Subject (user identifier)
  "iat": 1705334400,     // Issued at
  "exp": 1705338000      // Expiration (1 hour)
}
```

### Refresh Token
```
Payload:
{
  "sub": "username",       // Subject
  "iat": 1705334400,      // Issued at
  "exp": 1705938400       // Expiration (7 days)
}
```

---

## Configuration

### Environment Variables
Located in `src/config/env.ts`

**Required Variables:**
- `JWT_SECRET` - Secret key for signing tokens
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

### API Constants
Located in `src/config/api.constants.ts`

**Constants:**
- `API_PREFIX` - API version prefix (e.g., `/api/v1`)
- Token expiration times
- HTTP headers

---

## Dependencies

### Production Dependencies
- **fastify** - Web framework
- **@fastify/jwt** - JWT authentication
- **@fastify/cors** - CORS support
- **@fastify/env** - Environment variables

### Development Dependencies
- **typescript** - Type checking
- **ts-node-dev** - Development server
- **eslint** - Code linting
- **prettier** - Code formatting

---

## Scalability Considerations

### Current Implementation
- In-memory token store
- Suitable for development and small deployments

### Scaling to Production
1. **Replace Token Store:**
   - Implement Redis for token storage
   - Or use database (MongoDB, PostgreSQL)

2. **Add Database Layer:**
   - Store user credentials securely
   - Implement user profiles
   - Add audit logging

3. **Implement Rate Limiting:**
   - Prevent brute force attacks
   - Add request throttling

4. **Add Monitoring:**
   - Implement logging
   - Add metrics collection
   - Set up alerting

5. **Use External Auth Provider:**
   - OAuth2/OpenID Connect
   - Third-party identity providers

---

## Type Definitions

All types are defined in `src/modules/auth/auth.types.ts`

```typescript
interface LoginRequest {
  username: string;
  password: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

interface RefreshRequest {
  refreshToken: string;
}
```

---

## Error Handling Strategy

- **Try-Catch Blocks:** All async operations wrapped
- **Consistent Format:** All errors return standard HTTP status codes
- **Meaningful Messages:** User-friendly error descriptions
- **Security:** No stack traces exposed to client

---

## Performance Considerations

1. **Async Operations:** Non-blocking token generation
2. **JWT Verification:** Fast token validation with cryptographic signing
3. **In-Memory Storage:** Quick token lookups
4. **No Database Queries:** Minimal latency for demo (production should use DB)

---

## Future Improvements

1. Implement refresh token rotation
2. Add multi-factor authentication (MFA)
3. Implement role-based access control (RBAC)
4. Add audit logging
5. Implement token blacklisting
6. Add password reset functionality
7. Implement account lockout after failed attempts
