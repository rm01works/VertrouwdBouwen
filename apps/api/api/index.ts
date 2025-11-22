/**
 * Vercel Serverless Function Handler for Express API
 * 
 * This file exports the Express app as a serverless function handler
 * for Vercel deployment. All API routes are handled by the Express app.
 * 
 * Vercel's @vercel/node builder automatically handles Express apps,
 * so we can export the app directly without serverless-http wrapper.
 */

import { app } from '../src/app';

// Export the Express app directly
// Vercel's @vercel/node builder will handle the conversion
export default app;

