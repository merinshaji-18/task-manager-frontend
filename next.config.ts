/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // This allows the dev server to connect to your specific network IP
    allowedDevOrigins: ['192.168.56.1', 'localhost:3000'],
  },
};

export default nextConfig;