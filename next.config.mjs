/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: "http://13.209.15.25:8080/:path*",
      },
    ];
  },
};

export default nextConfig;