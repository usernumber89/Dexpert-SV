"use client";

import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Building2 } from "lucide-react";
import Link from "next/link";

export function AboutCTA() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#F0F7FF] to-white rounded-2xl border border-[#BAD8F7] p-8 md:p-10 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-[#0D3A6E] mb-3">
            ¿Listo para ser parte del cambio?
          </h2>
          <p className="text-sm text-[#5B8DB8] max-w-lg mx-auto mb-8">
            Sea que busques tu primera oportunidad laboral o talento joven para tu empresa,
            Dexpert es el puente que necesitás.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-[#38A3F1] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#0D5FA6] transition-colors shadow-sm w-full sm:w-auto justify-center"
            >
              <GraduationCap className="w-4 h-4" />
              Soy estudiante
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-[#0D3A6E] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#0D5FA6] transition-colors shadow-sm w-full sm:w-auto justify-center"
            >
              <Building2 className="w-4 h-4" />
              Soy PYME
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
