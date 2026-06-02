import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Allow HMR from local network IPs
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  
  // Allow webpack HMR from your specific local network IP
  allowedDevOrigins: ["192.168.100.2", "localhost:3000", "192.168.100.2:3000"],

  // Image optimization
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    unoptimized: process.env.NODE_ENV === "development", // ปิด optimization ใน dev
  },

  // Webpack
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      poll: 800,
      aggregateTimeout: 300,
    };
    return config;
  },
};

export default nextConfig;