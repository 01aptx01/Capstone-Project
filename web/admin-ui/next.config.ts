import type { NextConfig } from "next";

const apiBase = (
  process.env.NEXT_PUBLIC_ADMIN_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/product/img/:path*",
        destination: `${apiBase}/product/img/:path*`,
      },
    ];
  },
};

export default nextConfig;
