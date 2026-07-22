/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['api.dicebear.com', 'images.unsplash.com'],
  },
  async rewrites() {
    return [
      { source: '/superhero', destination: '/superhero/index.html' },
    ];
  },
};

export default nextConfig;
