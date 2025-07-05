// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "img.clerk.com",
//       },
//     ],
//   },
// };

// export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Required for Azure App Service deployment
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
    // Add these for better Azure compatibility:
    formats: ['image/webp'], // Modern format
    minimumCacheTTL: 60, // Cache for at least 60 seconds
  },
  // Enable React Strict Mode (recommended)
  reactStrictMode: true,
  // Add if you get CORS errors:
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; img-src 'self' img.clerk.com data:;",
          },
        ],
      },
    ];
  }
};

export default nextConfig;