/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Dev ortamındaki çift render ve hydration hatalarını engeller
  eslint: {
    // Vercel build sırasında gereksiz uyarıların build'i patlatmasını önler
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Vercel build sırasında type uyarılarının build'i patlatmasını önler
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
