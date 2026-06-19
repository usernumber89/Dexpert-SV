import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
        port: "",
        pathname: "/**"
      },
    ],
  },
  // 🚀 Evita que el empaquetador de Next.js rompa las rutas internas de las fuentes de PDFKit
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;