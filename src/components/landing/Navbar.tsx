"use client";

import Link from "next/link";
import { useUserRole } from "@/hooks/useUserRole";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { role } = useUserRole();
  const [open, setOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const router = useRouter();

  const dashboardHref = role === "PYME" ? "/pyme/dashboard" : "/student/dashboard";

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsSignedIn(!!user);
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#BAD8F7]">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#0D3A6E] rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">D</span>
          </div>
          <span className="text-sm font-semibold text-[#0D3A6E]">
            Dexpert<span className="text-[#38A3F1]">.</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="#about" className="text-sm text-[#5B8DB8] hover:text-[#0D3A6E] transition">About</Link>
          <Link href="#how" className="text-sm text-[#5B8DB8] hover:text-[#0D3A6E] transition">How it works</Link>
          <Link href="#plans" className="text-sm text-[#5B8DB8] hover:text-[#0D3A6E] transition">Plans</Link>
          <Link href="#faq" className="text-sm text-[#5B8DB8] hover:text-[#0D3A6E] transition">FAQ</Link>
        </div>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-3">
          {isSignedIn ? (
            <>
              <Link
                href={dashboardHref}
                className="text-sm font-medium text-[#0D3A6E] hover:text-[#38A3F1] transition"
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm font-medium text-[#5B8DB8] hover:text-red-400 transition"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm font-medium text-[#0D3A6E] hover:text-[#38A3F1] transition"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="text-sm font-medium bg-[#38A3F1] text-white px-4 py-1.5 rounded-lg hover:bg-[#0D5FA6] transition"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5 text-[#0D3A6E]" /> : <Menu className="w-5 h-5 text-[#0D3A6E]" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[#BAD8F7] bg-white px-6 py-4 flex flex-col gap-4">
          <Link href="#about" className="text-sm text-[#5B8DB8]" onClick={() => setOpen(false)}>About</Link>
          <Link href="#how" className="text-sm text-[#5B8DB8]" onClick={() => setOpen(false)}>How it works</Link>
          <Link href="#plans" className="text-sm text-[#5B8DB8]" onClick={() => setOpen(false)}>Plans</Link>
          <Link href="#faq" className="text-sm text-[#5B8DB8]" onClick={() => setOpen(false)}>FAQ</Link>
          {isSignedIn ? (
            <>
              <Link href={dashboardHref} className="text-sm font-medium text-[#0D3A6E]">Dashboard</Link>
              <button onClick={handleSignOut} className="text-sm font-medium text-red-400 text-left">Sign out</button>
            </>
          ) : (
            <Link href="/sign-up" className="text-sm font-medium bg-[#38A3F1] text-white px-4 py-2 rounded-lg text-center">
              Get started
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}