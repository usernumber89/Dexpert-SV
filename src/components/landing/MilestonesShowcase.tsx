"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, AlertCircle, ArrowRight, GitCommitVertical } from "lucide-react";

const demoMilestones = [
  { title: "Investigación y wireframes", status: "APPROVED" as const },
  { title: "Diseño de UI en Figma", status: "APPROVED" as const },
  { title: "Desarrollo del frontend", status: "IN_REVIEW" as const },
  { title: "Integración y pruebas", status: "PENDING" as const },
];

const statusConfig = {
  APPROVED: { label: "Aprobado", icon: CheckCircle2, color: "#1D9E75", bg: "#E1F5EE" },
  IN_REVIEW: { label: "En revisión", icon: AlertCircle, color: "#D97706", bg: "#FFFBEB" },
  PENDING: { label: "Pendiente", icon: Clock, color: "#93B8D4", bg: "#F8FAFC" },
};

export function MilestonesShowcase() {
  const approved = demoMilestones.filter(m => m.status === "APPROVED").length;
  const progress = Math.round((approved / demoMilestones.length) * 100);

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-white to-[#F0F7FF]">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-md shadow-sm border border-[#BAD8F7] mb-5">
            <GitCommitVertical className="w-4 h-4 text-[#38A3F1]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0D5FA6]">
              Seguimiento de proyectos
            </span>
          </div>
          <h2 className="lg:text-3xl md:text-2xl font-bold text-[#0D3A6E] mb-3">
            Cada proyecto, <span className="text-[#38A3F1]">paso a paso</span>
          </h2>
          <p className="text-[#5B8DB8] max-w-xl text-sm mx-auto leading-relaxed">
            Estudiantes y empresas dan seguimiento al progreso real mediante hitos:
            entregables claros, revisión simple y avance visible en todo momento.
          </p>
        </motion.div>

        {/* Demo card + features */}
        <div className="grid md:grid-cols-5 gap-7 items-start">

          {/* Demo card — visual, no funcional */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-3 bg-white rounded-2xl border border-[#E8F3FD] shadow-sm p-7"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0F7FF] flex items-center justify-center text-sm font-semibold text-[#0D5FA6]">
                  G
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0D3A6E]">Sitio web — Granja Los Campos</p>
                  <p className="text-xs text-[#93B8D4]">Estudiante: María Fernández</p>
                </div>
              </div>
              <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-[#FFFBEB] text-[#D97706] border border-[#FDE9C0]">
                En revisión
              </span>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#93B8D4]">Progreso</span>
                <span className="font-medium text-[#0D3A6E]">{approved}/{demoMilestones.length} hitos</span>
              </div>
              <div className="w-full h-1.5 bg-[#F0F7FF] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${progress}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-[#38A3F1]"
                />
              </div>
            </div>

            {/* Milestones */}
            <div className="space-y-2">
              {demoMilestones.map((m, i) => {
                const cfg = statusConfig[m.status];
                const Icon = cfg.icon;
                return (
                  <motion.div
                    key={m.title}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl"
                    style={{ background: cfg.bg }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-4 h-4 shrink-0" style={{ color: cfg.color }} />
                      <span className="text-xs font-medium text-[#0D3A6E] truncate">{m.title}</span>
                    </div>
                    <span className="text-[10px] font-medium shrink-0" style={{ color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Feature list */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 flex flex-col gap-5"
          >
            {[
              {
                title: "Hitos claros",
                text: "La empresa define entregables específicos con fecha y criterios de aceptación.",
              },
              {
                title: "Evidencia en cada paso",
                text: "El estudiante sube su avance y la empresa lo revisa directamente en la plataforma.",
              },
              {
                title: "Progreso visible",
                text: "Ambos ven el avance real del proyecto, sin necesidad de reportes manuales.",
              },
            ].map((f) => (
              <div key={f.title} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F0F7FF] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-[#38A3F1]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0D3A6E] mb-0.5">{f.title}</p>
                  <p className="text-xs text-[#5B8DB8] leading-relaxed">{f.text}</p>
                </div>
              </div>
            ))}

            <a
              href="/sign-up"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#38A3F1] hover:text-[#0D5FA6] transition-colors mt-2 group"
            >
              Empieza tu primer proyecto
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}