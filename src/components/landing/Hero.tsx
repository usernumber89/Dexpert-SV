"use client";

import Image from "next/image";
import Link from "next/link";
import { useUserRole } from "@/hooks/useUserRole";
import { TypeAnimation } from "react-type-animation";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

import { outfit } from "@/lib/fonts";
import { useAuthContext } from "@/providers/AuthProvider";

export function Hero() {
  const { user } = useAuthContext();
  const { role } = useUserRole();

  // Mantiene la lógica de enrutamiento intacta
  const getDashboardHref = () => {
    if (!user) return "/sign-up";
    return role === "PYME" ? "/pyme/dashboard" : "/student/dashboard";
  };

  // Variantes de animación para un efecto de aparición en cascada
  const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  }
};;

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-6 md:px-12 bg-white overflow-hidden">
      {/* ── Fondo Minimalista ── */}
      {/* Se redujeron los gradientes pesados por un destello sutil y elegante que no distrae */}
      <div className="absolute inset-0 pointer-events-none flex justify-center items-center">
        <div className="w-[800px] h-[800px] bg-gradient-to-tr from-[#F0F7FF] to-transparent rounded-full opacity-40 blur-[100px] translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="relative max-w-7xl w-full mx-auto py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* ── COLUMNA IZQUIERDA: Texto y CTAs ── */}
          <motion.div 
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.15 }}
            className="flex flex-col items-center lg:items-start text-center lg:text-left gap-8"
          >
            {/* Título Principal */}
            <motion.h1
              variants={fadeUpVariant}
              className={`${outfit.className} text-4xl text-[#0c3364] sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight`}
            >
              Construí tu futuro <br className="hidden sm:block" />
              profesional <br />
              <span className="text-[#38A3F1] font-medium">
                <TypeAnimation
                  sequence={[
                    "con proyectos reales.",
                    2500,
                    
                    "sin experiencia previa",
                    2500,
                  ]}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                />
              </span>
            </motion.h1>

            {/* Descripción */}
            <motion.p
              variants={fadeUpVariant}
              className="text-base md:text-lg text-slate-500 leading-relaxed max-w-lg font-light"
            >
              Descubrí proyectos de empresas salvadoreñas, creá tu portafolio y
              adquirí experiencia práctica. Somos el puente directo entre tu talento y
              las oportunidades del mundo real.
            </motion.p>

            {/* Botones (CTAs) */}
            <motion.div
              variants={fadeUpVariant}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-2"
            >
              <Link
                href={getDashboardHref()}
                className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-[#0D3A6E] text-white text-sm font-medium rounded-full hover:bg-slate-900 transition-colors duration-300 shadow-sm"
              >
                {user ? "Ir al panel de control" : "Comenzar gratis"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="#how"
                className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors duration-300"
              >
                <Play className="w-4 h-4 text-[#38A3F1]" />
                Ver cómo funciona
              </Link>
            </motion.div>
          </motion.div>

          {/* ── COLUMNA DERECHA: Imagen de previsualización ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex justify-center lg:justify-end relative"
          >
            {/* Contenedor flotante sutil */}
            <div className="w-full max-w-[540px] relative z-10 animate-[floatY_6s_ease-in-out_infinite]">
              <div className="rounded-3xl overflow-hidden shadow-[0_20px_50px_-12px_rgba(13,58,110,0.1)] border border-slate-100 bg-white">
                <Image
                  src="/animation.jpeg"
                  alt="Previsualización de la plataforma"
                  width={540}
                  height={380}
                  className="pointer-events-none select-none w-full h-auto"
                  draggable="false"
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
      `}</style>
    </section>
  );
}