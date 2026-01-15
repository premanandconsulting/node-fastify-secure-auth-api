/**
 * JWT Authentication Plugin Module
 *
 * Plugin Layer - Fastify Plugin Implementation
 *
 * This module implements JWT authentication for the Fastify framework.
 *
 * What is a Fastify Plugin?
 * - Encapsulates reusable functionality
 * - Extends Fastify with new methods/decorators
 * - Automatically registered via app.register()
 * - Loaded before routes, making functions available to routes
 *
 * What This Plugin Provides:
 * 1. app.jwt - JWT signing and verification methods
 * 2. app.authenticate - Middleware for protecting routes
 * 3. request.user - Decoded JWT payload on protected routes
 *
 * How It Works:
 * 1. Registers @fastify/jwt with app.register()
 * 2. Configures JWT_SECRET for signing/verifying tokens
 * 3. Adds custom authenticate decorator
 * 4. Used by routes via preHandler: [app.authenticate]
 *
 * Comparison with Other Frameworks:
 * - Express: middleware, use in app.use(authenticateMiddleware)
 * - Spring: @Secured, @PreAuthorize annotations
 * - FastAPI: Depends() dependency injection
 * - Fastify: preHandler array in route options
 *
 * @module jwt.plugin
 * @see https://github.com/fastify/fastify-jwt
 * @see auth.routes.ts for usage examples
 */

import fp from "fastify-plugin";
import jwt from '@fastify/jwt';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

/**
 * TypeScript Module Declaration
 *
 * Extends Fastify module with custom authenticate method
 * Tells TypeScript that app.authenticate exists
 *
 * Without this, TypeScript would show error: Property 'authenticate' does not exist
 *
 * This is called "Ambient Declaration" or "Module Augmentation"
 * Allows adding types to existing modules
 *
 * Interface Hierarchy:
 * - FastifyInstance: The app/server object
 * - Add property: authenticate
 * - Type: async function expecting request and reply
 *
 * @augments FastifyInstance
 * @property {Function} authenticate - Token verification middleware
 */
declare module 'fastify' {
    interface FastifyInstance {
        /**
         * Authenticate preHandler decorator
         * Verifies JWT token in Authorization header
         *
         * Used in route options:
         * ```
         * app.get('/protected', { preHandler: [app.authenticate] }, handler)
         * ```
         *
         * @param {FastifyRequest} request - Fastify request object
         * @param {FastifyReply} reply - Fastify reply object
         * @returns {Promise<void>}
         * @throws {Error} If token missing or invalid
         */
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    }
}

/**
 * JWT Plugin Implementation
 *
 * Wraps plugin in fp() for proper Fastify plugin registration
 *
 * What is fp()?
 * - Function provided by fastify-plugin package
 * - Marks function as a Fastify plugin
 * - Handles dependency ordering
 * - Ensures plugin runs before routes
 *
 * Plugin Registration:
 * - Automatically called by app.register(jwtPlugin) in app.ts
 * - Only registered once, even if imported multiple times
 * - All routes can use app.jwt and app.authenticate
 *
 * @async
 * @param {FastifyInstance} app - Fastify application instance
 * @returns {Promise<void>}
 */
