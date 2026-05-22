/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/nightsky',
        destination: '/nightsky/index.html',
      },
      {
        source: '/workforce',
        destination: '/workforce/index.html',
      },
    ];
  },
};

module.exports = nextConfig;
