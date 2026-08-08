/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['api.dicebear.com', 'images.unsplash.com'],
  },
  async rewrites() {
    return [
      { source: '/superhero', destination: '/superhero/index.html' },
      { source: '/superhero/upload', destination: '/superhero/upload/index.html' },
      { source: '/anime', destination: '/anime/index.html' },
      { source: '/anime/upload', destination: '/anime/upload/index.html' },
      { source: '/cyberpunk', destination: '/cyberpunk/index.html' },
      { source: '/cyberpunk/upload', destination: '/cyberpunk/upload/index.html' },
      { source: '/sports', destination: '/sports/index.html' },
      { source: '/sports/upload', destination: '/sports/upload/index.html' },
      { source: '/film', destination: '/film/index.html' },
      { source: '/film/upload', destination: '/film/upload/index.html' },
      { source: '/architecture', destination: '/architecture/index.html' },
      { source: '/tveggo-gallery-26', destination: '/tveggo-gallery-26/index.html' },
      { source: '/cindy-gallery', destination: '/cindy-gallery/index.html' },
      { source: '/tveggo-gallery-26/upload', destination: '/tveggo-gallery-26/upload/index.html' },
    ];
  },
};

export default nextConfig;
