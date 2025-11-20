/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@vertrouwdbouwen/shared'],
  // Removed rewrites - using API route handler (app/api/[...path]/route.ts) instead
  // This prevents conflicts between Next.js rewrites and API route handlers
};

module.exports = nextConfig;

