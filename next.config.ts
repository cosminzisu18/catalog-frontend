import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    agentUpgrade: "security",
    instantInsights: {
      // dashboards are client-side + auth, so avoid false positives on segments
      validationLevel: "manual-warning",
    },
  },
  turbopack: {
    // pin the root so a package-lock.json outside the repo
    // is not picked up by mistake
    root: path.join(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
