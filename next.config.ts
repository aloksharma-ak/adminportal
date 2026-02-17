import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow data URIs (base64 images) and external image domains if needed
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      // Add your API image domain(s) here, e.g.:
      // { protocol: "https", hostname: "api.yourdomain.com" },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [],
    },
  },
};

export default nextConfig;
