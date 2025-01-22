/** @type {import('next').NextConfig} */

const path = require('path');

const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: `/${process.env.NEXT_PUBLIC_GCP_BUCKET}/**`,
      },
      {
        hostname: "avatars.githubusercontent.com",
      }
    ],
  },
  optimizeFonts: true,
};

module.exports = nextConfig;
