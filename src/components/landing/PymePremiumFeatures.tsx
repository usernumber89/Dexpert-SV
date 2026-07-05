"use client";

import { motion } from "framer-motion";
import {
  Crown, Star, Users, BarChart3, ArrowRight, Zap,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    title: "Proyectos Destacados",
    description: "Tus proyectos aparecen primero en el feed de estudiantes con un badge especial. Máxima visibilidad para atraer al mejor talento.",
    icon: Star,
    color: "#38A3F1",
    bg: "#F0F7FF",
    border: "#BAD8F7",
    plan: "GROWTH",
  },
  {
    title: "Talent Pool",
    description: "Guardá estudiantes prometedores en tu lista personal. Agregales notas y contactalos cuando tengas el proyecto ideal para ellos.",
    icon: Users,
    color: "#38A3F1",
     bg: "#F0F7FF",
    border: "#BAD8F7",
    plan: "GROWTH",
  },
  {
    title: "Analítica de Proyectos",
    description: "Metricas claras de cada proyecto: postulaciones recibidas, perfil de los postulantes y tiempos estimados de finalizacion.",
    icon: BarChart3,
    color: "#38A3F1",
    bg: "#F0F7FF",
    border: "#BAD8F7",
    plan: "GROWTH",
  },
];

const planLabels: Record<string, string> = {
  STARTER: "Starter",
  GROWTH: "Growth",
  PRO: "Pro",
};

export function PymePremiumFeatures() {
  return (
    <section className="relative py-24 px-6 bg-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-80 h-80 bg-[#F59E0B] rounded-full opacity-[0.02] blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-[#8B5CF6] rounded-full opacity-[0.02] blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-md shadow-sm border border-[#BAD8F7] mb-5">
            <Crown className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0D5FA6]">
              Premium · Planes Growth y Pro
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#0D3A6E] mb-4">
            Más alcance,{" "}
            <span className="relative">
              <span className="relative z-10 bg-[#38A3f1] bg-clip-text text-transparent">
                mejores resultados
              </span>
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#38A3F1]/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h2>
          <p className="text-[#5B8DB8] max-w-2xl text-sm mx-auto leading-relaxed">
            Las empresas con planes Growth y Pro acceden a herramientas exclusivas para destacar sus proyectos
            y conectar con el talento adecuado más rápido.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white rounded-2xl border p-6 sm:p-7 hover:shadow-xl transition-all duration-300"
                style={{ borderColor: feat.border }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm"
                  style={{ background: feat.bg }}
                >
                  <Icon className="w-6 h-6" style={{ color: feat.color }} />
                </div>

                <h3 className="text-base font-bold text-[#0D3A6E] mb-2">{feat.title}</h3>
                <p className="text-xs text-[#5B8DB8] leading-relaxed mb-4">{feat.description}</p>

                <span
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    background: "#F0F7FF",
                    color: "#0D5FA6",
                    border: "1px solid #BAD8F7",
                  }}
                >
                  <Crown className="w-3 h-3 text-[#F59E0B]" />
                  {feat.plan === "GROWTH" ? "Growth y Pro" : "Pro"}
                </span>

                <ArrowRight
                  className="absolute bottom-5 right-5 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: feat.color }}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Plans comparison CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-gradient-to-r from-[#F0F7FF] to-white rounded-2xl border border-[#E8F3FD] shadow-sm px-8 py-5">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#38A3F1]" />
              <span className="text-sm text-[#0D3A6E] font-medium">
                Compará los planes y elegí el que mejor se adapte a tu negocio
              </span>
            </div>
            <Link
              href="/#plans"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[#0D3A6E] px-6 py-2.5 rounded-xl hover:bg-[#0D5FA6] transition-colors shadow-sm"
            >
              Ver planes
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
