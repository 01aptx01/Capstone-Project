import type { NextConfig } from "next";
import path from "path";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(path.resolve(__dirname, "../.."));

const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(
  /\/$/,
  ""
);

function productImageRemotePatterns() {
  try {
    const u = new URL(apiBase);
    const protocol = u.protocol === "https:" ? "https" : "http";
    return [
      {
        protocol: protocol as "http" | "https",
        hostname: u.hostname,
        ...(u.port ? { port: u.port } : {}),
        pathname: "/product/img/**",
      },
    ];
  } catch {
    return [
      {
        protocol: "http" as const,
        hostname: "localhost",
        port: "8000",
        pathname: "/product/img/**",
      },
    ];
  }
}

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/product/img/:path*",
        destination: `${apiBase}/product/img/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: productImageRemotePatterns(),
    unoptimized: true,
  },
};

export default nextConfig;
