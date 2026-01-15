/**
 * Authentication Module Types
 *
 * This module defines TypeScript interfaces for type safety across the authentication system.
 * Using interfaces ensures compile-time type checking and provides IDE autocomplete.
 *
 * @module auth.types
 */

/**
 * Login Request Payload
 *
 * This interface defines the shape of data sent to the /auth/login endpoint
 *
 * Properties:
 * - username: Unique user identifier (e.g., email or username)
 * - password: User's password (sent over HTTPS in production)
 *
 * Security Notes:
 * - Password should always be transmitted over HTTPS
 * - Password is never stored as plain text in database (use bcrypt)
 * - Never log passwords to console or files
 *
 * @interface LoginRequest
 * @property {string} username - Unique user identifier
 * @property {string} password - User's password (plaintext)
 *
 * @example
 * const loginRequest: LoginRequest = {
 *   username: "admin",
 *   password: "securePassword123"
 * };
 */
export interface LoginRequest {
    username: string;
    password: string;
}

/**
 * Token Response Payload
 *
 * This interface defines the response structure from authentication endpoints
 * Returned by: POST /auth/login and POST /auth/refresh
 *
 * Properties:
 * - accessToken: JWT token for API requests (short-lived, ~15 minutes)
 * - refreshToken: JWT token for getting new access tokens (long-lived, ~7 days)
 * - tokenType: Token type identifier (always "Bearer" for JWT)
 *
 * Token Structure (JWT Format):
 * - Header: { alg: "HS256", typ: "JWT" }
 * - Payload: { sub: "username", iat: 1234567890, exp: 1234571490 }
 * - Signature: HMACSHA256(header.payload, secret)
 *
 * Usage:
 * Client stores these tokens and includes accessToken in subsequent requests:
 * ```
 * Authorization: Bearer <accessToken>
 * ```
 *
 * When accessToken expires, use refreshToken to get a new one:
 * ```
 * POST /auth/refresh
 * { "refreshToken": "<refreshToken>" }
 * ```
 *
 * @interface TokenResponse
 * @property {string} accessToken - JWT access token for API requests
 * @property {string} refreshToken - JWT refresh token for token renewal
 * @property {'Bearer'} tokenType - Token type identifier (always "Bearer")
 *
 * @example
 * const tokenResponse: TokenResponse = {
 *   accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   tokenType: "Bearer"
 * };
 */
export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: 'Bearer';
}
