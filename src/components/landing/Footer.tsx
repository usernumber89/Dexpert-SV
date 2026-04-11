"use client";

import {  MailIcon } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer id="contact" className="bg-[#0D3A6E] text-white px-6 py-12">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#38A3F1] rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">D</span>
          </div>
          <span className="text-sm font-semibold text-white">
            Dexpert<span className="text-[#38A3F1]">.</span>
          </span>
        </div>

        <nav className="flex flex-wrap justify-center gap-6">
          {[
            { href: "/privacy", label: "Privacy Policy" },
            { href: "/terms", label: "Terms and conditions" },
            { href: "#faq", label: "FAQ" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-[#BAD8F7] hover:text-white transition">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="w-16 border-t border-white/10" />

        <div className="flex gap-6 justify-center">
          <a href="mailto:dexpertwork@gmail.com" className="flex items-center gap-2 text-sm text-[#BAD8F7] hover:text-white transition">
            <MailIcon className="w-4 h-4" /> dexpertwork@gmail.com
          </a>
          <a href="https://www.instagram.com/dexpert.sv" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#BAD8F7] hover:text-white transition">
             Instagram
          </a>
        </div>

        <p className="text-xs text-[#5B8DB8]">© 2025 Dexpert. All rights reserved.</p>
      </div>
    </footer>
  );
}