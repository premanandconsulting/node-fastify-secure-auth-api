/**
 * Server Entry Point
 *
 * This is the main entry point for the application (npm start or node dist/server.js)
 *
 * Responsibilities:
 * - Builds the application instance using the factory pattern
 * - Starts the HTTP server on the configured port
 * - Handles startup errors and graceful shutdown
 * - Provides console feedback for developers
 *
 * @module server
 * @see {@link app.ts} for application configuration
 */

import { buildApp } from "./app";

/**
 * Build the application instance
 * This creates a fresh Fastify instance with all plugins and routes configured
 *
 * @type {FastifyInstance}
 */
const app = buildApp();

/**
 * Async function to start the server
 *
 * Process:
 * 1. Attempt to bind to port 3000 on all network interfaces (0.0.0.0)
 * 2. Wait for the server to be ready
 * 3. Log success message
 * 4. Catch and handle any startup errors
 *
 * Network Configuration:
 * - Host: 0.0.0.0 means listen on all available network interfaces
 *   Allows connections from localhost, local network, and external requests
 * - Port: 3000 (can be overridden with PORT environment variable)
 *
 * Error Handling:
 * - Catches any errors during startup (port already in use, permission denied, etc.)
 * - Logs errors to Fastify logger
 * - Exits process with code 1 to signal failure to orchestration tools
 *
 * @async
 * @returns {Promise<void>}
 */
const start = async () => {
  try {
    // Start listening on port 3000
    // This is a blocking call that keeps the server running
    await app.listen({ port: 3000, host: "0.0.0.0" });

    // Server started successfully
    // This message is visible when running `npm run dev` or `npm start`
    console.log("🚀 Server running on http://localhost:3000");
  } catch (err) {
    // Handle startup errors
    // Common errors:
    // - EADDRINUSE: Port 3000 is already in use by another process
    // - EACCES: Permission denied (usually requires sudo on Linux/Mac)
    // - ECONNREFUSED: Network interface not available

    // Log the error using Fastify's logger for better formatting
    app.log.error(err);

    // Exit the process with error code
    // Process managers (PM2, systemd, Docker) will detect this and take action
    process.exit(1);
  }
};

/**
 * Execute the start function
 * This immediately starts the server when this file is executed
 *
 * The start function is async but not awaited here
 * The async function runs in the background and keeps the process alive
 * as long as the server is listening
 */
start();
