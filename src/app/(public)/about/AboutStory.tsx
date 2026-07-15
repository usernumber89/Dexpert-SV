"use client";

import { motion } from "framer-motion";
import { Lightbulb, Rocket, Users2, Zap } from "lucide-react";

const timeline = [
  {
    icon: Lightbulb,
    title: "El problema",
    description:
      "En El Salvador, miles de jóvenes terminan sus estudios sin experiencia laboral. Las empresas piden 1-2 años de experiencia, pero nadie da la primera oportunidad. Los jóvenes quedan atrapados en un ciclo sin salida.",
    color: "#F59E0B",
    bg: "#FFFBEB",
  },
  {
    icon: Rocket,
    title: "La idea",
    description:
      "Decidimos construir el puente que falta: una plataforma donde estudiantes puedan demostrar su talento en proyectos reales con PYMEs, sin importar su experiencia previa. Aprenden haciendo, construyen portafolio y ganan referencias.",
    color: "#38A3F1",
    bg: "#F0F7FF",
  },
  {
    icon: Users2,
    title: "La comunidad",
    description:
      "Hoy somos una comunidad creciente de estudiantes, mentores y pequeñas empresas que creen en el talento sin experiencia. Cada proyecto completado es una puerta que se abre para alguien que solo necesitaba una oportunidad.",
    color: "#1D9E75",
    bg: "#E1F5EE",
  },
  {
    icon: Zap,
    title: "El futuro",
    description:
      "Seguimos expandiendo la plataforma con simulaciones IA, portafolio automático, certificados verificables y más herramientas para que cada joven salvadoreño pueda demostrar su potencial al mundo.",
    color: "#8B5CF6",
    bg: "#F3F0FF",
  },
];

export function AboutStory() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-[#0D3A6E] mb-3">
            Nuestra{" "}
            <span className="text-[#38A3F1]">historia</span>
          </h2>
          <p className="text-sm text-[#5B8DB8] max-w-lg mx-auto">
            Cómo pasamos de una idea a una plataforma que está cambiando la forma en que
            el talento joven encuentra su primera oportunidad.
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#E8F3FD] hidden md:block" />

          <div className="space-y-10">
            {timeline.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative pl-0 md:pl-16"
                >
                  <div
                    className="hidden md:flex absolute left-4 top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm items-center justify-center"
                    style={{ background: item.color }}
                  />

                  <div
                    className="rounded-2xl border p-6 hover:shadow-md transition-shadow"
                    style={{
                      background: item.bg,
                      borderColor: item.color + "30",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: item.color + "20" }}
                      >
                        <Icon className="w-5 h-5" style={{ color: item.color }} />
                      </div>
                      <h3 className="text-base font-bold text-[#0D3A6E]">{item.title}</h3>
                    </div>
                    <p className="text-sm text-[#5B8DB8] leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
