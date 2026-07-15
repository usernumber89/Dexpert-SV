"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function AboutHero() {
  return (
    <section className="relative pt-32 pb-20 px-6 bg-gradient-to-b from-[#F0F7FF] to-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-80 h-80 bg-[#38A3F1] rounded-full opacity-[0.04] blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#8B5CF6] rounded-full opacity-[0.03] blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-md shadow-sm border border-[#BAD8F7] mb-6"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-[#0D5FA6]">
            Conocé Dexpert
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-bold text-[#0D3A6E] mb-6 leading-tight"
        >
          Creemos en el talento que{" "}
          <span className="text-[#38A3F1]">todavía no tuvo su oportunidad</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base md:text-lg text-[#5B8DB8] max-w-2xl mx-auto leading-relaxed mb-8"
        >
          Dexpert nació con una convicción: en El Salvador hay miles de jóvenes con talento,
          ganas de aprender y capacidad de resolver problemas. Lo único que les falta es
          un puente hacia la experiencia real.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-4"
        >
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[#38A3F1] px-6 py-3 rounded-xl hover:bg-[#0D5FA6] transition-colors shadow-sm"
          >
            Quiero ser parte
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/#features"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0D3A6E] bg-white px-6 py-3 rounded-xl border border-[#BAD8F7] hover:border-[#38A3F1] transition-colors"
          >
            Explorar plataforma
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
