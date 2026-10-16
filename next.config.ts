import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Allows the sandbox live-preview host to talk to the dev server.
  // Safe to keep: it only affects `next dev`, not production.
  allowedDevOrigins: ["*.e2b.app", "*.e2b.dev", "localhost", "127.0.0.1"],
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
