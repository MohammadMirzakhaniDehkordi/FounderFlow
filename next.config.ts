import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add empty turbopack config to silence error
  turbopack: {},
  // Transpile react-pdf packages
  transpilePackages: ["@react-pdf/renderer"],
  // Headers for Firebase Auth popup to work correctly
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
