// BB-03 §3 — next.config.ts (exact spec)
import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  typescript: {
    ignoreBuildErrors: true,
  },
};

initOpenNextCloudflareForDev();
export default nextConfig;
