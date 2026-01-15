/**
 * Authentication Routes Module
 *
 * Routes Layer - HTTP Endpoint Configuration
 *
 * This module:
 * 1. Instantiates dependencies (service, controller)
 * 2. Registers HTTP routes with handlers
 * 3. Configures route options (preHandlers, methods, etc.)
 *
 * Route Registration Pattern:
 * - Creates instances of service and controller
 * - Wires up dependency injection manually
 * - Registers handlers with Fastify
 *
 * Dependency Injection Flow:
 * 1. authRoutes() is called by app.register() with FastifyInstance
 * 2. Create TokenStore (data layer)
 * 3. Create AuthService (business layer) - inject Fastify & TokenStore
 * 4. Create AuthController (HTTP layer) - inject AuthService
 * 5. Register routes with controller methods
 *
 * This manual DI is simple but can be replaced with DI container like:
 * - Awilix
 * - tsyringe
 * - InversifyJS
 *
 * @module auth.routes
 * @see {@link auth.controller.ts} for endpoint handlers
 * @see {@link auth.service.ts} for business logic
 * @see {@link token.store.ts} for data access
 */

import { FastifyInstance } from 'fastify'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { TokenStore } from './token.store'

/**
 * Register authentication routes
 *
 * This is a Fastify plugin that registers all authentication endpoints.
 * Called during app initialization: app.register(authRoutes, { prefix: '/api/v1/auth' })
 *
 * Routes Registered:
 * 1. POST /login - Public, returns tokens
 * 2. POST /refresh - Public, requires refresh token
 * 3. GET /me - Protected, requires access token
 * 4. POST /logout - Protected, requires access token
 *
 * Note on "this":
 * - Fastify routes are registered with `app.post()`, `app.get()`, etc.
 * - The route handler is called with request and reply as parameters
 * - "this" inside handlers refers to the Fastify app, not the class
 * - That's why we use arrow functions for controller methods
 *
 * @async
 * @param {FastifyInstance} app - Fastify application instance
 * @returns {Promise<void>}
 *
 * @example
 * // Usage in app.ts
 * app.register(authRoutes, { prefix: '/api/v1/auth' });
 *
 * // Results in these endpoints:
 * // POST http://localhost:3000/api/v1/auth/login
 * // POST http://localhost:3000/api/v1/auth/refresh
 * // GET http://localhost:3000/api/v1/auth/me
 * // POST http://localhost:3000/api/v1/auth/logout
 */
export async function authRoutes(app: FastifyInstance) {
    /**
     * Step 1: Create TokenStore instance
     *
     * TokenStore manages refresh tokens in memory
     * Created fresh for each route registration
     * In production, replace with Redis or database
     *
     * @type {TokenStore}
     */
    const tokenStore = new TokenStore()

    /**
     * Step 2: Create AuthService instance
     *
     * Depends on:
     * - app: for JWT signing/verifying
     * - tokenStore: for token storage/revocation
     *
     * This is manual dependency injection
     * Service receives its dependencies in constructor
     *
     * @type {AuthService}
     */
    const service = new AuthService(app, tokenStore)

    /**
     * Step 3: Create AuthController instance
     *
     * Depends on:
     * - service: for business logic
     *
     * Controller receives service for handling requests
     *
     * @type {AuthController}
     */
    const controller = new AuthController(service)

    /**
     * Route: POST /auth/login
     *
     * Public endpoint - no authentication required
     * Accepts username and password
     * Returns access and refresh tokens
     *
     * HTTP Method: POST
     * Handler: controller.login
     *
     * Status Codes:
     * - 200 OK: Login successful, tokens returned
     * - 401 Unauthorized: Invalid credentials
     * - 400 Bad Request: Missing required fields
     */
    app.post('/login', controller.login)

    /**
     * Route: POST /auth/refresh
     *
     * Public endpoint - no authentication required
     * Accepts refresh token
     * Returns new access token
     *
     * HTTP Method: POST
     * Handler: controller.refresh
     *
     * Status Codes:
     * - 200 OK: Token refreshed, new access token returned
     * - 400 Bad Request: Missing refresh token
     * - 401 Unauthorized: Invalid or expired refresh token
     */
    app.post('/refresh', controller.refresh)

    /**
     * Route: GET /auth/me
     *
     * Protected endpoint - requires valid access token
     * Returns current authenticated user information
     *
     * HTTP Method: GET
     * Middleware: app.authenticate (preHandler)
     * - Validates JWT token from Authorization header
     * - Decodes token and sets request.user
     * - Returns 401 if token missing or invalid
     *
     * Handler: controller.me
     *
     * Configuration:
     * - preHandler: Runs before handler, validates token
     * - Array allows multiple preHandlers
     *
     * Status Codes:
     * - 200 OK: User info returned
     * - 401 Unauthorized: Missing or invalid token
     *
     * @see {@link ../plugins/jwt.plugin.ts} for authenticate implementation
     */
    app.get(
        '/me',
        { preHandler: [app.authenticate] },  // Security: validate token first
        controller.me                        // Handler: return user info
    )

    /**
     * Route: POST /auth/logout
     *
     * Protected endpoint - requires valid access token
     * Accepts refresh token and revokes it
     * Prevents future token refreshes
     *
     * HTTP Method: POST
     * Middleware: app.authenticate (preHandler)
     * - Same token validation as /me endpoint
     *
     * Handler: controller.logout
     *
     * Configuration:
     * - preHandler: Validates access token
     * - Body: Must include refreshToken
     *
     * Status Codes:
     * - 200 OK: Logged out successfully
     * - 400 Bad Request: Missing refresh token or logout failed
     * - 401 Unauthorized: Missing or invalid access token
     *
     * Note:
     * - Revokes the refresh token
     * - Current access token remains valid until expiration
     * - Client should delete stored tokens
     */
    app.post(
        '/logout',
        { preHandler: [app.authenticate] },  // Security: validate token first
        controller.logout                    // Handler: revoke refresh token
    )
}
