"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight, Sparkles, Zap, Users, Rocket, Star, TrendingUp, Shield 
} from "lucide-react";
import { useAuthContext } from "@/providers/AuthProvider";

export function CallToAction() {
  const { supabase, user, isLoading: authLoading } = useAuthContext();
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setIsLoading(false);
      return;
    }

    // El rol está en los metadatos (guardado durante el signUp)
    const userRole = user.user_metadata?.role as string;
    setRole(userRole || null);
    setIsLoading(false);
  }, [user]);

  const href = !user 
    ? "/sign-up" 
    : role === "PYME" 
      ? "/pyme/dashboard" 
      : "/student/dashboard";

  return (
    <section className="relative py-24 px-6 bg-white overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#38A3F1] rounded-full opacity-[0.08] blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#1D9E75] rounded-full opacity-[0.08] blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-br from-[#0D3A6E] via-[#0D4A8E] to-[#1D5A9E] rounded-3xl p-12 md:p-16 text-center overflow-hidden shadow-2xl"
        >
          {/* Contenido */}
          <div className="relative z-10">
            <motion.div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <Zap className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#BAD8F7]">
                Get started today
              </span>
            </motion.div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to take the{" "}
              <span className="text-[#38A3F1]">first step</span>?
            </h2>

            <p className="text-base md:text-lg text-[#BAD8F7] mb-8 max-w-2xl mx-auto">
              Whether you are a young talent looking for experience or a small business needing real solutions, 
              <span className="block text-white font-medium mt-2">Dexpert is your bridge to growth.</span>
            </p>

            {/* Píldoras de características */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <FeaturePill icon={<Rocket className="w-4 h-4 text-[#38A3F1]" />} text="No experience needed" />
              <FeaturePill icon={<Shield className="w-4 h-4 text-[#1D9E75]" />} text="100% Free for students" />
              <FeaturePill icon={<TrendingUp className="w-4 h-4 text-[#F59E0B]" />} text="Real projects" />
            </div>

            {/* Botón CTA */}
            {!isLoading && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href={href}
                  className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#38A3F1] to-[#1D9E75] text-white text-base font-semibold rounded-xl shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10">
                    {user ? "Go to dashboard" : "Join Dexpert now — it's free"}
                  </span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
          <StatItem icon={<Users className="w-4 h-4 text-[#38A3F1]" />} value="500+" label="Active users" />
          <StatItem icon={<Rocket className="w-4 h-4 text-[#1D9E75]" />} value="200+" label="Projects" />
          <StatItem icon={<Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />} value="4.9" label="Rating" />
        </div>
      </div>
    </section>
  );
}

function FeaturePill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-sm text-white">
      {icon} {text}
    </div>
  );
}

function StatItem({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 mb-1 font-bold text-[#0D3A6E]">
        {icon} <span className="text-xl">{value}</span>
      </div>
      <p className="text-xs text-[#93B8D4]">{label}</p>
    </div>
  );
}