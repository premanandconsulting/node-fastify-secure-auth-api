/**
 * Health Check Routes Module
 *
 * This module provides a simple health check endpoint for monitoring
 *
 * Health Check Purpose:
 * - Load balancers use it to detect if server is alive
 * - Monitoring systems use it for uptime tracking
 * - Container orchestration (Docker/Kubernetes) use it for pod health
 * - APM tools use it for service availability metrics
 *
 * Why Not Authenticated?
 * - Health checks are internal/infrastructure concerns
 * - May be called before authentication is initialized
 * - Often called from health check endpoints that can't authenticate
 * - Server availability is independent of authentication state
 *
 * Best Practices:
 * - Should be fast (no heavy computation)
 * - Should not require database connection (unless critical)
 * - Should return consistent response format
 * - Should include service identifier for clarity
 *
 * Response Format:
 * - status: Service state (UP/DOWN/DEGRADED)
 * - service: Service name for identification
 * - timestamp: Optional, when check ran
 * - version: Optional, service version
 * - dependencies: Optional, status of database/external services
 *
 * @module health.routes
 */

import { FastifyInstance } from "fastify";

/**
 * Register health check route
 *
 * Endpoint: GET /api/v1/health
 *
 * This is a Fastify plugin that registers a single health check endpoint
 * Called during app initialization: app.register(healthRoutes, { prefix: '/api/v1' })
 *
 * @async
 * @param {FastifyInstance} app - Fastify application instance
 * @returns {Promise<void>}
 *
 * @example
 * // Usage
 * app.register(healthRoutes, { prefix: '/api/v1' });
 *
 * // Results in:
 * // GET http://localhost:3000/api/v1/health
 */
export async function healthRoutes(app: FastifyInstance) {
  /**
   * GET /health endpoint
   *
   * Simple health check endpoint for monitoring/load balancing
   *
   * Response (200 OK):
   * ```json
   * {
   *   "status": "UP",
   *   "service": "node-fastify-secure-auth-api"
   * }
   * ```
   *
   * Status Codes:
   * - 200 OK: Service is healthy and running
   * - 503 Service Unavailable: If needed, can return on database errors
   *
   * Features:
   * - No authentication required (public endpoint)
   * - No request body needed
   * - Always returns same response if healthy
   * - Fast execution (no I/O operations)
   *
   * Monitoring Integration:
   * - Load Balancer: Calls periodically to check if server is alive
   * - Kubernetes: Uses as liveness probe
   * - Prometheus: Scrapes metrics from this endpoint
   * - Uptime monitoring: Tracks service availability
   *
   * Future Enhancements:
   * - Include timestamp: new Date().toISOString()
   * - Add version number: require('../package.json').version
   * - Check database connectivity
   * - Include response time percentiles
   * - Add detailed dependency status
   *
   * @example
   * // Response
   * GET /api/v1/health
   *
   * {
   *   "status": "UP",
   *   "service": "node-fastify-secure-auth-api"
   * }
   *
   * @example
   * // Client usage
   * const response = await fetch('http://localhost:3000/api/v1/health');
   * const health = await response.json();
   * if (response.ok) {
   *   console.log(`Service is ${health.status}`);
   * }
   */
  app.get("/health", async () => {
    return {
      status: "UP",
      service: "node-fastify-secure-auth-api",
    };
  });
}
