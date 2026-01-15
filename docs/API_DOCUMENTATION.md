# API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication

All protected endpoints require a valid JWT access token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

---

## Endpoints

### 1. Login

**Endpoint:** `POST /auth/login`

**Description:** Authenticates a user and returns access and refresh tokens.

**Request Body:**
```json
{
  "username": "admin",
  "password": "Admin@123"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "message": "Invalid credentials"
}
```

**Status Codes:**
- `200 OK` - Successfully authenticated
- `401 Unauthorized` - Invalid credentials
- `400 Bad Request` - Missing required fields

---

### 2. Refresh Token

**Endpoint:** `POST /auth/refresh`

**Description:** Generates a new access token using a valid refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer"
}
```

**Error Response (400 Bad Request):**
```json
{
  "message": "Refresh token is required"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "message": "Invalid refresh token"
}
```

**Status Codes:**
- `200 OK` - Token refreshed successfully
- `400 Bad Request` - Missing refresh token
- `401 Unauthorized` - Invalid or expired refresh token

---

### 3. Get Current User

**Endpoint:** `GET /auth/me`

**Description:** Retrieves the current authenticated user information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "user": {
    "sub": "admin",
    "iat": 1705334400,
    "exp": 1705338000
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Missing or invalid token"
}
```

**Status Codes:**
- `200 OK` - User information retrieved
- `401 Unauthorized` - Missing or invalid token

---

### 4. Logout

**Endpoint:** `POST /auth/logout`

**Description:** Invalidates the refresh token and logs out the user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
  "message": "Refresh token is required"
}
```

**Error Response (400 Bad Request):**
```json
{
  "message": "Logout failed"
}
```

**Status Codes:**
- `200 OK` - Successfully logged out
- `400 Bad Request` - Invalid request or logout failed
- `401 Unauthorized` - Invalid access token

---

### 5. Health Check

**Endpoint:** `GET /health`

**Description:** Returns the health status of the API.

**Response (200 OK):**
```json
{
  "status": "ok"
}
```

**Status Codes:**
- `200 OK` - API is running

---

## Token Structure

### Access Token
- **Type:** JWT (JSON Web Token)
- **Expiration:** 1 hour (3600 seconds)
- **Purpose:** Used to authenticate requests to protected endpoints
- **Storage:** Memory (should be stored securely on client)

### Refresh Token
- **Type:** JWT (JSON Web Token)
- **Expiration:** 7 days (604800 seconds)
- **Purpose:** Used to obtain a new access token
- **Storage:** Secure HTTP-only cookie or localStorage

---

## Error Handling

All error responses follow a consistent format:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Detailed error message"
}
```

**Common HTTP Status Codes:**
- `200 OK` - Request successful
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Missing or invalid authentication
- `500 Internal Server Error` - Server-side error

---

## CORS

The API supports CORS with the following configuration:
- **Origin:** Accepts all origins (configurable)
- **Methods:** GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
- **Headers:** Content-Type, Authorization

---

## Rate Limiting

Currently, there is no rate limiting implemented. For production, consider implementing rate limiting to prevent abuse.

---

## Examples

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'
```

**Refresh Token:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"your_refresh_token_here"}'
```

**Get Current User:**
```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer your_access_token_here"
```

**Logout:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer your_access_token_here" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"your_refresh_token_here"}'
```

---

## Notes

- All timestamps are in Unix epoch format (seconds since January 1, 1970)
- Tokens are JWT format and can be decoded at [jwt.io](https://jwt.io)
- Ensure all requests include proper `Content-Type: application/json` header
- Keep access tokens secure and never expose them in URLs or logs
