"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Goal, Telescope, HandHelping } from "lucide-react";
import { outfit } from "@/lib/fonts";
const HIGHLIGHTS = [
  {
    icon: Goal,
    title: "Nuestra misión",
    description: "Cerrar la brecha entre el talento joven y la experiencia real, conectándolos con empresas que necesitan apoyo.",
  },
  {
    icon: Telescope,
    title: "Nuestra visión",
    description: "Ser la plataforma líder de talento emergente en Centroamérica.",
  },
  {
    icon: HandHelping,
    title: "Nuestros valores",
    description: "Inclusión, aprendizaje práctico y crecimiento impulsado por la comunidad.",
  },
];

const FEATURES = [
  "Proyectos reales, no simulaciones",
  "Portafolio profesional desde el primer proyecto",
  "Mentoría de IA disponible 24/7",
  "Certificados al completar cada proyecto",
  "Participación flexible y remota",
  "100% gratuito para estudiantes",
];

export function Aboutus() {
  return (
    <section id="about" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className={` text-3xl md:text-4xl font-bold text-[#0D3A6E] mb-3`}>
            Creemos en <span className="text-[#38A3F1]">lo que puedes ser</span>
          </h2>
          <p className="text-[#5B8DB8] max-w-xl text-sm mx-auto leading-relaxed">
            Cerramos la brecha entre el talento y las oportunidades reales en El Salvador.
          </p>
        </motion.div>

        {/* Mission / Vision / Values */}
        <div className="grid md:grid-cols-3 gap-5 mb-20">
          {HIGHLIGHTS.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="bg-white rounded-2xl p-6 border border-[#E8F3FD] hover:border-[#38A3F1] transition-colors duration-300"
            >
              <div className="w-10 h-10 bg-[#F0F7FF] rounded-xl flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5 text-[#38A3F1]" />
              </div>
              <h3 className="text-base font-semibold text-[#0D3A6E] mb-1.5">{item.title}</h3>
              <p className="text-sm text-[#5B8DB8] leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Description + features */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-lg text-[#0D3A6E] leading-relaxed mb-5 font-medium">
              Dexpert es una plataforma que conecta a jóvenes sin experiencia laboral
              con micro y pequeñas empresas, permitiéndoles participar en proyectos reales,
              construir portafolio y desarrollar habilidades profesionales.
            </p>
            <p className="text-sm text-[#5B8DB8] leading-relaxed">
              Creemos que todos merecen una oportunidad para demostrar su potencial.
              Nuestra plataforma da las herramientas, mentoría y oportunidades necesarias
              para transformar conocimiento teórico en experiencia práctica.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[#F8FBFF] rounded-2xl border border-[#E8F3FD] p-7"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {FEATURES.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#38A3F1] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-[#0D3A6E] leading-snug">{feature}</span>
                </motion.div>
              ))}
            </div>

            <Link
              href="#contact"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#38A3F1] hover:text-[#0D5FA6] transition-colors mt-6"
            >
              Contáctanos
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}