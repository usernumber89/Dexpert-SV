import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: process.cwd(),
  },
  images: {
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
  // 🚀 Evita que el empaquetador de Next.js rompa las rutas internas de las fuentes de PDFKit
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;