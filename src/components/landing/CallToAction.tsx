"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useUserRole } from "@/hooks/useUserRole";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Users, 
  Rocket,
  Star,
  TrendingUp,
  Shield
} from "lucide-react";

export function CallToAction() {
  const { isSignedIn } = useAuth();
  const { role } = useUserRole();
  const href = !isSignedIn ? "/sign-up" : role === "PYME" ? "/pyme/dashboard" : "/student/dashboard";

  return (
    <section className="relative py-24 px-6 bg-white overflow-hidden">
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#38A3F1] rounded-full opacity-[0.08] blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#1D9E75] rounded-full opacity-[0.08] blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#F59E0B] rounded-full opacity-[0.03] blur-3xl" />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(#0D3A6E 1px, transparent 1px), linear-gradient(90deg, #0D3A6E 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto">
        
        {/* Main CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-br from-[#0D3A6E] via-[#0D4A8E] to-[#1D5A9E] rounded-3xl p-12 md:p-16 text-center overflow-hidden shadow-2xl"
        >
          
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#38A3F1] rounded-full opacity-10 blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1D9E75] rounded-full opacity-10 blur-3xl translate-x-1/3 translate-y-1/3" />
          
          {/* Stars Decoration */}
          <div className="absolute top-10 right-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Star className="w-6 h-6 text-[#F59E0B] fill-[#F59E0B] opacity-30" />
            </motion.div>
          </div>
          <div className="absolute bottom-10 left-10">
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-[#38A3F1] opacity-30" />
            </motion.div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            
            {/* Top Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6"
            >
              <Zap className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#BAD8F7]">
                Get started today
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
            >
              Ready to take the{" "}
              <span className="relative">
                <span className="relative z-10 bg-gradient-to-r from-[#38A3F1] to-[#1D9E75] bg-clip-text text-transparent">
                  first step
                </span>
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#38A3F1]/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
              {" "}?
            </motion.h2>

            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-[#BAD8F7] mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Whether you are a young talent looking for experience or a small business needing real solutions,
              <span className="block text-white font-medium mt-2">
                Dexpert is your bridge to growth.
              </span>
            </motion.p>

            {/* Feature Pills */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-3 mb-8"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <Rocket className="w-4 h-4 text-[#38A3F1]" />
                <span className="text-sm text-white">No experience needed</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <Shield className="w-4 h-4 text-[#1D9E75]" />
                <span className="text-sm text-white">100% Free for students</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <TrendingUp className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-sm text-white">Real projects</span>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Link
                href={href}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#38A3F1] to-[#1D9E75] text-white text-base font-semibold rounded-xl shadow-lg shadow-[#38A3F1]/30 hover:shadow-xl hover:shadow-[#38A3F1]/40 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">
                  {isSignedIn ? "Go to dashboard" : "Join Dexpert now — it's free"}
                </span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                
                {/* Button Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Link>
            </motion.div>

            {/* Bottom Text */}
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-sm text-[#5B8DB8] mt-6"
            >
              <Sparkles className="inline w-3 h-3 mr-1 text-[#F59E0B] fill-[#F59E0B]" />
              Your talent is enough. Experience starts here.
              <Sparkles className="inline w-3 h-3 ml-1 text-[#F59E0B] fill-[#F59E0B]" />
            </motion.p>
          </div>
        </motion.div>

        {/* Stats/Trust Indicators */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-8"
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="w-4 h-4 text-[#38A3F1]" />
              <span className="text-xl font-bold text-[#0D3A6E]">500+</span>
            </div>
            <p className="text-xs text-[#93B8D4]">Active users</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Rocket className="w-4 h-4 text-[#1D9E75]" />
              <span className="text-xl font-bold text-[#0D3A6E]">200+</span>
            </div>
            <p className="text-xs text-[#93B8D4]">Projects completed</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
              <span className="text-xl font-bold text-[#0D3A6E]">4.9</span>
            </div>
            <p className="text-xs text-[#93B8D4]">User rating</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}