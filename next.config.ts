import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  dir: './src/app',
  basePath: '', // Explicitly set this (might be needed for Docker+Vercel)
  output: 'standalone', // For Docker compatibility
};

export default nextConfig;
