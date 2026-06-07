"use client";

import Link from "next/link";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
  Briefcase,
  Zap,
  CheckCircle,
} from "lucide-react";

const STATS = [
  { value: "500+", label: "Active Students", icon: Users },
  { value: "50+", label: "Businesses", icon: Briefcase },
  { value: "200+", label: "Projects", icon: Sparkles },
  { value: "95%", label: "Success Rate", icon: TrendingUp },
];

const PILLARS = [
  "Real projects from real businesses",
  "No experience required to apply",
  "Build your portfolio from day one",
  "Inclusive hiring — everyone welcome",
];

export function Hero() {
  const { user } = useSupabaseAuth();
  const { role } = useUserRole();

  const getDashboardHref = () => {
    if (!user) return "/auth/sign-up";
    if (role === "PYME") return "/pyme/dashboard";
    if (role === "STUDENT") return "/student/dashboard";
    return "/dashboard";
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 md:px-12 overflow-hidden bg-white">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_#E8F3FD_0%,_transparent_60%)]" />
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_#F0F7FF_0%,_transparent_60%)]" />
        {/* Floating orbs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-[#38A3F1] rounded-full opacity-[0.06] blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#0D3A6E] rounded-full opacity-[0.05] blur-3xl" />
      </div>

      <div className="relative max-w-7xl w-full mx-auto py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Columna izquierda: contenido textual */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-5xl font-bold leading-[1.1] text-[#0D3A6E] tracking-tight"
            >
              Experience is built,
              <br />
              <span className="relative inline-block mt-2">
                <TypeAnimation
                  sequence={["and we provide", 1500, "and we're the", 1500]}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                  className="text-[#38A3F1]"
                />
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#174E8C]/66 via-[#38A3F1]/53 to-[#00C4F5]/43 bg-clip-text text-transparent bg-[length:200%] animate-[shimmer_3s_linear_infinite]">
                the bricks.
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-md md:text-xl text-[#5B8DB8] leading-relaxed max-w-2xl lg:max-w-none"
            >
              Discover real projects from businesses across El Salvador. Build your
              portfolio, gain real experience, and take your first step into the
              professional world.
            </motion.p>

            {/* Pillars */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center lg:justify-start gap-3"
            >
              {PILLARS.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E8F3FD] rounded-full shadow-sm"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-[#38A3F1] flex-shrink-0" />
                  <span className="text-xs font-medium text-[#5B8DB8]">{p}</span>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4"
            >
              <Link
                href={getDashboardHref()}
                className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#0D3A6E] to-[#1D5A9E] text-white text-sm font-semibold rounded-2xl hover:shadow-xl hover:shadow-[#0D3A6E]/20 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">
                  {user ? "Go to dashboard" : "Get started free"}
                </span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#174E8C]/66 via-[#38A3F1]/53 to-[#00C4F5]/43 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>

              <Link
                href="#how"
                className="group inline-flex items-center gap-2 px-6 py-4 text-sm font-medium text-[#0D3A6E] border border-[#BAD8F7] rounded-2xl hover:border-[#38A3F1] hover:bg-[#F0F7FF] transition-all"
              >
                How it works
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Las estadísticas se pueden descomentar si se quieren mostrar dentro de la columna izquierda */}
            {/*
            <motion.div ...>
              ...
            </motion.div>
            */}
          </div>

          {/* Columna derecha: imagen */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center lg:justify-end"
          >
            <img
              src="/animation.jpeg"
              alt="Student working"
              className="w-full max-w-xl rounded-xl"
            />
          </motion.div>
        </div>
      </div>

      {/* Shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
      `}</style>
    </section>
  );
}