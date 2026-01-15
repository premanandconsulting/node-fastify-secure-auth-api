/**
 * Public Routes Configuration
 *
 * This module defines which routes are accessible without authentication
 *
 * Why Separate Public Routes?
 * - Security: Clear definition of unprotected endpoints
 * - Maintainability: Single place to view public API
 * - Global guards: Can use for middleware/interceptors
 * - Documentation: Obvious which routes need tokens
 *
 * Public vs Protected:
 *
 * PUBLIC ROUTES (no authentication required):
 * - POST /health - Health checks from load balancers
 * - POST /auth/login - Users need to login to get token
 * - POST /auth/refresh - Only requires refresh token, not access token
 *
 * PROTECTED ROUTES (require valid access token):
 * - GET /auth/me - Returns current user info
 * - POST /auth/logout - User must be authenticated to logout
 *
 * Usage:
 * - Can be used by global authentication middleware
 * - Can be used for logging/monitoring
 * - Can be used for route documentation
 * - Can be used for CORS preflight handling
 *
 * @module public-routes
 */

/**
 * List of public routes that don't require JWT authentication
 *
 * Routes in this array are accessible without an Authorization header
 * Similar to Spring Security's permitAll() or Express skip middleware
 *
 * Why These Routes Are Public:
 *
 * 1. /health
 *    - Infrastructure route for monitoring
 *    - Called by load balancers, not users
 *    - Should always be accessible for uptime tracking
 *
 * 2. /auth/login
 *    - User entry point for authentication
 *    - Users can't have token before logging in
 *    - No token means user hasn't authenticated yet
 *
 * 3. /auth/refresh
 *    - Special case: requires refresh token, not access token
 *    - Refresh token in request body, not Authorization header
 *    - Allows access token renewal without re-login
 *    - Access token can be expired when calling this
 *
 * Performance Consideration:
 * - Each request checks if path is public
 * - O(n) lookup where n = number of public routes
 * - Add only routes that truly don't need authentication
 *
 * Security Consideration:
 * - Public doesn't mean "insecure"
 * - Login endpoint can be rate limited
 * - Login checks password security
 * - Only requires no JWT, not no security
 *
 * @type {string[]}
 * @const
 *
 * @example
 * console.log(PUBLIC_ROUTES);
 * // Output:
 * // ['/health', '/auth/login', '/auth/refresh']
 *
 * @example
 * // Usage in middleware
 * const path = request.url;
 * if (!isPublicRoute(path)) {
 *   // Require authentication
 *   await request.jwtVerify();
 * }
 *
 * @see {@link ./isPublicRoute} for matching function
 */
export const PUBLIC_ROUTES = [
    '/health',
    '/auth/login',
    '/auth/refresh'
]

/**
 * Check if a route is public (does not require authentication)
 *
 * This function determines if a given pathname should be accessible
 * without providing a valid JWT authentication token.
 *
 * Matching Strategy:
 * - Exact match: /health === /health ✓
 * - Prefix match: /auth/login/* matches /auth/login ✓
 * - Case sensitive: /HEALTH !== /health ✗
 *
 * How it works:
 * 1. Loop through each route in PUBLIC_ROUTES
 * 2. Check for exact match: pathname === route
 * 3. Check for prefix match: pathname starts with route + '/'
 * 4. Return true if either match succeeds
 *
 * Prefix Match Examples:
 * - Route: /auth/login
 * - URL /auth/login → exact match ✓
 * - URL /auth/login/ → prefix match ✓
 * - URL /auth/login/foo → prefix match ✓
 * - URL /auth/loginbar → NO match ✗
 *
 * Why Prefix Match?
 * - Supports routes with parameters: /auth/login/:id
 * - Supports nested routes: /auth/login/callback
 * - Flexible for route expansion
 *
 * @function isPublicRoute
 * @param {string} pathname - URL path to check (e.g., "/auth/login")
 * @returns {boolean} True if route is public, false if protected
 *
 * @example
 * // Exact match
 * isPublicRoute('/health');           // true
 * isPublicRoute('/auth/login');       // true
 * isPublicRoute('/auth/refresh');     // true
 *
 * @example
 * // Prefix match
 * isPublicRoute('/auth/login/');      // true
 * isPublicRoute('/auth/login/extra'); // true
 *
 * @example
 * // Non-matching
 * isPublicRoute('/auth/me');          // false (protected)
 * isPublicRoute('/auth/logout');      // false (protected)
 * isPublicRoute('/invalid');          // false (doesn't exist)
 *
 * @example
 * // Usage in middleware
 * if (isPublicRoute(request.url)) {
 *   // Allow request without authentication
 *   return handler(request, reply);
 * } else {
 *   // Require valid JWT token
 *   await request.jwtVerify();
 *   return handler(request, reply);
 * }
 */
export function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.some(route => {
        // Strategy 1: Exact match
        // e.g., /health === /health
        if (pathname === route) {
            return true;
        }

        // Strategy 2: Prefix match for nested routes
        // e.g., /auth/login/ or /auth/login/callback
        // Uses startsWith with '/' to avoid false matches
        // This prevents /auth/loginbar from matching /auth/login
        if (pathname.startsWith(route + '/')) {
            return true;
        }

        // No match for this route
        return false;
    })
}
