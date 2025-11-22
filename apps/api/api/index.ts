/**
 * Vercel Serverless Function Handler for Express API
 * 
 * This file exports the Express app as a serverless function handler
 * for Vercel deployment. All API routes are handled by the Express app.
 * 
 * Vercel's @vercel/node builder automatically handles Express apps,
 * so we can export the app directly without serverless-http wrapper.
 * 
 * IMPORTANT: We add process-level error handlers to catch unhandled promise rejections
 * and uncaught exceptions, ensuring we always return proper JSON responses.
 */

import { app } from '../src/app';

// Handle unhandled promise rejections (common in async code)
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
  console.error('   Promise:', promise);
  // Don't exit in serverless - let Vercel handle it
});

// Handle uncaught exceptions (shouldn't happen, but safety net)
process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('   Stack:', error.stack);
  // Don't exit in serverless - let Vercel handle it
});

// Export the app
export default app;

