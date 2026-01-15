/**
 * API Configuration Constants
 *
 * This module defines API-wide constants that are used across the application
 *
 * Centralized Configuration Benefits:
 * - Single source of truth for API settings
 * - Easy to change prefix for API versioning
 * - Prevents hardcoding strings in routes
 * - Type-safe constants with TypeScript
 *
 * API Versioning:
 * - v1: Current version (this file uses /api/v1)
 * - When v2 released: Update to /api/v2
 * - Allows supporting multiple versions simultaneously
 * - Easier for clients to upgrade gradually
 *
 * @module api.constants
 */

/**
 * API Base Path Prefix
 *
 * Used as the base URL prefix for all API endpoints
 * Applied to routes via app.register(..., { prefix: API_PREFIX })
 *
 * Naming Convention:
 * /api/v1 means:
 * - /api: API namespace (indicates these are API endpoints)
 * - v1: Version 1 of the API
 *
 * Endpoints Created:
 * - GET /api/v1/health - Health check
 * - POST /api/v1/auth/login - Login endpoint
 * - POST /api/v1/auth/refresh - Token refresh
 * - GET /api/v1/auth/me - Current user
 * - POST /api/v1/auth/logout - Logout
 *
 * Why Use Prefix?
 * - Separates API routes from static files
 * - Allows serving web UI at root (/)
 * - Makes routing clear and organized
 * - Standard REST API convention
 *
 * Future Versions:
 * When creating v2:
 * ```typescript
 * // api.constants.v2.ts
 * export const API_PREFIX = '/api/v2'
 *
 * // app.ts - register both versions
 * app.register(authRoutesV1, { prefix: '/api/v1/auth' });
 * app.register(authRoutesV2, { prefix: '/api/v2/auth' });
 * ```
 *
 * @type {string}
 * @const
 * @see Used in {@link ../../app.ts} for route registration
 *
 * @example
 * // In routes
 * app.register(healthRoutes, { prefix: API_PREFIX });
 * // Results in: GET /api/v1/health
 *
 * @example
 * // In tests
 * const response = await app.inject({
 *   method: 'GET',
 *   url: `${API_PREFIX}/health`
 * });
 * // URL becomes: GET /api/v1/health
 *
 * @example
 * // In client code
 * const baseUrl = `http://localhost:3000${API_PREFIX}`;
 * fetch(`${baseUrl}/auth/login`, { ... });
 * // URL: http://localhost:3000/api/v1/auth/login
 */
export const API_PREFIX = '/api/v1'
