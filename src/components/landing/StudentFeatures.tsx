"use client";

import { motion } from "framer-motion";
import {
  BotMessageSquare, BookOpen, ArrowRight,
  CheckCircle2, BarChart3,
} from "lucide-react";
import Link from "next/link";

const levels = [
  {
    level: 1,
    title: "Simulación Profesional",
    subtitle: "Practicá con clientes reales simulados por IA",
    color: "#38A3F1",
    bg: "#F0F7FF",
    features: [
      "Briefs profesionales por área (Software, Diseño, Marketing, Admin, Arquitectura, Ingeniería)",
      "Clientes ficticios con personalidad y objetivos únicos",
      "Objetivos, restricciones y fechas de entrega realistas",
      "Solicitudes de cambio espontáneas del cliente",
    ],
  },
  {
    level: 2,
    title: "Evaluación y Retroalimentación",
    subtitle: "IA evalúa tu trabajo y te ayuda a mejorar",
    color: "#F59E0B",
    bg: "#FFFBEB",
    features: [
      "Evaluación automática con rúbrica por criterios",
      "Identificación de fortalezas y áreas de mejora",
      "Retroalimentación detallada y constructiva",
      "Aprendizaje continuo basado en práctica real",
    ],
  },
  {
    level: 3,
    title: "Portafolio Automático",
    subtitle: "Cada proyecto completado genera evidencia profesional",
    color: "#1D9E75",
    bg: "#E1F5EE",
    features: [
      "Registro automático con nombre, descripción y competencias",
      "Horas invertidas y resultados obtenidos documentados",
      "Habilidades demostradas visibles para empleadores",
      "Portafolio digital compartible desde el primer proyecto",
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function StudentFeatures() {
  return (
    <section className="relative py-24 px-6 bg-gradient-to-b from-white to-[#F0F7FF] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-40 left-10 w-72 h-72 bg-[#38A3F1] rounded-full opacity-[0.03] blur-3xl" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-[#8B5CF6] rounded-full opacity-[0.03] blur-3xl" />
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
            
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0D5FA6]">
              3 niveles de crecimiento
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#0D3A6E] mb-4">
            De principiante a{" "}
            <span className="relative">
              <span className="relative z-10 bg-[#38A3F1] bg-clip-text text-transparent">
                profesional
              </span>
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#38A3F1]/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h2>
          <p className="text-[#5B8DB8] max-w-2xl text-sm mx-auto leading-relaxed">
            Un camino progresivo donde simulás, aprendés, construís portafolio y accedés a proyectos reales.
            Todo en una sola plataforma, impulsado por IA.
          </p>
        </motion.div>

        {/* Levels Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="grid md:grid-cols-2 gap-5"
        >
          {levels.map((lvl) => {
            const Icon = [BotMessageSquare, BarChart3, BookOpen][lvl.level - 1];
            return (
              <motion.div
                key={lvl.level}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: lvl.level * 0.1 }}
                className="group relative bg-white rounded-2xl border border-[#E8F3FD] p-6 sm:p-7 hover:shadow-xl transition-all duration-300 overflow-hidden"
                style={{ borderColor: lvl.color + "20" }}
              >
                {/* Level number background */}
                <div
                  className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-[0.06]"
                  style={{ background: lvl.color }}
                />

                <div className="relative flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                    style={{ background: lvl.bg }}
                  >
                    <Icon className="w-6 h-6" style={{ color: lvl.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Level badge + title */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                        style={{
                          background: lvl.bg,
                          color: lvl.color,
                          borderColor: lvl.color + "40",
                        }}
                      >
                        Nivel {lvl.level}
                      </span>
                      <h3 className="text-base font-bold text-[#0D3A6E]">{lvl.title}</h3>
                    </div>
                    <p className="text-xs text-[#5B8DB8] mb-3 leading-relaxed">{lvl.subtitle}</p>

                    {/* Features */}
                    <ul className="space-y-1.5">
                      {lvl.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#0D3A6E]">
                          <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: lvl.color }} />
                          <span className="leading-relaxed">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Arrow hint on hover */}
                <div
                  className="absolute bottom-4 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ color: lvl.color }}
                >
                  <ArrowRight className="w-5 h-5" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white rounded-2xl border border-[#E8F3FD] shadow-sm px-8 py-5">
            <div className="flex items-center gap-2">
              
              <span className="text-sm text-[#0D3A6E] font-medium">
                Empezá gratis · Sin experiencia previa requerida
              </span>
            </div>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[#0D3A6E] px-6 py-2.5 rounded-xl hover:bg-[#0D5FA6] transition-colors shadow-sm"
            >
              Crear cuenta gratuita
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
