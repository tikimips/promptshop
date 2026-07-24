/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['api.dicebear.com', 'images.unsplash.com'],
  },
  async rewrites() {
    return [
      { source: '/superhero', destination: '/superhero/index.html' },
      { source: '/anime', destination: '/anime/index.html' },
      { source: '/cyberpunk', destination: '/cyberpunk/index.html' },
    ];
  },
};

export default nextConfig;
