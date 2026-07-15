"use client";

import { motion } from "framer-motion";
import { Users, Briefcase, Award, Building2 } from "lucide-react";

const stats = [
  { icon: Users, value: "500+", label: "Estudiantes registrados" },
  { icon: Building2, value: "50+", label: "PYMEs activas" },
  { icon: Briefcase, value: "100+", label: "Proyectos publicados" },
  { icon: Award, value: "85%", label: "Tasa de finalización" },
];

export function AboutStats() {
  return (
    <section className="py-16 px-6 bg-gradient-to-r from-[#F0F7FF] to-[#E8F3FD]">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-[#BAD8F7]">
                  <Icon className="w-6 h-6 text-[#38A3F1]" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-[#0D3A6E]">{s.value}</p>
                <p className="text-xs text-[#5B8DB8] mt-1">{s.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
