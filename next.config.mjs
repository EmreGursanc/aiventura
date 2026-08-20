/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Dev ortamındaki çift render ve hydration hatalarını engeller
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
