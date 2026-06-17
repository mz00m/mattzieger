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
      {
        source: '/workforce-3d',
        destination: '/workforce-3d/index.html',
      },
      {
        source: '/escapement',
        destination: '/escapement/index.html',
      },
    ];
  },
};

module.exports = nextConfig;
