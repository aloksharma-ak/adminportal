import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // optional: use only if needed
      allowedOrigins: [],
    },
  },
};

export default nextConfig;
