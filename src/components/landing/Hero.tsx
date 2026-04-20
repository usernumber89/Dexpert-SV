"use client";

import Link from "next/link";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Briefcase,
  Zap,
  Star
} from "lucide-react";

const SAMPLE_PROJECTS = [
  { 
    title: "Facebook campaign with videos", 
    company: "Granja Los Campos", 
    match: "97%", 
    color: "#38A3F1",
    icon: "📱",
    category: "Marketing"
  },
  { 
    title: "Chinese restaurant website", 
    company: "Nichito SV", 
    match: "94%", 
    color: "#1D9E75",
    icon: "🍜",
    category: "Web Development"
  },
  { 
    title: "Instagram business promotion", 
    company: "Antojitos Carmen", 
    match: "98%", 
    color: "#F59E0B",
    icon: "📸",
    category: "Social Media"
  },
  { 
    title: "TOEIC practice platform", 
    company: "Eduardo Paices", 
    match: "89%", 
    color: "#8B5CF6",
    icon: "📚",
    category: "Education"
  },
];

const STATS = [
  { value: "500+", label: "Active Students", icon: Users },
  { value: "50+", label: "Businesses", icon: Briefcase },
  { value: "200+", label: "Projects", icon: Sparkles },
  { value: "95%", label: "Success Rate", icon: TrendingUp },
];

export function Hero() {
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const { role } = useUserRole();
  
  // Determinar el dashboard según el rol
  const getDashboardHref = () => {
    if (!user) return "/auth/sign-up";
    
    switch (role) {
      case "PYME":
        return "/pyme/dashboard";
      case "STUDENT":
        return "/student/dashboard";
      default:
        return "/dashboard";
    }
  };

  const panelHref = getDashboardHref();

  return (
    <section className="relative min-h-[95vh] flex items-center justify-center px-6 md:px-12 py-20 overflow-hidden bg-gradient-to-br from-white via-[#F0F7FF] to-[#E8F3FD]">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#38A3F1] rounded-full opacity-10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#0D3A6E] rounded-full opacity-10 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#1D9E75] rounded-full opacity-5 blur-3xl" />
        
        {/* Floating dots */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-[#38A3F1] rounded-full opacity-40 animate-bounce" />
        <div className="absolute bottom-20 right-20 w-3 h-3 bg-[#1D9E75] rounded-full opacity-30 animate-bounce delay-300" />
        <div className="absolute top-40 right-40 w-1.5 h-1.5 bg-[#F59E0B] rounded-full opacity-40 animate-ping" />
      </div>

      <div className="relative grid lg:grid-cols-2 gap-16 items-center max-w-7xl w-full">
        
        {/* Left Column - Main Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-[#BAD8F7] shadow-sm mb-6">
            <Zap className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0D3A6E]">
              Inclusive talent platform — El Salvador
            </span>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-[#0D3A6E] mb-6">
            Experience is built,{" "}
            <br />
            <TypeAnimation
              sequence={["and we provide", 1500, "and we're the", 1500]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
              className="text-[#38A3F1]"
            />
            <br />
            <span className="bg-gradient-to-r from-[#38A3F1] to-[#1D9E75] bg-clip-text text-transparent">
              the bricks.
            </span>
          </h1>
          
          {/* Description */}
          <p className="text-base md:text-lg text-[#5B8DB8] leading-relaxed mb-8 max-w-lg">
            Discover real projects from businesses across El Salvador. Build your portfolio,
            gain real experience, and take your first step into the professional world.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 mb-12">
            <Link
              href={panelHref}
              className="group relative inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#0D3A6E] to-[#1D5A9E] text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-[#38A3F1]/25 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">
                {user ? "Go to dashboard" : "Get started free"}
              </span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#38A3F1] to-[#1D9E75] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            
            <Link 
              href="#how" 
              className="group inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium text-[#0D3A6E] hover:text-[#38A3F1] transition-colors"
            >
              <span className="border-b border-dashed border-[#BAD8F7] group-hover:border-[#38A3F1] transition-colors">
                How it works
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-default"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-[#38A3F1] group-hover:scale-110 transition-transform" />
                    <span className="text-xl md:text-2xl font-bold text-[#0D3A6E]">
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-xs text-[#5B8DB8]">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Right Column - Project Cards */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden lg:block"
        >
          <div className="relative">
            {/* Glow effect behind cards */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#38A3F1] to-[#1D9E75] rounded-3xl opacity-10 blur-2xl" />
            
            {/* Main Card Container */}
            <div className="relative bg-white/90 backdrop-blur-sm border border-[#BAD8F7] rounded-3xl p-6 shadow-2xl shadow-[#0D3A6E]/5">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#38A3F1] to-[#1D9E75] rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0D3A6E]">Featured Projects</p>
                    <p className="text-xs text-[#93B8D4]">Updated daily</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-[#F0F7FF] rounded-full text-[10px] font-semibold text-[#0D5FA6] uppercase">
                  New
                </span>
              </div>
              
              {/* Project List */}
              <div className="space-y-3">
                {SAMPLE_PROJECTS.map((project, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="group flex items-center gap-4 p-3 bg-white rounded-xl border border-[#E8F3FD] hover:border-[#38A3F1] hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ 
                        background: `linear-gradient(135deg, ${project.color}15, ${project.color}05)` 
                      }}
                    >
                      {project.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-[#0D3A6E] truncate">
                          {project.title}
                        </p>
                        {project.match === "98%" && (
                          <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-[#93B8D4]">{project.company}</p>
                        <span className="w-1 h-1 bg-[#BAD8F7] rounded-full" />
                        <p className="text-xs text-[#93B8D4]">{project.category}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#0D3A6E]">{project.match}</div>
                      <div className="text-[10px] text-[#93B8D4]">match</div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-[#E8F3FD]">
                <Link 
                  href="/projects" 
                  className="group flex items-center justify-center gap-2 text-xs font-medium text-[#38A3F1] hover:text-[#0D3A6E] transition-colors"
                >
                  View all projects
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}