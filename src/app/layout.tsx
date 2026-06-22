import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import {AuthProvider} from "@/providers/AuthProvider";
import {Briefcase, User} from "lucide-react";
import { outfit } from "@/lib/fonts";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dexpert — Conectando talento joven con pequeñas empresas en El Salvador",
  description: "Dexpert es una plataforma que conecta a jóvenes talentos con pequeñas empresas en El Salvador, ofreciendo oportunidades de crecimiento y desarrollo profesional a través de proyectos reales.",
  keywords: [
    "Dexpert",
    "talento joven",
    "pequeñas empresas",
    "El Salvador",
    "oportunidades de crecimiento",
    "desarrollo profesional",
    "proyectos reales",
    "empleo",
  ],
  icons: {
    icon: "/1.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={outfit.className}>

       <AuthProvider>{children}</AuthProvider> 
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}