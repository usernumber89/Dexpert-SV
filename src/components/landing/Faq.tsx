"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  HelpCircle, 
  MessageCircle, 
  ArrowRight,
  Search
} from "lucide-react";

const faqs = [
  { 
    "question": "¿Qué es Dexpert?", 
    "answer": "Dexpert es una plataforma que conecta a jóvenes sin experiencia laboral con pequeñas empresas que necesitan ayuda con proyectos reales.",
    "category": "General"
  },
  { 
    "question": "¿Quiénes pueden usar Dexpert?", 
    "answer": "Jóvenes, incluyendo aquellos con discapacidades, que desean adquirir experiencia, y pequeñas empresas que buscan talento asequible.",
    "category": "General"
  },
  { 
    "question": "¿Necesito experiencia para unirme?", 
    "answer": "No se requiere experiencia. Dexpert está diseñado para principiantes. Nuestro asistente de inteligencia artificial te guía en cada paso.",
    "category": "Estudiantes"
  },
  { 
    "question": "¿Cómo ayuda Dexpert a las pequeñas empresas?", 
    "answer": "Las empresas publican proyectos con la ayuda de IA, reciben el apoyo de estudiantes motivados y eligen planes que se ajusten a su presupuesto.",
    "category": "Empresas"
  },
  { 
    "question": "¿Dexpert es accesible para personas con discapacidades?", 
    "answer": "Sí. Dexpert es totalmente inclusivo, ofreciendo igualdad de acceso, respeto y participación para todos los usuarios.",
    "category": "General"
  },
  { 
    "question": "¿Qué obtienen los estudiantes de la experiencia?", 
    "answer": "Experiencia práctica, mentoría mediante IA y un certificado que demuestra su contribución en proyectos del mundo real.",
    "category": "Estudiantes"
  },
  { 
    "question": "¿Cuánto cuesta para las empresas?", 
    "answer": "Manejamos créditos prepagados que nunca expiran. Los planes van desde $4.99 (1 proyecto) hasta $99.99 (50 proyectos). Sin suscripciones, pagas solo cuando publicas un proyecto.",
    "category": "Empresas"
  },
  { 
    "question": "¿Dónde está disponible Dexpert?", 
    "answer": "Actualmente está enfocado en El Salvador, con planes de expansión por toda América Latina.",
    "category": "General"
  },
];

const categories = ["Todas", "General", "Estudiantes", "Empresas"];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todas");

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "Todas" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section id="faq" className="relative py-24 px-6 bg-gradient-to-b from-[#F0F7FF] to-white overflow-hidden">
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        
        
        {/* Floating Icons */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-40 left-10 text-[#38A3F1]/10"
        >
          <HelpCircle className="w-16 h-16" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-40 right-10 text-[#1D9E75]/10"
        >
          <MessageCircle className="w-16 h-16" />
        </motion.div>
      </div>

      <div className="relative max-w-4xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          {/* Badge */}
          
          
          <h2 className="text-2xl md:text-2xl lg:text-3xl font-bold text-[#0D3A6E] mb-4">
            Preguntas{" "}
            <span className="relative">
              <span className="relative z-10 bg-[#38A3F1] bg-clip-text text-transparent">
                Frecuentes
              </span>
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#38A3F1]/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h2>
          
          <p className="text-[#5B8DB8] text-sm max-w-2xl mx-auto">
          Todo lo que necesitas saber sobre Dexpert. ¿No encuentras lo que estás buscando? 
            <br className="hidden md:block" />
            <a href="#contact" className="text-[#38A3F1] hover:underline ml-1">
              Contacta a nuestro equipo de soporte
            </a>
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#93B8D4]" />
            <input
              type="text"
              placeholder="Buscar preguntas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#BAD8F7] rounded-2xl text-sm text-[#0D3A6E] placeholder-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
            />
          </div>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === category
                  ? "bg-[#38A3F1] text-white shadow-md"
                  : "bg-white text-[#5B8DB8] hover:bg-[#F0F7FF] border border-[#BAD8F7]"
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* FAQ List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl border border-[#E8F3FD] shadow-xl overflow-hidden"
        >
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`border-b border-[#E8F3FD] last:border-b-0 `}
              >
                <div 
                  className="cursor-pointer group"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                >
                  <div className="flex items-center justify-between px-6 py-5 gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Question Number */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                        openIndex === i 
                          ? "bg-[#38A3F1] text-white" 
                          : "bg-[#F0F7FF] text-[#38A3F1] group-hover:bg-[#38A3F1] group-hover:text-white"
                      }`}>
                        <span className="text-xs font-bold">{i + 1}</span>
                      </div>
                      
                      {/* Question Text */}
                      <p className={`text-sm md:text-base font-medium transition-colors ${
                        openIndex === i ? "text-[#38A3F1]" : "text-[#0D3A6E] group-hover:text-[#38A3F1]"
                      }`}>
                        {faq.question}
                        
                      </p>
                    </div>
                    
                    {/* Chevron */}
                    <motion.div
                      animate={{ rotate: openIndex === i ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex-shrink-0 ${openIndex === i ? "text-[#38A3F1]" : "text-[#93B8D4]"}`}
                    >
                      <ChevronDown className="w-5 h-5" />
                    </motion.div>
                  </div>
                </div>

                {/* Answer */}
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pl-17">
                        <div className="relative">
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#174e8c] opacity-30" />
                          <p className="text-sm text-[#5B8DB8] leading-relaxed pl-4">
                            {faq.answer}
                          </p>
                          
                          {/* Category Badge */}
                          <div className="mt-3 pl-4">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#F0F7FF] rounded-full text-xs text-[#0D5FA6]">
                              {faq.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-16">
              <HelpCircle className="w-16 h-16 text-[#93B8D4] mx-auto mb-4 opacity-50" />
              <p className="text-[#5B8DB8]">No se encontraron preguntas que coincidan con tu búsqueda.</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setActiveCategory("Todas");
                }}
                className="mt-4 text-[#38A3F1] hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </motion.div>

        {/* Contact CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-4 px-6 py-4 bg-white rounded-2xl border border-[#E8F3FD] shadow-lg">
            <MessageCircle className="w-5 h-5 text-[#38A3F1]" />
            <p className="text-[#0D3A6E] text-sm font-medium">
              ¿Todavía tienes preguntas? ¡Estamos aquí para ayudarte!
            </p>
            <a 
              href="#contact" 
              className="inline-flex items-center gap-2 text-[#38A3F1] font-medium hover:gap-3 transition-all"
            >
              Contáctanos
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}