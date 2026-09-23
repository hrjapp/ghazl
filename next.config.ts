import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // النطاق الفرعي للمشروع على السيرفر: https://ai-hrj.xyz/ghazl
  basePath: "/ghazl",
  // الصور الخارجية (Unsplash وغيرها)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
