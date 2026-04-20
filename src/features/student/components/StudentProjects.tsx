"use client";

import { useState, useMemo } from "react";
import { Search, Filter, X } from "lucide-react";
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
    name: string;
    logo_url: string | null;
  } | null;
};

type Props = {
  projects: Project[];
  appliedProjectIds: string[];
};

const CATEGORIES = ["All", "Web development", "Marketing", "Design", "Data", "Other"];
const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"];

export function StudentProjects({ projects, appliedProjectIds }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");

  const filtered = useMemo(() => {
    return projects.filter(p => {
      const matchSearch = !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === "All" || p.category === category;
      const matchLevel = level === "All" || p.level === level;
      return matchSearch && matchCategory && matchLevel;
    });
  }, [projects, search, category, level]);

  const hasActiveFilters = search || category !== "All" || level !== "All";

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setLevel("All");
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] p-6">

      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-widest text-[#93B8D4] mb-1">Explore</p>
        <h1 className="text-xl font-semibold text-[#0D3A6E]">Available projects</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#BAD8F7] p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg border border-[#BAD8F7]">
            <Search className="w-4 h-4 text-[#93B8D4]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="flex-1 text-sm text-[#0D3A6E] placeholder:text-[#93B8D4] outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X className="w-4 h-4 text-[#93B8D4] hover:text-[#0D3A6E]" />
              </button>
            )}
          </div>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="text-sm text-[#0D3A6E] border border-[#BAD8F7] rounded-lg px-3 py-2 outline-none bg-white"
          >
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select
            value={level}
            onChange={e => setLevel(e.target.value)}
            className="text-sm text-[#0D3A6E] border border-[#BAD8F7] rounded-lg px-3 py-2 outline-none bg-white"
          >
            {LEVELS.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E8F3FD]">
            <Filter className="w-3 h-3 text-[#93B8D4]" />
            <span className="text-xs text-[#5B8DB8]">Active filters:</span>
            <button onClick={clearFilters} className="text-xs text-[#38A3F1] hover:underline">
              Clear all
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-[#93B8D4] mb-4">
        {filtered.length} {filtered.length === 1 ? "project" : "projects"} found
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20">
          <Filter className="w-10 h-10 text-[#BAD8F7]" />
          <p className="text-sm text-[#5B8DB8]">No projects match your filters</p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-[#38A3F1] hover:underline">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              hasApplied={appliedProjectIds.includes(project.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}