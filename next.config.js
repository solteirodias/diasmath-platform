/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        {
          source: "/sprint/:path*",
          destination: "/sprint/_shell.html",
        },
      ],
    };
  },
};

module.exports = nextConfig;
