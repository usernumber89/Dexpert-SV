"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useUserRole } from "@/hooks/useUserRole";

export function CallToAction() {
  const { isSignedIn } = useAuth();
  const { role } = useUserRole();
  const href = !isSignedIn ? "/sign-up" : role === "PYME" ? "/pyme/dashboard" : "/student/dashboard";

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-3xl mx-auto bg-[#0D3A6E] rounded-2xl p-12 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-[#38A3F1] mb-4">Get started today</p>
        <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
          Ready to take the first step?
        </h2>
        <p className="text-sm text-[#BAD8F7] mb-8 max-w-md mx-auto leading-relaxed">
          Whether you are a young talent looking for experience or a small business needing real solutions,
          Dexpert is your bridge to growth.
        </p>
        <Link
          href={href}
          className="inline-block bg-[#38A3F1] text-white text-sm font-medium px-8 py-3 rounded-xl hover:bg-[#0D5FA6] transition"
        >
          {isSignedIn ? "Go to dashboard" : "Join us now"}
        </Link>
        <p className="text-xs text-[#5B8DB8] mt-4">
          Your talent is enough. Experience starts here.
        </p>
      </div>
    </section>
  );
}