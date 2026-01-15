/**
 * Authentication Service Module
 *
 * Service Layer - Handles Business Logic
 *
 * This service encapsulates all authentication-related business logic:
 * - User credential validation
 * - JWT token generation (access & refresh tokens)
 * - Token refresh logic
 * - Token revocation (logout)
 *
 * Layer Responsibilities:
 * - NOT responsible for HTTP handling (controller does that)
 * - NOT responsible for database queries (repository pattern)
 * - Responsible for all business rules and logic
 *
 * Dependencies:
 * - FastifyInstance: For JWT signing/verifying
 * - TokenStore: For managing refresh token lifecycle
 *
 * @module auth.service
 * @see {@link auth.controller.ts} for HTTP layer
 * @see {@link token.store.ts} for data access
 */

import { FastifyInstance } from 'fastify'
import { LoginRequest, TokenResponse } from './auth.types'
import { TokenStore } from './token.store'

/**
 * Authentication Service Class
 *
 * Handles all business logic for user authentication and JWT token management
 *
 * Design: Dependency Injection
 * - Receives dependencies via constructor
 * - Makes the service testable with mock dependencies
 * - Loose coupling with other components
 *
 * @class AuthService
 */
export class AuthService {
    /**
     * Constructor
     *
     * @param {FastifyInstance} app - Fastify instance for JWT operations
     * @param {TokenStore} tokenStore - In-memory token storage
     */
    constructor(
        private app: FastifyInstance,
        private tokenStore: TokenStore
    ) {}

    /**
     * Authenticate user and generate JWT tokens
     *
     * Login Flow:
     * 1. Validate credentials (username/password check)
     * 2. Generate access token (short-lived: 15 minutes)
     * 3. Generate refresh token (long-lived: 7 days)
     * 4. Store refresh token in token store
     * 5. Return both tokens to client
     *
     * Security Considerations:
     * - Currently validates against hardcoded demo credentials
     * - TODO: Replace with database lookup and bcrypt password comparison
     * - Access token expires quickly (15 min) - limits exposure
     * - Refresh token stored server-side - can be revoked anytime
     *
     * Token Claims:
     * - sub (subject): Username identifier
     * - iat (issued at): Timestamp when token was created
     * - exp (expiration): Timestamp when token expires
     *
     * @async
     * @param {LoginRequest} payload - User credentials
     * @param {string} payload.username - Username
     * @param {string} payload.password - Password (plaintext, sent over HTTPS)
     * @returns {Promise<TokenResponse>} Access and refresh tokens
     * @throws {Error} If credentials are invalid
     *
     * @example
     * // Valid login
     * const tokens = await authService.login({
     *   username: 'admin',
     *   password: 'Admin@123'
     * });
     * // Returns: { accessToken: "...", refreshToken: "...", tokenType: "Bearer" }
     *
     * @example
     * // Invalid login
     * try {
     *   await authService.login({
     *     username: 'admin',
     *     password: 'wrongpassword'
     *   });
     * } catch (error) {
     *   // Throws: Error: Invalid credentials
     * }
     */
    async login(payload: LoginRequest): Promise<TokenResponse> {
        // Step 1: Validate credentials
        // TEMP: Using hardcoded credentials for demo
        // TODO: Implement proper database lookup and bcrypt comparison
        if (payload.username !== 'admin' || payload.password !== 'Admin@123') {
            throw new Error('Invalid credentials')
        }

        // Step 2: Generate access token
        // app.jwt.sign() uses JWT_SECRET to sign the token
        // Returns a cryptographically signed token string
        // Expiration: 15 minutes (900 seconds)
        // This token is used for subsequent API requests
        const accessToken = this.app.jwt.sign(
            { sub: payload.username },        // Payload: who is this token for
            { expiresIn: '15m' }              // Options: when does it expire
        )

        // Step 3: Generate refresh token
        // Same signing mechanism as access token
        // Expiration: 7 days (long-lived)
        // Used to obtain new access tokens when current one expires
        // Stored server-side so it can be revoked
        const refreshToken = this.app.jwt.sign(
            { sub: payload.username },        // Payload: who is this token for
            { expiresIn: '7d' }               // Options: expires in 7 days
        )

        // Step 4: Store refresh token in memory store
        // Stores: token string, username, expiration time
        // Used to:
        // - Verify token is valid during refresh
        // - Revoke token on logout
        // - Prevent token reuse attacks
        // TTL: 7 * 24 * 60 * 60 seconds = 7 days
        this.tokenStore.saveToken(refreshToken, payload.username, 7 * 24 * 60 * 60)

        // Step 5: Return tokens to client
        return {
            accessToken,
            refreshToken,
            tokenType: 'Bearer'               // Standard OAuth 2.0 token type
        }
    }

