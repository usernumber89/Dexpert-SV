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
  appliedProjectIds: string[];
  studentSkills: string[];
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

export function StudentProjects({ projects, appliedProjectIds, studentSkills }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");

  const filtered = useMemo(() => {
    return projects
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
      .sort((a, b) => b.matchPercentage - a.matchPercentage);
  }, [projects, search, category, level, studentSkills]);

  const hasActiveFilters = search || category !== "All" || level !== "All";

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setLevel("All");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F9FF] via-white to-[#EEF6FF]">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#5B8DB8] mb-2">
            Explore Opportunities
          </p>
          <h1 className="text-2xl font-bold text-[#0D3A6E] md:text-3xl">
            Available Projects
          </h1>
          <p className="text-sm text-[#5B8DB8] mt-2">
            Find projects that match your skills and interests
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-[#E8F3FD] shadow-sm p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-3 flex-1 px-4 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/80 focus-within:border-[#38A3F1] focus-within:ring-2 focus-within:ring-[#38A3F1]/20 transition-all">
              <Search className="w-5 h-5 text-[#93B8D4]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search project title or description..."
                className="flex-1 text-sm text-[#0D3A6E] placeholder:text-[#93B8D4] outline-none bg-transparent"
              />
              {search && (
                <button onClick={() => setSearch("")} className="p-1 hover:bg-[#F0F7FF] rounded">
                  <X className="w-4 h-4 text-[#93B8D4]" />
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="text-sm font-medium text-[#0D3A6E] border border-[#BAD8F7] rounded-xl px-4 py-2.5 outline-none bg-white/80 cursor-pointer hover:border-[#38A3F1] transition-all"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
                ))}
              </select>

              <select
                value={level}
                onChange={e => setLevel(e.target.value)}
                className="text-sm font-medium text-[#0D3A6E] border border-[#BAD8F7] rounded-xl px-4 py-2.5 outline-none bg-white/80 cursor-pointer hover:border-[#38A3F1] transition-all"
              >
                {LEVELS.map(l => (
                  <option key={l} value={l}>{l === "All" ? "All Levels" : l}</option>
                ))}
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#E8F3FD]">
              <div className="flex items-center gap-2 px-3 py-1 bg-[#F0F7FF] rounded-full">
                <Filter className="w-3.5 h-3.5 text-[#38A3F1]" />
                <span className="text-xs font-medium text-[#0D5FA6]">Active filters</span>
              </div>
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-[#38A3F1] hover:text-[#0D5FA6] transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#5B8DB8]">
            Showing <span className="font-semibold text-[#0D3A6E]">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "project" : "projects"}
          </p>
          <div className="flex items-center gap-2 text-xs text-[#93B8D4]">
            <TrendingUp className="w-4 h-4" />
            Sorted by match percentage
          </div>
        </div>

        {/* Projects grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24">
            <div className="w-20 h-20 bg-[#F0F7FF] rounded-2xl flex items-center justify-center">
              <Filter className="w-10 h-10 text-[#BAD8F7]" />
            </div>
            <h3 className="text-lg font-semibold text-[#0D3A6E]">No projects found</h3>
            <p className="text-sm text-[#5B8DB8] text-center max-w-sm">
              Try adjusting your search or filters to find more opportunities
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-[#38A3F1] hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(project => (
              <ProjectCard
                key={project.id}
                project={{
                  ...project,
                  pyme: project.pyme
                    ? { ...project.pyme, company_name: project.pyme.company_name }
                    : null,
                }}
                hasApplied={appliedProjectIds.includes(project.id)}
                studentSkills={studentSkills}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}