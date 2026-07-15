"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const features = [
  "Proyectos reales con PYMEs salvadoreñas",
  "Portafolio profesional desde el primer proyecto",
  "Mentoría de IA disponible 24/7",
  "Certificados al completar cada proyecto",
  "Simulador con clientes ficticios impulsado por IA",
  "100% gratuito para estudiantes",
  "Tablero Kanban para organizar tareas",
  "Evaluación automática con retroalimentación",
];

export function AboutTeam() {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white to-[#F0F7FF]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-[#0D3A6E] mb-3">
            Todo lo que ofrecemos
          </h2>
          <p className="text-sm text-[#5B8DB8] max-w-lg mx-auto">
            Una plataforma completa para que el talento joven demuestre su potencial
            y las PYMEs encuentren el apoyo que necesitan.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feat, i) => (
            <motion.div
              key={feat}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-2.5 bg-white rounded-xl border border-[#E8F3FD] p-4 hover:border-[#38A3F1]/30 hover:shadow-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-[#38A3F1] shrink-0 mt-0.5" />
              <span className="text-sm text-[#0D3A6E] leading-snug">{feat}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