    /**
     * Refresh the access token using a valid refresh token
     *
     * Refresh Flow:
     * 1. Verify refresh token exists and hasn't expired
     * 2. Verify refresh token hasn't been revoked (not in blacklist)
     * 3. Decode the refresh token to get username
     * 4. Generate new access token with same username
     * 5. Return new access token (and same refresh token)
     *
     * Why Refresh Tokens?
     * - Access tokens are short-lived (15 min) - limits damage if compromised
     * - Users don't need to re-enter password after 15 minutes
     * - If refresh token is compromised, user can logout to revoke it
     * - Can implement token rotation to reduce risk
     *
     * Token Rotation (Future Enhancement):
     * - Current: Reuse same refresh token
     * - Better: Issue new refresh token each time
     * - This invalidates old refresh token and prevents token replay
     *
     * @async
     * @param {string} refreshToken - Refresh token from client
     * @returns {Promise<TokenResponse>} New access token with same refresh token
     * @throws {Error} If token is invalid, expired, or revoked
     *
     * @example
     * // Successful refresh
     * const newTokens = await authService.refresh(refreshToken);
     * // Returns: { accessToken: "...", refreshToken: "...", tokenType: "Bearer" }
     *
     * @example
     * // Token revoked (user logged out)
     * try {
     *   await authService.refresh(revokedToken);
     * } catch (error) {
     *   // Throws: Error: Refresh token is invalid or revoked
     * }
     */
    async refresh(refreshToken: string): Promise<TokenResponse> {
        // Step 1: Verify refresh token exists and hasn't been revoked
        // tokenStore.verifyToken() returns username if valid, null otherwise
        // This checks:
        // - Token exists in store (was issued by us)
        // - Token hasn't expired (Date.now() < expiresAt)
        // - Token hasn't been revoked via logout
        const username = this.tokenStore.verifyToken(refreshToken)
        if (!username) {
            throw new Error('Refresh token is invalid or revoked')
        }

        // Step 2: Decode the refresh token to verify signature
        // app.jwt.verify() validates the JWT signature using JWT_SECRET
        // Confirms token wasn't tampered with
        // Returns decoded payload: { sub: "username", iat: ..., exp: ... }
        // Generic type: <{ sub: string }> tells TypeScript what's in the payload
        const decoded = this.app.jwt.verify<{ sub: string }>(refreshToken)

        // Step 3: Generate new access token
        // Uses the username from refresh token to create new access token
        // New token has fresh expiration time (15 minutes from now)
        // Refresh token is NOT regenerated (same refresh token is returned)
        const newAccessToken = this.app.jwt.sign(
            { sub: decoded.sub },             // Payload: same username
            { expiresIn: '15m' }              // Options: new expiration
        )

        // Step 4: Return new access token with same refresh token
        return {
            accessToken: newAccessToken,      // New token for API requests
            refreshToken,                     // Same refresh token
            tokenType: 'Bearer'               // OAuth 2.0 standard type
        }
    }

    /**
     * Logout user by revoking their refresh token
     *
     * Logout Flow:
     * 1. Find refresh token in token store
     * 2. Delete/revoke the token
     * 3. Future refresh attempts will fail
     *
     * What Happens After Logout:
     * - Refresh token becomes invalid immediately
     * - User can't get new access tokens
     * - Current access token is still valid (until natural expiration)
     * - Client should delete stored access token from memory
     * - If you need immediate access token invalidation, implement blacklist
     *
     * Implementation Details:
     * - No response validation needed (just delete from map)
     * - If token doesn't exist, operation still succeeds
     * - Idempotent: calling twice has same effect as once
     *
     * Future Enhancements:
     * - Access token blacklist: prevent current token usage
     * - Audit logging: track who logged out when
     * - Device management: logout from specific devices only
     * - Revoke all sessions: logout from all devices
     *
     * @async
     * @param {string} refreshToken - Refresh token to revoke
     * @returns {Promise<void>}
     * @throws {Error} Only if database error (won't happen with Map)
     *
     * @example
     * // Logout
     * await authService.logout(refreshToken);
     *
     * // Token is now invalid
     * try {
     *   await authService.refresh(refreshToken);
     * } catch (error) {
     *   // Throws: Error: Refresh token is invalid or revoked
     * }
     */
    async logout(refreshToken: string): Promise<void> {
        // Step 1: Revoke the refresh token
        // tokenStore.revokeToken() deletes token from in-memory map
        // Token will no longer be found by future verifyToken() calls
        // This immediately invalidates the refresh token
        this.tokenStore.revokeToken(refreshToken)

        // Note: No throw/error if token not found
        // This makes logout safe - works even if token already deleted
    }
}
