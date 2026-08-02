import type { NextConfig } from 'next';

// ✅ Pastikan TANPA slash di akhir
const BACKEND_URL = (process.env.BACKEND_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

const nextConfig: NextConfig = {
  allowedDevOrigins: [ "localhost:3000", "localhost", "127.0.0.1:3000" ],
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