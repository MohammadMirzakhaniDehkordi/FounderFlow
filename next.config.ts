import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for Firebase Hosting
  output: "export",
  // Add empty turbopack config to silence error
  turbopack: {},
  // Transpile react-pdf packages
  transpilePackages: ["@react-pdf/renderer"],
  // Trailing slash for static hosting compatibility
  trailingSlash: true,
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
