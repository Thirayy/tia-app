import type { NextConfig } from 'next';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

const nextConfig: NextConfig = {
  assetPrefix: '/',
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? '',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/:path*`,
      },
      {
        source: '/musyrif/:path*',
        destination: `${BACKEND_URL}/musyrif/:path*`,
      },
      {
        source: '/admin/:path*',
        destination: `${BACKEND_URL}/admin/:path*`,
      },
    ];
  },
};

export default nextConfig;
