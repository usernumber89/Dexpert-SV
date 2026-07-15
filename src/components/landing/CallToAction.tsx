"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  GraduationCap,
  Building2,
  Rocket,
  Medal,
  Briefcase,
} from "lucide-react";

export function CallToAction() {
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
            Listo para tomar el{" "}
            <span className="text-[#38A3F1]">primer paso</span>?
          </h2>

          {/* Descripción */}
          <p className="text-[#5B8DB8] text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            No importa si querés experiencia profesional o necesitás talento para tu negocio,{" "}
            <span className="font-semibold text-[#0D3A6E]">
              Dexpert es tu puente al crecimiento.
            </span>
          </p>

          {/* Píldoras de características */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <FeaturePill
              icon={<Rocket className="w-4 h-4" />}
              text="Sin experiencia previa"
            />
            <FeaturePill
              icon={<Medal className="w-4 h-4" />}
              text="100% gratis para estudiantes"
            />
            <FeaturePill
              icon={<Briefcase className="w-4 h-4" />}
              text="Proyectos reales de empresas SV"
            />
          </div>

          {/* Dual CTA */}
          <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            <Link
              href="/sign-up"
              className="group flex flex-col items-center gap-2 px-6 py-5 bg-[#38A3F1] text-white rounded-xl hover:shadow-lg hover:shadow-[#38A3F1]/25 transition-all"
            >
              <GraduationCap className="w-6 h-6" />
              <span className="text-sm font-semibold">Soy estudiante</span>
              <span className="text-[10px] text-white/80">Quiero experiencia real</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform mt-1" />
            </Link>

            <Link
              href="/sign-up"
              className="group flex flex-col items-center gap-2 px-6 py-5 bg-[#0D3A6E] text-white rounded-xl hover:bg-[#1D5A9E] transition-all"
            >
              <Building2 className="w-6 h-6" />
              <span className="text-sm font-semibold">Soy PYME</span>
              <span className="text-[10px] text-white/80">Busco talento para mi negocio</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform mt-1" />
            </Link>
          </div>
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
