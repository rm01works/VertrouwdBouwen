/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@vertrouwdbouwen/shared'],
  output: 'standalone',
};

module.exports = nextConfig;

