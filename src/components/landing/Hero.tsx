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
  { value: "50+",  label: "Businesses",      icon: Briefcase },
  { value: "200+", label: "Projects",         icon: Sparkles },
  { value: "95%",  label: "Success Rate",     icon: TrendingUp },
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
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(#0D3A6E 1px, transparent 1px), linear-gradient(90deg, #0D3A6E 1px, transparent 1px)",
            backgroundSize: "64px 64px"
          }}
        />
        {/* Floating orbs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-[#38A3F1] rounded-full opacity-[0.06] blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#0D3A6E] rounded-full opacity-[0.05] blur-3xl" />
      </div>

      <div className="relative max-w-4xl w-full mx-auto text-center space-y-10 py-24">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#BAD8F7] rounded-full shadow-sm"
        >
          <Zap className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#0D3A6E]">
            Inclusive talent platform — El Salvador
          </span>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-[#0D3A6E] tracking-tight">
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
            <span className="bg-gradient-to-r from-[#38A3F1] via-[#1D9E75] to-[#38A3F1] bg-clip-text text-transparent bg-[length:200%] animate-[shimmer_3s_linear_infinite]">
              the bricks.
            </span>
          </h1>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-[#5B8DB8] leading-relaxed max-w-2xl mx-auto"
        >
          Discover real projects from businesses across El Salvador. Build your portfolio,
          gain real experience, and take your first step into the professional world.
        </motion.p>

        {/* Pillars */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {PILLARS.map((p, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E8F3FD] rounded-full shadow-sm"
            >
              <CheckCircle className="w-3.5 h-3.5 text-[#1D9E75] flex-shrink-0" />
              <span className="text-xs font-medium text-[#5B8DB8]">{p}</span>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href={getDashboardHref()}
            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#0D3A6E] to-[#1D5A9E] text-white text-sm font-semibold rounded-2xl hover:shadow-xl hover:shadow-[#0D3A6E]/20 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10">
              {user ? "Go to dashboard" : "Get started free"}
            </span>
            <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#38A3F1] to-[#1D9E75] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>

          <Link
            href="#how"
            className="group inline-flex items-center gap-2 px-6 py-4 text-sm font-medium text-[#0D3A6E] border border-[#BAD8F7] rounded-2xl hover:border-[#38A3F1] hover:bg-[#F0F7FF] transition-all"
          >
            How it works
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="w-24 h-px bg-gradient-to-r from-transparent via-[#BAD8F7] to-transparent mx-auto"
        />

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto"
        >
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                whileHover={{ y: -4 }}
                className="group flex flex-col items-center gap-2 p-4 bg-white border border-[#E8F3FD] rounded-2xl hover:border-[#BAD8F7] hover:shadow-lg transition-all"
              >
                <div className="w-9 h-9 bg-[#F0F7FF] rounded-xl flex items-center justify-center group-hover:bg-[#E8F3FD] transition-colors">
                  <Icon className="w-4 h-4 text-[#38A3F1]" />
                </div>
                <span className="text-2xl font-bold text-[#0D3A6E]">{stat.value}</span>
                <span className="text-[11px] text-[#93B8D4] text-center">{stat.label}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </section>
  );
}