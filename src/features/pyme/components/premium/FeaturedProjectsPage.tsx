"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Star, Crown, Search, Loader2,
  Eye, Users, Calendar, ArrowRight,
  Building2, Sparkles, TrendingUp, Zap,
} from "lucide-react";
import { getAllProjectsAnalytics } from "@/app/actions/pyme/premium";
import { FeaturedToggle } from "./FeaturedToggle";
import { getPymePlan } from "@/app/actions/pyme/premium";
import { isPremiumPlan } from "@/lib/premium";
import Link from "next/link";
import PremiumGuard from "@/features/pyme/components/PremiumGuard";
import {QuestionIcon} from "@phosphor-icons/react"

type Project = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  total_applications: number;
  total_views: number;
};

export default function FeaturedProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "featured" | "not-featured">("all");

  useEffect(() => {
    getAllProjectsAnalytics().then((data: any) => {
      setProjects(data);
      setLoading(false);
    });
  }, []);

  const filtered = projects.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "featured" && p.is_featured) || (filter === "not-featured" && !p.is_featured);
    return matchSearch && matchFilter;
  });

  const featuredCount = projects.filter((p) => p.is_featured).length;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#38A3F1]" />
      </div>
    );
  }

  return (
    <PremiumGuard>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#0D3A6E] flex items-center gap-2">
            <Star className="w-6 h-6 text-[text-[#38A3F1]]" />
            Proyectos Destacados
          </h1>
          <p className="text-sm text-[#5B8DB8] mt-1">
            Tus proyectos destacados aparecen primero en el feed de estudiantes con un badge especial
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total proyectos", value: projects.length, icon: Building2, color: "#38A3F1" },
            { label: "Destacados", value: featuredCount, icon: Star, color: "#F59E0B" },
            { label: "Sin destacar", value: projects.length - featuredCount, icon: Eye, color: "#93B8D4" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-[#E8F3FD] p-4">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                <p className="text-xs text-[#93B8D4]">{stat.label}</p>
              </div>
              <p className="text-xl font-bold text-[#0D3A6E]">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* How it works card */}
        <div className="bg- to-white rounded-2xl border border-[#0d3a6e] p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#38A3F1] flex items-center justify-center shrink-0">
              <QuestionIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0D3A6E] mb-1">¿Cómo funciona?</h3>
              <p className="text-xs text-[#5B8DB8] leading-relaxed">
                Activá la estrella en cualquier proyecto para destacarlo. Los proyectos destacados
                aparecen al inicio del feed de estudiantes con un badge dorado, aumentando su visibilidad
                y atrayendo más postulaciones de calidad.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
            <input
              type="text"
              placeholder="Buscar proyecto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white rounded-xl border border-[#E8F3FD] focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/20 focus:border-[#38A3F1] text-[#0D3A6E] placeholder:text-[#93B8D4]"
            />
          </div>
          <div className="flex gap-2">
            {[
              { value: "all", label: "Todos" },
              { value: "featured", label: "Destacados" },
              { value: "not-featured", label: "Sin destacar" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value as any)}
                className={`text-xs font-semibold px-3.5 py-2 rounded-xl border transition-colors ${
                  filter === opt.value
                    ? "bg-[#0D3A6E] text-white border-[#0D3A6E]"
                    : "bg-white text-[#5B8DB8] border-[#E8F3FD] hover:border-[#BAD8F7]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects list */}
        <div className="space-y-3">
          {filtered.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`bg-white rounded-xl border overflow-hidden transition-all ${
                project.is_featured
                  ? "border-[#FDE9C0] shadow-[0_0_0_1px_#FDE9C0]"
                  : "border-[#E8F3FD] hover:shadow-sm"
              }`}
            >
              <div className="p-4 sm:p-5 flex items-start gap-4">
                {/* Project info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-[#0D3A6E] truncate">{project.title}</h3>
                    {project.is_featured && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#D97706] border border-[#FDE9C0]">
                        <Star className="w-3 h-3 fill-[#D97706]" />
                        Destacado
                      </span>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-xs text-[#5B8DB8] line-clamp-1 mb-2">{project.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-[10px] text-[#93B8D4]">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {project.total_views} vistas
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {project.total_applications} postulaciones
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(project.created_at).toLocaleDateString("es-SV")}
                    </span>
                  </div>
                </div>

                {/* Toggle */}
                <div className="shrink-0 pt-1">
                  <FeaturedToggle
                    projectId={project.id}
                    isFeatured={project.is_featured}
                    isPremium={true}
                    onToggle={(id, featured) => {
                      setProjects((prev) =>
                        prev.map((p) =>
                          p.id === id ? { ...p, is_featured: featured } : p
                        )
                      );
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-[#E8F3FD] p-12 text-center">
              {search ? (
                <>
                  <Search className="w-10 h-10 text-[#BAD8F7] mx-auto mb-3" />
                  <p className="text-xs text-[#93B8D4]">No se encontraron proyectos</p>
                </>
              ) : filter === "featured" ? (
                <>
                  <Star className="w-10 h-10 text-[#BAD8F7] mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-[#0D3A6E] mb-1">Sin proyectos destacados</h3>
                  <p className="text-xs text-[#5B8DB8]">
                    Activá la estrella en un proyecto para destacarlo
                  </p>
                </>
              ) : (
                <>
                  <Building2 className="w-10 h-10 text-[#BAD8F7] mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-[#0D3A6E] mb-1">No hay proyectos</h3>
                  <p className="text-xs text-[#5B8DB8] mb-4">
                    Creá tu primer proyecto para empezar a destacarlo
                  </p>
                  <Link
                    href="/pyme/projects/new"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#38A3F1] px-5 py-2.5 rounded-xl hover:bg-[#0D5FA6] transition"
                  >
                    Crear proyecto
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* Tip */}
        {featuredCount > 0 && (
          <div className="bg-[#F0F7FF] rounded-2xl border border-[#BAD8F7] p-4 flex items-center gap-3">
            <Zap className="w-5 h-5 text-[#38A3F1] shrink-0" />
            <p className="text-xs text-[#0D5FA6]">
              <strong>{featuredCount} proyecto{featuredCount !== 1 ? "s" : ""} destacado{featuredCount !== 1 ? "s" : ""}.</strong>{" "}
              Los proyectos destacados tienen prioridad en el feed de estudiantes y reciben hasta 3x más postulaciones.
            </p>
          </div>
        )}
      </div>
    </PremiumGuard>
  );
}
