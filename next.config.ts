import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_BUILD_DIR || ".next",
  outputFileTracingIncludes: {
    "/*": ["./supabase/certs/prod-ca-2021.crt"],
  },
};

export default nextConfig;
