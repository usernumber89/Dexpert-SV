"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Rocket,
  Medal,
  Briefcase,
} from "lucide-react";
import { useAuthContext } from "@/providers/AuthProvider";

export function CallToAction() {
  const { user, isLoading: authLoading } = useAuthContext();
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setIsLoading(false);
      return;
    }
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
    <section className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-[#F8FBFF] border border-[#E8F3FD] rounded-2xl p-10 md:p-14 text-center shadow-sm"
        >
          {/* Título */}
          <h2 className="text-3xl md:text-4xl font-bold text-[#0D3A6E] mb-4">
            Ready to take the{" "}
            <span className="text-[#38A3F1]">first step</span>?
          </h2>

          {/* Descripción */}
          <p className="text-[#5B8DB8] text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Whether you are a young talent looking for experience or a small
            business needing real solutions,{" "}
            <span className="font-semibold text-[#0D3A6E]">
              Dexpert is your bridge to growth.
            </span>
          </p>

          {/* Píldoras de características */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <FeaturePill
              icon={<Rocket className="w-4 h-4" />}
              text="No experience needed"
            />
            <FeaturePill
              icon={<Medal className="w-4 h-4" />}
              text="100% Free for students"
            />
            <FeaturePill
              icon={<Briefcase className="w-4 h-4" />}
              text="Real projects"
            />
          </div>

          {/* Botón CTA */}
          {!isLoading && (
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={href}
                className="group inline-flex items-center gap-2 px-8 py-4 bg-[#0D3A6E] text-white font-semibold rounded-xl hover:bg-[#1D5A9E] transition-colors shadow-md"
              >
                <span>
                  {user ? "Go to dashboard" : "Join Dexpert now — it's free"}
                </span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function FeaturePill({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-[#F0F7FF] border border-[#BAD8F7] rounded-full text-sm text-[#0D5FA6]">
      <span className="text-[#38A3F1]">{icon}</span>
      {text}
    </div>
  );
}