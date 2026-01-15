/**
 * Application Factory Module
 *
 * This module is responsible for initializing and configuring the Fastify application.
 * It follows the factory pattern to create a reusable, testable app instance.
 *
 * Key Responsibilities:
 * - Initialize Fastify framework
 * - Register cross-cutting concerns (CORS, JWT, etc.)
 * - Register feature modules (Auth, Health Check)
 * - Return configured app for server startup
 *
 * @module app
 * @see {@link server.ts} for application startup
 */

import Fastify from "fastify";
import cors from "@fastify/cors";
import { healthRoutes } from "./routes/health.routes";
import jwtPlugin from "./plugins/jwt.plugin";
import { authRoutes } from "./modules/auth/auth.routes";
import { API_PREFIX } from './config/api.constants';

/**
 * Factory function to build and configure the Fastify application
 *
 * This function creates a new Fastify instance and configures it with:
 * 1. Logging - for debugging and monitoring
 * 2. CORS - for handling cross-origin requests
 * 3. JWT Plugin - for secure token-based authentication
 * 4. Routes - health check and authentication endpoints
 *
 * Architecture Pattern:
 * - Creates a fresh app instance each time (useful for testing)
 * - Applies plugins in the correct order (dependencies first)
 * - Registers routes after plugins are loaded
 *
 * @function buildApp
 * @returns {FastifyInstance} Configured Fastify application instance
 *
 * @example
 * // Server startup
 * const app = buildApp();
 * await app.listen({ port: 3000, host: "0.0.0.0" });
 *
 * @example
 * // Testing
 * const testApp = buildApp();
 * const response = await testApp.inject({ method: 'GET', url: '/health' });
 */
export function buildApp() {
  // Initialize Fastify with logging enabled
  // Logger helps track requests and errors in development and production
  const app = Fastify({
    logger: true,
  });

  /**
   * Register CORS Plugin
   *
   * Enables Cross-Origin Resource Sharing
   * Allows browser-based clients from different domains to make requests
   *
   * Configuration:
   * - origin: true accepts all origins (configure per environment in production)
   * - For production, restrict to specific domains like: origin: ['https://yourdomain.com']
   *
   * @see https://github.com/fastify/fastify-cors
   */
  app.register(cors, {
    origin: true,
  });

  /**
   * Register JWT Authentication Plugin
   *
   * Provides:
   * - app.jwt.sign() - Create JWT tokens
   * - app.jwt.verify() - Verify JWT tokens
   * - app.authenticate - Decorator for protected routes
   *
   * Uses JWT_SECRET from environment variables
   * Throws error if JWT_SECRET is not configured in production
   *
   * @see {@link ./plugins/jwt.plugin.ts} for implementation details
   */
  app.register(jwtPlugin);

  /**
   * Register Health Check Route
   *
   * Endpoint: GET /api/v1/health
   *
   * Purpose:
   * - Used by load balancers to check if service is running
   * - Used by monitoring systems for uptime tracking
   * - Public route (no authentication required)
   *
   * Response: { status: "UP", service: "node-fastify-secure-auth-api" }
   *
   * @see {@link ./routes/health.routes.ts}
   */
  app.register(healthRoutes, { prefix: `${API_PREFIX}` });

  /**
   * Register Authentication Routes
   *
   * Endpoints:
   * - POST /api/v1/auth/login - User login
   * - POST /api/v1/auth/refresh - Token refresh
   * - GET /api/v1/auth/me - Get current user (protected)
   * - POST /api/v1/auth/logout - User logout (protected)
   *
   * These routes are mounted under /auth namespace
   * Combined with API_PREFIX to create full paths
   *
   * @see {@link ./modules/auth/auth.routes.ts}
   */
  app.register(authRoutes, { prefix: `${API_PREFIX}/auth` });

  // Return the configured application instance
  // The caller (server.ts) will call app.listen() to start the server
  return app;
}
