"use client";

import { useState, useMemo } from "react";
import { Search, Filter, X, Sparkles, TrendingUp } from "lucide-react";
import { ProjectCard } from "./ProjectCard";

type Project = {
  id: string;
  title: string;
  description: string | null;
  skills: string;
  image_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  level: string | null;
  category: string | null;
  created_at: string;
  status: string;
  pyme: {
    id: string;
    company_name: string;
    logo_url: string | null;
  } | null;
};

type Props = {
  projects: Project[];
  appliedProjectIds: Record<string, string>;
  studentSkills: string[];
  pymeFilter?: string;
  pymeName?: string;
};

const CATEGORIES = ["All", "Web development", "Marketing", "Design", "Data", "Other"];
const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"];

// Calcular compatibilidad basada en habilidades
function calculateMatch(projectSkills: string, studentSkills: string[]): number {
  if (!projectSkills.trim() || studentSkills.length === 0) return 0;
  const required = projectSkills.split(",").map(s => s.trim().toLowerCase());
  const studentLower = studentSkills.map(s => s.toLowerCase());
  const matching = required.filter(skill => studentLower.includes(skill));
  return Math.round((matching.length / required.length) * 100);
}

export function StudentProjects({ projects, appliedProjectIds, studentSkills, pymeFilter, pymeName }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");

  const filtered = useMemo(() => {
    return projects
      .filter(p => p.status !== "closed")
      .map(p => ({
        ...p,
        matchPercentage: calculateMatch(p.skills, studentSkills),
      }))
      .filter(p => {
        const matchSearch =
          !search ||
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase());
        const matchCategory = category === "All" || p.category === category;
        const matchLevel = level === "All" || p.level === level;
        return matchSearch && matchCategory && matchLevel;
      })
      .sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return b.matchPercentage - a.matchPercentage;
      });
  }, [projects, search, category, level, studentSkills]);

  const hasActiveFilters = search || category !== "All" || level !== "All";

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setLevel("All");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F9FF] via-white to-[#EEF6FF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-8">
        {/* Header */}
        <div>
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-brand-mid mb-1 sm:mb-2">
            {pymeFilter ? `Proyectos de ${pymeName}` : "Explora oportunidades"}
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-ink-primary md:text-3xl">
              {pymeFilter ? `Proyectos de ${pymeName}` : "Proyectos Disponibles"}
            </h1>
            {pymeFilter && (
              <a
                href="/student/projects"
                className="text-[11px] font-semibold text-[#38A3F1] hover:text-[#0D5FA6] transition-colors shrink-0"
              >
                Ver todos
              </a>
            )}
          </div>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1 sm:mt-2">
            {pymeFilter
              ? `Explora los proyectos publicados por ${pymeName}`
              : "Encuentra proyectos que coincidan con tus habilidades e intereses"}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E8F3FD] shadow-sm p-3 sm:p-5">
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-[#BAD8F7] bg-white/80 focus-within:border-[#38A3F1] focus-within:ring-2 focus-within:ring-[#38A3F1]/20 transition-all">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#93B8D4] flex-shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar proyectos..."
                className="flex-1 text-xs sm:text-sm text-[#0D3A6E] placeholder:text-[#93B8D4] outline-none bg-transparent min-h-[36px]"
              />
              {search && (
                <button onClick={() => setSearch("")} className="p-1.5 hover:bg-[#F0F7FF] rounded min-h-[36px] min-w-[36px] flex items-center justify-center">
                  <X className="w-4 h-4 text-[#93B8D4]" />
                </button>
              )}
            </div>

            <div className="flex gap-2 sm:gap-3">
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="flex-1 sm:flex-none text-xs sm:text-sm font-medium text-[#0D3A6E] border border-[#BAD8F7] rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 outline-none bg-white/80 cursor-pointer hover:border-[#38A3F1] transition-all min-h-[44px]"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c === "All" ? "Categorías" : c}</option>
                ))}
              </select>

              <select
                value={level}
                onChange={e => setLevel(e.target.value)}
                className="flex-1 sm:flex-none text-xs sm:text-sm font-medium text-[#0D3A6E] border border-[#BAD8F7] rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 outline-none bg-white/80 cursor-pointer hover:border-[#38A3F1] transition-all min-h-[44px]"
              >
                {LEVELS.map(l => (
                  <option key={l} value={l}>{l === "All" ? "Nivel" : l}</option>
                ))}
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#E8F3FD]">
              <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1 bg-[#F0F7FF] rounded-full">
                <Filter className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#38A3F1]" />
                <span className="text-[10px] sm:text-xs font-medium text-[#0D5FA6]">Filtros activos</span>
              </div>
              <button
                onClick={clearFilters}
                className="text-[11px] sm:text-xs font-semibold text-[#38A3F1] hover:text-[#0D5FA6] transition-colors min-h-[44px]"
              >
                Limpiar todo
              </button>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm text-[#5B8DB8]">
            Mostrando <span className="font-semibold text-[#0D3A6E]">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "proyecto" : "proyectos"}
          </p>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-[#93B8D4]">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
            Ordenado por compatibilidad
          </div>
        </div>

        {/* Projects grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 sm:gap-4 py-16 sm:py-24">
            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-[#F0F7FF] rounded-xl sm:rounded-2xl flex items-center justify-center">
              <Filter className="w-7 h-7 sm:w-10 sm:h-10 text-[#BAD8F7]" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-[#0D3A6E]">No se encontraron proyectos</h3>
            <p className="text-xs sm:text-sm text-[#5B8DB8] text-center max-w-xs sm:max-w-sm">
              Ajusta tu búsqueda o filtros para encontrar más oportunidades
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs sm:text-sm font-medium text-[#38A3F1] hover:underline min-h-[44px]"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map(project => (
              <ProjectCard
                key={project.id}
                project={{
                  ...project,
                  pyme: project.pyme
                    ? { ...project.pyme, company_name: project.pyme.company_name }
                    : null,
                }}
                applicationStatus={appliedProjectIds[project.id] ?? null}
                studentSkills={studentSkills}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}