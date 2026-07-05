import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: process.cwd(),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [480, 640, 768, 1024, 1280, 1536],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
        port: "",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "ehumdymyicwoourytpdj.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**"
      },
    ],
  },
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;