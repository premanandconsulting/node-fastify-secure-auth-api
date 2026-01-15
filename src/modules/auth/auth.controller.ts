/**
 * Authentication Controller Module
 *
 * Controller Layer - Handles HTTP Request/Response logic
 *
 * This controller acts as the bridge between HTTP requests and business logic:
 * 1. Parses and validates incoming request data
 * 2. Calls appropriate service methods
 * 3. Formats and sends HTTP responses
 * 4. Handles and converts business errors to HTTP responses
 *
 * Design Pattern: Controller-Service-Repository
 * - Controller: HTTP layer (this file)
 * - Service: Business logic layer
 * - Repository: Data access layer (token.store in this case)
 *
 * @module auth.controller
 * @see auth.service.ts for business logic
 * @see auth.routes.ts for route mapping
 */

import { FastifyReply, FastifyRequest } from 'fastify'
import { AuthService } from './auth.service'
import { LoginRequest } from './auth.types'

/**
 * Authentication Controller Class
 *
 * Handles all authentication-related HTTP endpoints:
 * - POST /auth/login - User login
 * - POST /auth/refresh - Token refresh
 * - GET /auth/me - Get current user
 * - POST /auth/logout - User logout
 *
 * Dependency Injection:
 * - Receives AuthService via constructor
 * - AuthService is injected by the route handler
 * - This makes the controller testable with mock services
 *
 * @class AuthController
 */
export class AuthController {
    /**
     * Constructor
     *
     * @param {AuthService} service - Injected authentication service
     */
    constructor(private service: AuthService) {}

    /**
     * Handle POST /auth/login
     *
     * Authenticates a user with credentials and returns JWT tokens
     *
     * Request Flow:
     * 1. Client sends username and password
     * 2. Service validates credentials (currently against hardcoded admin user)
     * 3. Service generates access and refresh tokens
     * 4. Service stores refresh token in token store
     * 5. Controller returns tokens to client
     *
     * Success Response (200 OK):
     * ```json
     * {
     *   "accessToken": "eyJhbGc...",
     *   "refreshToken": "eyJhbGc...",
     *   "tokenType": "Bearer"
     * }
     * ```
     *
     * Error Response (401 Unauthorized):
     * ```json
     * { "message": "Invalid credentials" }
     * ```
     *
     * @async
     * @param {FastifyRequest} request - Fastify request object
     * @param {LoginRequest} request.body - Login credentials
     * @param {FastifyReply} reply - Fastify reply object
     * @returns {Promise<void>}
     *
     * @example
     * // Client usage
     * const response = await fetch('http://localhost:3000/api/v1/auth/login', {
     *   method: 'POST',
     *   headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify({
     *     username: 'admin',
     *     password: 'Admin@123'
     *   })
     * });
     */
    login = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // Cast request.body to LoginRequest type
            // request.body is of type unknown, so we need to cast it
            const tokens = await this.service.login(request.body as LoginRequest)

