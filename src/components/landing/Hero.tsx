"use client";

import Link from "next/link";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAuthContext } from "@/providers/AuthProvider";

const STATS = [
  { value: "500+", label: "Active Students" },
  { value: "50+",  label: "Businesses" },
  { value: "95%",  label: "Success Rate" },
];

export function Hero() {
  const { user } = useAuthContext();
  const { role, isLoading } = useUserRole();

  const getDashboardHref = () => {
  if (!user) return "/auth/sign-up";

  return role === "PYME"
    ? "/pyme/dashboard"
    : "/student/dashboard";
};
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 md:px-12 overflow-hidden bg-white">

      {/* ── Background ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#E8F3FD_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#F0F7FF_0%,_transparent_60%)]" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-[#38A3F1] rounded-full opacity-[0.06] blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#0D3A6E] rounded-full opacity-[0.05] blur-3xl" />
      </div>

      <div className="relative max-w-7xl w-full mx-auto py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-7">

            {/* Live badge 
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#EBF5FF] border border-[#BAD8F7] rounded-full text-xs font-semibold text-[#38A3F1] tracking-wide"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#38A3F1] animate-pulse" />
              Now live in El Salvador
            </motion.div>*/}

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold leading-[1.08] text-[#0D3A6E] tracking-tight"
            >
              La experiencia se contruye,
              <br />
              <span className="relative inline-block mt-1 text-[#38A3F1]">
                <TypeAnimation
                  sequence={["y nosotros proveemos", 1500, "y nosotros somos", 1500]}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                />
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#174E8C] via-[#38A3F1] to-[#00C4F5] bg-clip-text text-transparent bg-[length:200%] animate-[shimmer_3s_linear_infinite]">
                los ladrillos.
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base md:text-lg text-[#5B8DB8] leading-relaxed max-w-lg lg:max-w-none"
            >
            Descubre proyectos reales de empresas de todo El Salvador. Crea tu portafolio, adquiere experiencia práctica y da tus primeros pasos en el mundo profesional.
            </motion.p>

            {/* Stats — Monotree style 
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex w-full max-w-sm lg:max-w-none border-t border-[#E8F3FD] pt-5 gap-0"
            >
              {STATS.map((s, i) => (
                <div
                  key={i}
                  className={`flex-1 ${
                    i < STATS.length - 1
                      ? "pr-5 border-r border-[#E8F3FD]"
                      : "pl-5"
                  } ${i > 0 && i < STATS.length - 1 ? "px-5" : ""}`}
                >
                  <p className="text-2xl md:text-3xl font-extrabold text-[#0D3A6E] tracking-tight leading-none">
                    {s.value}
                  </p>
                  <p className="text-xs text-[#8FB8D8] mt-1 font-medium">{s.label}</p>
                </div>
              ))}
            </motion.div>*/}

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3"
            >
              <Link
                href={getDashboardHref()}
                className="group relative inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#0D3A6E] to-[#1D5A9E] text-white text-sm font-semibold rounded-2xl hover:shadow-xl hover:shadow-[#0D3A6E]/20 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">
                  {user ? "Ir al panel de control" : "Comenzar gratis"}
                </span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#174E8C]/60 via-[#38A3F1]/50 to-[#00C4F5]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>

              <Link
                href="#how"
                className="group inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium text-[#0D3A6E] border border-[#BAD8F7] rounded-2xl hover:border-[#38A3F1] hover:bg-[#F0F7FF] transition-all"
              >
                ¿Cómo funciona?
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN — macOS window ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-[580px] animate-[floatY_4s_ease-in-out_infinite]">
              {/* Outer aluminum frame */}
              <div
                className="rounded-2xl p-[3px]"
                style={{
                  background: "#e2e2e2",
                  boxShadow:
                    "0 40px 80px rgba(13,58,110,0.18), 0 10px 30px rgba(56,163,241,0.10), inset 0 1px 0 rgba(255,255,255,0.8)",
                }}
              >
                {/* Screen bezel */}
                <div className="bg-[#38A3F1] rounded-[14px] overflow-hidden">

                  {/* Title bar */}
                  <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0D3A6E] border-b border-[#333]">
                    <span className="w-[11px] h-[11px] rounded-full bg-[#ff5f57]" />
                    <span className="w-[11px] h-[11px] rounded-full bg-[#ffbd2e]" />
                    <span className="w-[11px] h-[11px] rounded-full bg-[#28c840]" />
                    <span className="flex-1 text-center text-[11px] text-white font-medium" style={{ marginRight: 52 }}>
                     Tu Dexpert en acción
                    </span>
                  </div>

                  {/* Content — swap src with any image you want */}
                  <div className="aspect-[16/10] overflow-hidden bg-[#12131a]">
                    <img
                      src="/animation.jpeg"
                      alt="App preview"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>

                {/* Chin / stand notch */}
                <div
                  className="flex items-center justify-center h-5 rounded-b-[13px]"
                  style={{ background: "linear-gradient(180deg,#d0d0d0,#c8c8c8)" }}
                >
                  <div className="w-14 h-[3px] rounded-full bg-black/10" />
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Shimmer + float keyframes */}
      <style jsx>{`
        @keyframes shimmer {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-10px); }
        }
      `}</style>
    </section>
  );
}