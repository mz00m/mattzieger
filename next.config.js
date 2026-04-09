/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/nightsky',
        destination: '/nightsky/index.html',
      },
    ];
  },
};

module.exports = nextConfig;
