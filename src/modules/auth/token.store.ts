/**
 * Token Store Abstraction Layer
 *
 * This module provides an abstraction for token storage.
 * Current implementation uses in-memory storage (development-only).
 * Can be replaced with Redis, MongoDB, PostgreSQL, or any database
 * without changing consumers (AuthService, AuthController).
 *
 * Why abstraction?
 * - Separates token storage logic from business logic
 * - Makes switching backends trivial (implement same interface)
 * - Allows testing with mock implementations
 * - Enables scaling without refactoring services
 *
 * Production Migration Path:
 * 1. Create RedisTokenStore class (implements same methods)
 * 2. Update auth.routes.ts: new RedisTokenStore() instead of new TokenStore()
 * 3. Everything else continues to work unchanged
 *
 * Structure: Map<refreshToken, { username: string, issuedAt: number, expiresAt: number }>
 */

export interface StoredToken {
    username: string
    issuedAt: number
    expiresAt: number
}

export class TokenStore {
    private tokens = new Map<string, StoredToken>()

    /**
     * Save a refresh token with metadata
     * @param token The refresh token string
     * @param username The username associated with this token
     * @param ttlSeconds Token time-to-live in seconds (default: 7 days)
     */
    saveToken(token: string, username: string, ttlSeconds: number = 7 * 24 * 60 * 60): void {
        const now = Date.now()
        this.tokens.set(token, {
            username,
            issuedAt: now,
            expiresAt: now + ttlSeconds * 1000
        })
    }

    /**
     * Verify if a refresh token is valid and not expired
     * Automatically cleans up expired tokens
     * @param token The refresh token to verify
     * @returns The username if token is valid, null otherwise
     */
    verifyToken(token: string): string | null {
        const stored = this.tokens.get(token)

        if (!stored) {
            return null
        }

        // Check if token has expired
        if (Date.now() > stored.expiresAt) {
            this.tokens.delete(token)
            return null
        }

        return stored.username
    }

    /**
     * Revoke a refresh token (logout)
     * @param token The refresh token to revoke
     */
    revokeToken(token: string): void {
        this.tokens.delete(token)
    }

    /**
     * Revoke all tokens for a specific user (admin logout, security breach, etc.)
     * @param username The username whose tokens should be revoked
     */
    revokeAllUserTokens(username: string): void {
        for (const [token, stored] of this.tokens.entries()) {
            if (stored.username === username) {
                this.tokens.delete(token)
            }
        }
    }

    /**
     * Clean up all expired tokens
     * Can be called periodically by a background job
     */
    cleanupExpired(): number {
        const now = Date.now()
        let cleaned = 0

        for (const [token, stored] of this.tokens.entries()) {
            if (now > stored.expiresAt) {
                this.tokens.delete(token)
                cleaned++
            }
        }

        return cleaned
    }

    /**
     * Get token store statistics (useful for debugging)
     */
    getStats() {
        return {
            totalTokens: this.tokens.size,
            tokens: Array.from(this.tokens.entries()).map(([token, data]) => ({
                token: token.substring(0, 10) + '...',
                username: data.username,
                issuedAt: new Date(data.issuedAt).toISOString(),
                expiresAt: new Date(data.expiresAt).toISOString(),
                isExpired: Date.now() > data.expiresAt
            }))
        }
    }
}
