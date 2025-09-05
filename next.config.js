/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    //
  },
  images: {
    domains: ['images.unsplash.com', 'ui-avatars.com'],
  },
  distDir: '.next-local',
}

module.exports = nextConfig 