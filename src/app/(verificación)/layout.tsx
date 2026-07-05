"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white border-b border-[#BAD8F7]">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            
            <Image src="/X.svg" alt="Dexpert" width={200} height={50} className="w-40" />
          </Link>
          <Link
            href="/verify"
            className="flex items-center gap-1.5 text-sm text-[#5B8DB8] hover:text-[#0D3A6E] transition"
          >
            <ArrowLeft className="w-4 h-4" /> Regresar
          </Link>
        </div>
      </nav>
      {children}
    </div>
  );
}