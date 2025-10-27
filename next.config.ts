import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  serverExternalPackages: ['@prisma/client', 'bcrypt'],
};

export default nextConfig;
