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
      { source: '/sports', destination: '/sports/index.html' },
      { source: '/film', destination: '/film/index.html' },
      { source: '/architecture', destination: '/architecture/index.html' },
      { source: '/tveggo-gallery-26', destination: '/tveggo-gallery-26/index.html' },
    ];
  },
};

export default nextConfig;
