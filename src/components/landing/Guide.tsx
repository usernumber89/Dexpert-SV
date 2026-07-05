"use client";

import { motion } from "framer-motion";
import { 
  UserPlus, 
  Search, 
  Award,
  FileInput, SendToBack, Network
} from "lucide-react";

const steps = [
  { 
    title: "Regístrate gratis", 
    description: "Crea tu cuenta como estudiante o propietario de una pequeña empresa. Solo toma un minuto.",
    icon: UserPlus,
    color: "#38A3F1",
    gradient: "from-[#38A3F1] to-[#5BB3F3]"
  },
  { 
    title: "Explora proyectos reales", 
    description: "Explora desafíos del mundo real de empresas pequeñas que necesitan tus habilidades.",
    icon: Search,
    color: "#18508f",
    gradient: "from-[#18508f] to-[#3DB892]"
  },
  { 
    title: "Publica tu idea con IA", 
    description: "Nuestra IA te ayuda a describir y publicar tu proyecto claramente, incluso sin experiencia técnica.",
    icon: FileInput,
     color: "#38A3F1",
    gradient: "from-[#38A3F1] to-[#5BB3F3]"
  },
  { 
    title: "Aplica o elige colaboradores", 
    description: "Los estudiantes aplican a proyectos, los propietarios de negocios seleccionan con quienes quieren trabajar.",
    icon: SendToBack,
    color: "#18508f",
    gradient: "from-[#18508f] to-[#3DB892]"
  },
  { 
    title: "Trabaja con soporte de IA", 
    description: "Obtén retroalimentación y sugerencias continuas de nuestro Product Owner AI a lo largo del proyecto.",
    icon: Network,
    color: "#38A3F1",
    gradient: "from-[#38A3F1] to-[#5BB3F3]"
  },
  { 
    title: "Obtén resultados y reconocimiento", 
    description: "Las empresas obtienen soluciones reales. Los estudiantes ganan certificados para mostrar su experiencia.",
    icon: Award,
    color: "#18508f",
    gradient: "from-[#18508f] to-[#3DB892]"
  },
];

export function Guide() {
  return (
    <section id="how" className="relative py-24 px-6 bg-gradient-to-b from-white to-[#F0F7FF] overflow-hidden">
      
      {/* Animated Background 
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#38A3F1] rounded-full opacity-5 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#1D9E75] rounded-full opacity-5 blur-3xl animate-pulse delay-1000" />
      </div> */}

      <div className="relative max-w-6xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          
          <h2 className={` text-2xl md:text-2xl lg:text-3xl font-bold text-[#0D3A6E] mb-4`} >
            Seis pasos a tu primera{" "}
            <span className="relative">
              <span className="relative z-10 bg-[#38A3F1] bg-clip-text text-transparent">
                experiencia real
              </span>
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#38A3F1]/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h2>
          <p className="text-[#5B8DB8] max-w-2xl text-sm mx-auto">
            Desde el registro hasta la certificación — tu viaje hacia el crecimiento profesional comienza aquí.
          </p>
        </motion.div>

        {/* Steps Timeline */}
        <div className="relative">
          {/* Vertical Line - Desktop */}
          <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-[#38A3F1] via-[#1D9E75] to-[#0D3A6E] opacity-20" />

          <div className="space-y-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative"
                >
                  {/* Desktop Layout */}
                  <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8 items-center mb-8">
                    {/* Left Side */}
                    <div className={`${isEven ? "text-right" : "order-2"}`}>
                      {isEven && (
                        <div className="pr-12">
                          <div className="inline-block text-left max-w-md">
                            <div className="flex items-center gap-3 mb-3 justify-end">
                              <h3 className={` text-xl font-bold text-[#0D3A6E]`}>{step.title}</h3>
                              <div 
                                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                                style={{ 
                                  background: `linear-gradient(135deg, ${step.color}15, ${step.color}05)` 
                                }}
                              >
                                <Icon className="w-5 h-5" style={{ color: step.color }} />
                              </div>
                            </div>
                            <p className="text-sm text-[#5B8DB8] leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Center Point */}
                    <div className="absolute left-1/2 transform -translate-x-1/2">
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="relative"
                      >
                        <div 
                          className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl border-4 border-white"
                          style={{ 
                            background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)` 
                          }}
                        >
                          <span className="text-white font-bold text-lg">
                            {index + 1}
                          </span>
                        </div>
                        {/* Pulse Ring */}
                        <div 
                          className="absolute inset-0 rounded-full animate-ping opacity-20"
                          style={{ background: step.color }}
                        />
                      </motion.div>
                    </div>

                    {/* Right Side */}
                    <div className={`${!isEven ? "order-1" : ""}`}>
                      {!isEven && (
                        <div className="pl-12">
                          <div className="max-w-md">
                            <div className="flex items-center gap-3 mb-3">
                              <div 
                                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                                style={{ 
                                  background: `linear-gradient(135deg, ${step.color}15, ${step.color}05)` 
                                }}
                              >
                                <Icon className="w-5 h-5" style={{ color: step.color }} />
                              </div>
                              <h3 className={` text-xl  font-bold text-[#0D3A6E]`}>{step.title}</h3>
                            </div>
                            <p className="text-sm text-[#5B8DB8] leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div className="lg:hidden flex gap-4 mb-8">
                    <div className="flex flex-col items-center">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="relative"
                      >
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                          style={{ 
                            background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)` 
                          }}
                        >
                          <span className="text-white font-bold text-base">
                            {index + 1}
                          </span>
                        </div>
                        {index < steps.length - 1 && (
                          <div className="w-0.5 h-full min-h-[60px] bg-gradient-to-b from-[#38A3F1] to-[#1D9E75] opacity-30 mt-2" />
                        )}
                      </motion.div>
                    </div>
                    
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ 
                            background: `linear-gradient(135deg, ${step.color}15, ${step.color}05)` 
                          }}
                        >
                          <Icon className="w-4 h-4" style={{ color: step.color }} />
                        </div>
                        <h3 className="text-base font-bold text-[#0D3A6E]">{step.title}</h3>
                      </div>
                      <p className="text-sm text-[#5B8DB8] leading-relaxed ml-10">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-6 px-8 py-4 bg-white rounded-2xl border border-[#E8F3FD] shadow-lg">
            
            <p className="text-[#0D3A6E] font-medium">
              Dexpert es más que una plataforma — es tu primer paso real hacia el mundo profesional.
            </p>
           
          </div>
        </motion.div>

      </div>
    </section>
  );
}