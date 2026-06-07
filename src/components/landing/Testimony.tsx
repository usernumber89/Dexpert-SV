"use client";

import { motion } from "framer-motion";
import { Quote, Star, Heart, Sparkles, Users, Award } from "lucide-react";

const testimonies = [
  { 
    name: "Fernando Pérez", 
    role: "Dexpert User", 
    initials: "FP", 
    quote: "I had never worked on a real project before. Dexpert helped me believe in what I can do and now I feel ready to apply for my first job.",
    color: "#38A3F1",
    achievement: "First job secured",
    rating: 5
  },
  { 
    name: "Tatiana Salazar", 
    role: "Entrepreneur", 
    initials: "TS", 
    quote: "My small business got real support from talented young people. It was not just help, it was collaboration with future professionals.",
    color: "#0D3A6E",
    achievement: "3 projects completed",
    rating: 5
  },
  { 
    name: "Sara Mejía", 
    role: "Dexpert User", 
    initials: "SM", 
    quote: "As a person with a disability, it is hard to be taken seriously. On Dexpert, I was heard, included, and valued.",
    color: "#38A3F1",
    achievement: "Found inclusive team",
    rating: 5
  },
];

const STATS = [
  { value: "95%", label: "Satisfaction Rate", icon: Heart },
  { value: "200+", label: "Success Stories", icon: Award },
  { value: "50+", label: "Active Businesses", icon: Users },
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
            What our{" "}
            <span className="relative">
              <span className="relative z-10 bg-[#38A3F1] bg-clip-text text-transparent">
                users say
              </span>
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#38A3F1]/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h2>
          
          <p className="text-[#5B8DB8] max-w-2xl text-sm mx-auto">
            Many young people in El Salvador just need one opportunity. 
            <br className="hidden md:block" />
            <span className="font-medium text-[#38A3F1]"> At Dexpert, they found it.</span>
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

        {/* Stats Section 
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-3 gap-4 max-w-3xl mx-auto"
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
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 bg-white rounded-2xl border border-[#E8F3FD] shadow-sm hover:shadow-md transition-all"
              >
                <Icon className="w-6 h-6 text-[#38A3F1] mx-auto mb-2" />
                <p className="text-2xl font-bold text-[#0D3A6E]">{stat.value}</p>
                <p className="text-xs text-[#93B8D4]">{stat.label}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-[#93B8D4]">
            Join hundreds of satisfied users who found their opportunity with Dexpert
          </p>
        </motion.div>
      </div>
    </section>
  );
}