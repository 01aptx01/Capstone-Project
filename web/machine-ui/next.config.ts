import type { NextConfig } from "next";
import path from "path";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(path.resolve(__dirname, "../.."));

const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(
  /\/$/,
  ""
);

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
