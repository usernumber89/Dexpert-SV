"use client";

import { motion } from "framer-motion";
import { Quote, Award } from "lucide-react";

const testimonies = [
  { 
    name: "Fernando Pérez", 
    role: "Usuario de Dexpert", 
    initials: "FP", 
    quote: "Yo nunca había trabajado en un proyecto real antes. Dexpert me ayudó a creer en lo que puedo hacer y ahora me siento listo para aplicar a mi primer trabajo.",
    color: "#38A3F1",
    achievement: "Primer trabajo asegurado",
    rating: 5
  },
  { 
    name: "Tatiana Salazar", 
    role: "Emprendedora", 
    initials: "TS", 
    quote: "Mi pequeña empresa recibió apoyo real de jóvenes talentosos. No fue solo ayuda, fue colaboración con profesionales del futuro.",
    color: "#0D3A6E",
    achievement: "3 proyectos exitosos",
    rating: 5
  },
  { 
    name: "Sara Mejía", 
    role: "Usuario de Dexpert", 
    initials: "SM", 
    quote: "Como persona con discapacidad, es difícil ser tomada en serio. En Dexpert, me escucharon, incluyeron y valoraron.",
    color: "#38A3F1",
    achievement: "Encontró un equipo inclusivo",
    rating: 5
  },
];

export function Testimony() {
  return (
    <section className="relative py-24 px-6 bg-gradient-to-b from-white to-[#F0F7FF] overflow-hidden">
      
      {/* Animated Background */}
      

      <div className="relative max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
        
          
          <h2 className="text-xl md:text-xl lg:text-3xl font-bold text-[#0D3A6E] mb-4">
            Lo que nuestros usuarios{" "}
            <span className="relative">
              <span className="relative z-10 bg-[#38A3F1] bg-clip-text text-transparent">
                dicen
              </span>
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#38A3F1]/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h2>
          
          <p className="text-[#5B8DB8] max-w-2xl text-sm mx-auto">
            Muchas personas jóvenes en El Salvador simplemente necesitan una oportunidad. 
            <br className="hidden md:block" />
            <span className="font-medium text-[#38A3F1]"> En Dexpert, la encontraron.</span>
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {testimonies.map((testimony, index) => (
            <motion.div
              key={testimony.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ y: -8 }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full bg-white  rounded-3xl p-6 lg:p-8 border-r shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden" style={{ borderColor: testimony.color, }}>
                
                {/* Colored Top Border */}
                
                
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
                  <div className="absolute top-0 right-0 w-32 h-32 border-2 rounded-full" style={{ borderColor: testimony.color }} />
                  <div className="absolute bottom-0 left-0 w-24 h-24 border-2 rounded-full" style={{ borderColor: testimony.color }} />
                </div>

                {/* Quote Icon */}
                <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Quote className="w-12 h-12" style={{ color: testimony.color }} />
                </div>

                {/* Rating Stars */}
                

                {/* Quote Text */}
                <p className="text-sm lg:text-md text-[#5B8DB8] leading-relaxed mb-6 relative z-10">
                  "{testimony.quote}"
                </p>

                {/* Achievement Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4"
                  style={{ background: `${testimony.color}10` }}
                >
                  <Award className="w-3 h-3" style={{ color: testimony.color }} />
                  <span className="text-xs font-medium" style={{ color: testimony.color }}>
                    {testimony.achievement}
                  </span>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-4 pt-4 border-t border-[#E8F3FD]">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="relative"
                  >
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shadow-md"
                      style={{ 
                        background: `linear-gradient(135deg, ${testimony.color}20, ${testimony.color}40)`,
                        color: testimony.color
                      }}
                    >
                      {testimony.initials}
                    </div>
                    {/* Online Indicator */}
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  </motion.div>
                  
                  <div>
                    <p className="font-semibold text-sm text-[#0D3A6E]">{testimony.name}</p>
                    <p className="text-xs text-[#93B8D4]">{testimony.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}