import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React Strict Mode for better development experience
  reactStrictMode: true,

  // Configure images
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },

  // Experimental features
  experimental: {
    // Enable typed routes for better type safety
    typedRoutes: true,
  },
};

export default nextConfig;
