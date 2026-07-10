import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import {AuthProvider} from "@/providers/AuthProvider";
import { outfit } from "@/lib/fonts";
import { OfflineDetector } from "@/components/shared/OfflineDetector";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dexpert.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Dexpert — Conectando talento joven con pequeñas empresas en El Salvador",
    template: "%s | Dexpert",
  },
  description: "Dexpert conecta a jóvenes talentos con pequeñas empresas en El Salvador a través de proyectos reales. Encuentra oportunidades de crecimiento y desarrollo profesional.",
  keywords: [
    "Dexpert",
    "talento joven",
    "pequeñas empresas",
    "El Salvador",
    "oportunidades de crecimiento",
    "desarrollo profesional",
    "proyectos reales",
    "empleo",
    "prácticas",
    "pasantías",
  ],
  authors: [{ name: "Dexpert" }],
  creator: "Dexpert",
  publisher: "Dexpert",
  openGraph: {
    type: "website",
    locale: "es_SV",
    siteName: "Dexpert",
    title: "Dexpert — Talento joven para pequeñas empresas en El Salvador",
    description: "Conectamos jóvenes talentos con pequeñas empresas salvadoreñas a través de proyectos reales.",
    url: siteUrl,
    images: [{ url: "/Logo.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dexpert — Talento joven para pequeñas empresas",
    description: "Conectamos jóvenes talentos con pequeñas empresas salvadoreñas.",
    images: ["/Logo.png"],
  },
  icons: {
    icon: "/1.svg",
    apple: "/icono.png",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "",
  },
  category: "technology",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={outfit.className}>

       <AuthProvider>{children}</AuthProvider> 
        <OfflineDetector />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}