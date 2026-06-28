import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable server external packages for database and auth
  serverExternalPackages: ["pg", "bcryptjs"],

  // Optimize for production
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // TypeScript strict checking
  typescript: {
    // Set to false in production to catch errors early
    ignoreBuildErrors: false,
  },

  // ESLint
  eslint: {
    // Don't block builds during development iteration
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
