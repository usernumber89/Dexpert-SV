import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import {AuthProvider} from "@/providers/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dexpert — Real experience for real people",
  description: "Connect young talent with small businesses across El Salvador.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>

       <AuthProvider>{children}</AuthProvider> 
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}