export default fp(async function jwtPlugin(app: FastifyInstance) {
    /**
     * Register JWT Plugin with @fastify/jwt
     *
     * @fastify/jwt provides:
     * - app.jwt.sign(payload, options) - Create JWT tokens
     * - app.jwt.verify(token) - Verify and decode tokens
     * - request.jwtVerify() - Verify token in request
     * - request.user - Decoded payload after verification
     *
     * Configuration:
     * - secret: Used to sign and verify tokens cryptographically
     * - MUST be kept secret (don't commit to version control)
     * - Uses HMAC-SHA256 (HS256) signing algorithm by default
     *
     * Why HMAC-SHA256?
     * - Simple symmetric encryption (same secret for sign/verify)
     * - Fast (good for high-traffic APIs)
     * - Suitable for single-server scenarios
     * - For distributed systems, consider RS256 with public/private keys
     *
     * Security:
     * - Token is NOT encrypted, only signed
     * - Can be decoded with jwt.io (but can't be forged without secret)
     * - Never put sensitive data in JWT (passwords, credit cards, etc.)
     * - Keep JWT_SECRET secure and rotate periodically
     *
     * TODO: Move secret to environment variable
     * Current: Falls back to 'dev-secret-change-me' if not set
     * Better: Throw error if JWT_SECRET not set in production
     *
     * @see https://github.com/fastify/fastify-jwt
     */
    app.register(jwt, {
        secret: process.env.JWT_SECRET || 'dev-secret-change-me'
    })

    /**
     * Add Custom Authenticate Decorator
     *
     * Purpose: Create a reusable token verification middleware
     *
     * What it does:
     * 1. Calls request.jwtVerify() to validate token
     * 2. Decodes token and populates request.user
     * 3. Passes to next handler if valid
     * 4. Returns 401 error if invalid
     *
     * Why Custom Decorator?
     * - @fastify/jwt provides request.jwtVerify() but needs error handling
     * - Custom decorator adds standard error response format
     * - Can be extended with additional logic (logging, metrics, etc.)
     * - Makes routes cleaner: { preHandler: [app.authenticate] }
     *
     * Alternative Approaches:
     * 1. Direct in route: { preHandler: [async (req, rep) => req.jwtVerify()] }
     * 2. Separate middleware file: import authenticate from './middleware'
     * 3. DI container: Inject guard/interceptor
     *
     * Current approach (custom decorator) is clean and reusable
     *
     * @function authenticate
     * @param {FastifyRequest} request - Request object from client
     * @param {FastifyReply} reply - Reply object for sending response
     * @returns {Promise<void>} Resolves if token valid, throws/replies if invalid
     *
     * Flow:
     * - Valid token:
     *   1. request.jwtVerify() succeeds
     *   2. request.user is populated
     *   3. Function returns
     *   4. Route handler executes
     *
     * - Invalid/Missing token:
     *   1. request.jwtVerify() throws error
     *   2. Catch block executes
     *   3. reply.code(401) sets HTTP status
     *   4. reply.send() sends error message
     *   5. Route handler never executes
     *
     * @example
     * // Usage in route
     * app.get('/protected', { preHandler: [app.authenticate] }, (request, reply) => {
     *   // Only executes if token is valid
     *   const user = request.user; // Decoded JWT payload
     *   return { message: `Hello ${user.sub}` };
     * });
     *
     * @example
     * // Client request with token
     * fetch('http://localhost:3000/protected', {
     *   headers: {
     *     'Authorization': 'Bearer eyJhbGc...' // JWT token
     *   }
     * });
     *
     * @example
     * // Client request without token
     * fetch('http://localhost:3000/protected'); // Returns 401 Unauthorized
     */
    app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            /**
             * Verify JWT Token
             *
             * How it works:
             * 1. Extracts token from Authorization header (Bearer scheme)
             * 2. Checks if token format is correct
             * 3. Verifies signature using JWT_SECRET
             * 4. Checks expiration (exp claim)
             * 5. Decodes and returns payload
             *
             * Token Location (Bearer scheme):
             * Authorization: Bearer <token>
             *
             * @fastify/jwt automatically:
             * - Extracts "Bearer <token>" from header
             * - Strips "Bearer " prefix
             * - Verifies the token
             * - Sets request.user to decoded payload
             *
             * Possible Errors (caught by try-catch):
             * - MissingCredentials: No Authorization header
             * - MissingBearerToken: Header doesn't contain "Bearer"
             * - InvalidToken: Token signature invalid
             * - TokenExpiredError: Token exp claim in past
             *
             * All errors result in 401 response below
             */
            await request.jwtVerify()

            /**
             * After verification succeeds:
             * - request.user contains decoded JWT payload
             * - Example: { sub: "admin", iat: 1705334400, exp: 1705338000 }
             * - Route handler receives this and can access request.user
             */
        } catch (err) {
            /**
             * Handle Token Verification Errors
             *
             * Return 401 Unauthorized with user-friendly message
             *
             * Why 401?
             * - 401: Authentication required/failed (wrong credentials)
             * - 403: Authentication success but authorization failed (insufficient permissions)
             * - Current endpoint has no authorization checks, only authentication
             *
             * Error Details NOT Included:
             * - Don't reveal if token is missing vs invalid vs expired
             * - Generic message prevents token guessing attacks
             * - Log detailed error server-side for debugging
             *
             * Improvement Idea:
             * - Could log error for monitoring/alerting
             * - Could track failed attempts for rate limiting
             * - Could add error codes for client to handle differently
             *
             * @example
             * // Response body
             * {
             *   "message": "Unauthorized - Invalid or missing JWT token"
             * }
             */
            reply.code(401).send({
                message: 'Unauthorized - Invalid or missing JWT token'
            })
        }
    })
})