            // Send success response with tokens
            // Status code defaults to 200 OK
            reply.send(tokens)
        } catch {
            // Handle authentication failure
            // Return 401 Unauthorized status
            // Send generic error message (don't reveal if username or password was wrong)
            reply.code(401).send({ message: 'Invalid credentials' })
        }
    }

    /**
     * Handle POST /auth/refresh
     *
     * Generates a new access token using a valid refresh token
     *
     * Use Case:
     * - Access token expires after 15 minutes
     * - Client stores refresh token (valid for 7 days)
     * - When access token expires, client calls this endpoint
     * - Service validates refresh token
     * - Service generates new access token
     * - Client updates stored access token
     *
     * Success Response (200 OK):
     * ```json
     * {
     *   "accessToken": "eyJhbGc...",
     *   "refreshToken": "eyJhbGc...",
     *   "tokenType": "Bearer"
     * }
     * ```
     *
     * Error Responses:
     * ```json
     * // Missing refresh token
     * { "statusCode": 400, "message": "Refresh token is required" }
     *
     * // Invalid or expired refresh token
     * { "statusCode": 401, "message": "Invalid refresh token" }
     * ```
     *
     * @async
     * @param {FastifyRequest} request - Fastify request object
     * @param {string} request.body.refreshToken - Refresh token
     * @param {FastifyReply} reply - Fastify reply object
     * @returns {Promise<void>}
     *
     * @example
     * // Client usage
     * const response = await fetch('http://localhost:3000/api/v1/auth/refresh', {
     *   method: 'POST',
     *   headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify({ refreshToken: 'eyJhbGc...' })
     * });
     */
    refresh = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // Extract refresh token from request body
            const { refreshToken } = request.body as { refreshToken: string }

            // Validate that refresh token is provided
            // Client must send the token, not an empty string
            if (!refreshToken) {
                // Return 400 Bad Request status
                // 400 indicates client error (missing required field)
                return reply.code(400).send({ message: 'Refresh token is required' })
            }

            // Call service to generate new access token
            // Service validates token and generates new access token
            const tokens = await this.service.refresh(refreshToken)

            // Send success response
            reply.send(tokens)
        } catch (err) {
            // Handle token validation errors
            // Return 401 Unauthorized status
            // This could mean:
            // - Token has expired
            // - Token was revoked (user logged out)
            // - Token signature is invalid
            // - Token was tampered with
            reply.code(401).send({ message: 'Invalid refresh token' })
        }
    }

    /**
     * Handle POST /auth/logout
     *
     * Invalidates the refresh token to prevent future token refreshes
     *
     * Flow:
     * 1. Client sends refresh token and valid access token
     * 2. Middleware validates access token (preHandler)
     * 3. Service revokes the refresh token in token store
     * 4. Future refresh attempts with this token will fail
     *
     * Notes:
     * - This endpoint requires valid access token (protected)
     * - Access token can still be used after logout (until it expires)
     * - To prevent further use, client must delete stored access token
     * - If you need immediate revocation, implement token blacklist
     *
     * Success Response (200 OK):
     * ```json
     * { "message": "Logged out successfully" }
     * ```
     *
     * Error Responses:
     * ```json
     * // Missing refresh token
     * { "statusCode": 400, "message": "Refresh token is required" }
     *
     * // Logout failed (token not found, already revoked)
     * { "statusCode": 400, "message": "Logout failed" }
     *
     * // Missing or invalid access token
     * { "statusCode": 401, "message": "Unauthorized - Invalid or missing JWT token" }
     * ```
     *
     * @async
     * @param {FastifyRequest} request - Fastify request object
     * @param {string} request.body.refreshToken - Refresh token to revoke
     * @param {FastifyReply} reply - Fastify reply object
     * @returns {Promise<void>}
     *
     * @example
     * // Client usage
     * const response = await fetch('http://localhost:3000/api/v1/auth/logout', {
     *   method: 'POST',
     *   headers: {
     *     'Content-Type': 'application/json',
     *     'Authorization': 'Bearer <accessToken>'
     *   },
     *   body: JSON.stringify({ refreshToken: 'eyJhbGc...' })
     * });
     */
    logout = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // Extract refresh token from request body
            const { refreshToken } = request.body as { refreshToken: string }

            // Validate that refresh token is provided
            if (!refreshToken) {
                return reply.code(400).send({ message: 'Refresh token is required' })
            }

            // Call service to revoke the refresh token
            // Service removes token from token store
            // Future refresh attempts will fail
            await this.service.logout(refreshToken)

            // Send success response
            reply.send({ message: 'Logged out successfully' })
        } catch (err) {
            // Handle logout errors
            // Could happen if:
            // - Token doesn't exist in store
            // - Token already revoked
            // - Other unexpected error
            reply.code(400).send({ message: 'Logout failed' })
        }
    }

    /**
     * Handle GET /auth/me
     *
     * Returns the current authenticated user information
     *
     * This endpoint is protected and requires valid JWT token
     * Fastify middleware (preHandler) validates token before this runs
     *
     * User Information:
     * - request.user contains decoded JWT payload
     * - Payload includes: sub (username), iat (issued at), exp (expiration)
     * - User data comes from JWT token, not from database
     *
     * Endpoint: GET /api/v1/auth/me
     *
     * Success Response (200 OK):
     * ```json
     * {
     *   "user": {
     *     "sub": "admin",
     *     "iat": 1705334400,
     *     "exp": 1705338000
     *   }
     * }
     * ```
     *
     * Error Response (401 Unauthorized):
     * ```json
     * {
     *   "statusCode": 401,
     *   "message": "Unauthorized - Invalid or missing JWT token"
     * }
     * ```
     *
     * @async
     * @param {FastifyRequest} request - Fastify request object
     * @param {object} request.user - Decoded JWT payload (set by middleware)
     * @param {FastifyReply} reply - Fastify reply object
     * @returns {Promise<void>}
     *
     * @example
     * // Client usage
     * const response = await fetch('http://localhost:3000/api/v1/auth/me', {
     *   method: 'GET',
     *   headers: {
     *     'Authorization': 'Bearer <accessToken>'
     *   }
     * });
     *
     * const data = await response.json();
     * console.log(data.user.sub); // "admin"
     */
    me = async (request: FastifyRequest, reply: FastifyReply) => {
        // Return the current user information from JWT payload
        // request.user is set by the JWT verification middleware (preHandler)
        // No service call needed - user info is already in the token
        reply.send({ user: request.user })
    }
}

