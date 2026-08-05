import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["knex"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
