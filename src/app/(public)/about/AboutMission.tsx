"use client";

import { motion } from "framer-motion";
import { Goal, Telescope, HandHelping } from "lucide-react";

const items = [
  {
    icon: Goal,
    title: "Nuestra misión",
    description:
      "Cerrar la brecha entre el talento joven y la experiencia real, conectando estudiantes con micro y pequeñas empresas que necesitan apoyo en proyectos concretos.",
  },
  {
    icon: Telescope,
    title: "Nuestra visión",
    description:
      "Ser la plataforma líder de talento emergente en Centroamérica, donde cada joven pueda demostrar su potencial sin importar su experiencia previa.",
  },
  {
    icon: HandHelping,
    title: "Nuestros valores",
    description:
      "Inclusión, aprendizaje práctico, transparencia y crecimiento impulsado por la comunidad. Creemos en el poder de la oportunidad para transformar vidas.",
  },
];

export function AboutMission() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-7 border border-[#E8F3FD] hover:border-[#38A3F1]/40 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-[#F0F7FF] rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[#38A3F1]" />
                </div>
                <h3 className="text-lg font-bold text-[#0D3A6E] mb-2">{item.title}</h3>
                <p className="text-sm text-[#5B8DB8] leading-relaxed">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
