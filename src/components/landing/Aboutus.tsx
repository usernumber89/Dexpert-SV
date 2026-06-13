"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Users, 
  Briefcase, 
  Building2, 
  MapPin, 
  ArrowRight,
  CheckCircle2,
  Target,
  Award,
  Heart, HandHelping, Goal, Telescope, CircleDollarSign, CheckCheck
} from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: Goal,
    title: "Nuestra Misión",
    description: "Cerrar la brecha entre el talento y la oportunidad, creando experiencias del mundo real."
  },
  {
    icon: Telescope,
    title: "Nuestra Visión",
    description: "Convertirnos en la plataforma líder para el talento emergente en América Central."
  },
  {
    icon: HandHelping,
    title: "Nuestros Valores",
    description: "Inclusión, aprendizaje práctico, y crecimiento impulsado por la comunidad."
  }
];

const STATS = [
  { 
    value: "working on it", 
    label: "Active Users", 
    icon: Users,
    color: "#38A3F1",
    trend: "Growing rapidly"
  },
  { 
    value: "working on it", 
    label: "Live Projects", 
    icon: Briefcase,
    color: "#18508f",
    trend: "Real impact"
  },
  { 
    value: "3", 
    label: "Business Plans", 
    icon: CircleDollarSign,
    color: "#38A3F1",
    trend: "Discover the right fit"
  },
  { 
    value: "🇸🇻", 
    label: "El Salvador", 
    icon: MapPin,
    color: "#18508f",
    trend: "Expanding soon"
  },
];

const FEATURES = [
  "Experiencia en proyectos reales",
  "Construcción de portafolio profesional",
  "Mentoría directa",
  "Certificaciones de habilidades",
  "Participación flexible",
  "Redes de comunicación comunitaria"
];

export function Aboutus() {
  return (
    <section id="about" className="relative py-24 px-6 bg-white overflow-hidden">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#38A3F1] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1D9E75] rounded-full blur-3xl" />
      </div>
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(#0D3A6E 1px, transparent 1px), linear-gradient(90deg, #0D3A6E 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          
          
          <h2 className="text-4xl md:text-3xl font-bold text-[#0D3A6E] mb-4">
            Creemos en{" "}
            <span className="relative">
              <span className="relative z-10 bg-[#38A3F1] bg-clip-text text-transparent">
                lo que puedes ser
              </span>
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#38A3F1]/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h2>
          <p className="text-[#5B8DB8] max-w-2xl text-sm mx-auto">
            Cerrando la brecha entre el talento y las oportunidades del mundo real en El Salvador.
          </p>
        </motion.div>

        {/* Mission/Vision/Values Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {HIGHLIGHTS.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group relative bg-white rounded-2xl p-6 border border-[#E8F3FD] hover:border-[#38A3F1] shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-24 h-24  rounded-tr-2xl rounded-bl-3xl -z-0" />
                
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#F0F7FF] to-[#E8F3FD] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-[#38A3F1]" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-[#0D3A6E] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#5B8DB8] leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left - Description */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              {/* Decorative Quote */}
              <div className="absolute -top-6 -left-6 text-6xl text-[#38A3F1]/10 font-serif">"</div>
              
              <p className="text-lg text-[#0D3A6E] leading-relaxed mb-6 font-medium">
                Dexpert es una plataforma inclusiva que conecta a jóvenes sin experiencia laboral
                con micro y pequeñas empresas, permitiéndoles participar en proyectos reales,
                ganar práctica, desarrollar habilidades y fortalecer su perfil profesional.
              </p>
              
              <p className="text-[#5B8DB8] leading-relaxed mb-8">
                Creemos que todos merecen una oportunidad para mostrar su potencial. 
                Nuestra plataforma proporciona las herramientas, mentoría y oportunidades necesarias para 
                transformar el conocimiento teórico en experticia práctica.
              </p>

              {/* Feature List */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {FEATURES.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCheck  className="w-4 h-4 text-[#38A3F1] flex-shrink-0" />
                    <span className="text-sm text-[#0D3A6E]">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <Link
                href="#contact"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#0D3A6E] text-[#0D3A6E] font-semibold rounded-xl hover:bg-[#0D3A6E] hover:text-white transition-all duration-300"
              >
                Contáctanos
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Right - Stats Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {STATS.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, rotate: -1 }}
                  className="group relative bg-white rounded-2xl p-6 border border-[#E8F3FD] hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Colored top bar */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ background: stat.color }}
                  />
                  
                  {/* Background icon 
                  <Icon className="absolute -bottom-4 -right-4 w-20 h-20 opacity-5 group-hover:opacity-10 transition-opacity" /> */}
                  
                  {/* Content */}
                  <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: `${stat.color}15` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: stat.color }} />
                      </div>
                      {index === 0 && (
                        <span className="px-2 py-1 bg-[#18508f] text-white text-[10px] font-semibold rounded-full border border-[#18508f]">
                          Growing
                        </span>
                      )}
                    </div>
                    
                    <div className="text-3xl font-bold text-[#0D3A6E] mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-[#0D3A6E] mb-1">
                      {stat.label}
                    </div>
                    <div className="text-xs text-[#93B8D4]">
                      {stat.trend}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}