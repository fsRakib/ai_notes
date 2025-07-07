/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
    formats: ["image/webp"],
    minimumCacheTTL: 60,
  },
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.dev https://*.clerk.accounts.dev;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              img-src 'self' https://img.clerk.com data:;
              font-src 'self' https://fonts.gstatic.com data:;
              connect-src *;
              frame-src *;
            `
              .replace(/\s{2,}/g, " ")
              .trim(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
