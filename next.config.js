/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), geolocation=(self), microphone=(self)' },
];

const nextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
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
