"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Users, Eye, TrendingUp,
  Search, Star, Target,
  Loader2, ChevronDown, ChevronUp, Download,
  ArrowUpRight, CheckCircle2, XCircle, HelpCircle,
  FileText, GraduationCap,
  Shield, Zap, Award, Activity, RefreshCw,
} from "lucide-react";
import { getAllProjectsAnalytics } from "@/app/actions/pyme/premium";
import Link from "next/link";

type StudentSkill = {
  name: string;
  level?: string;
};

type Application = {
  id: string;
  status: string;
  created_at: string;
  student: {
    full_name: string;
    avatar_url: string | null;
    skills: StudentSkill[] | string[] | string | null;
  } | null;
};

type ProjectWithAnalytics = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  analytics: any;
  applications: Application[];
  total_applications: number;
  total_views: number;
  avg_student_score: number;
  accepted: number;
  pending: number;
  rejected: number;
};

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; bg: string; color: string }> = {
    active: { label: "Activo", bg: "#E1F5EE", color: "#1D9E75" },
    completed: { label: "Completado", bg: "#F0F7FF", color: "#38A3F1" },
    cancelled: { label: "Cancelado", bg: "#FEF2F2", color: "#EF4444" },
    draft: { label: "Borrador", bg: "#F5F3FF", color: "#8B5CF6" },
  };
  const c = config[status] || { label: status, bg: "#F5F5F5", color: "#666" };
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

function GlobalStats({ projects }: { projects: ProjectWithAnalytics[] }) {
  const totalViews = projects.reduce((s, p) => s + p.total_views, 0);
  const totalApps = projects.reduce((s, p) => s + p.total_applications, 0);
  const totalAccepted = projects.reduce((s, p) => s + p.accepted, 0);
  const featuredCount = projects.filter((p) => p.is_featured).length;
  const avgScore = projects.length
    ? Math.round(projects.reduce((s, p) => s + p.avg_student_score, 0) / projects.length)
    : 0;

  const stats = [
    {
      label: "Proyectos",
      value: projects.length,
      icon: FileText,
      color: "#38A3F1",
      bg: "#F0F7FF",
      subtitle: `${featuredCount} destacados`,
    },
    {
      label: "Vistas totales",
      value: totalViews,
      icon: Eye,
      color: "#8B5CF6",
      bg: "#F5F3FF",
      subtitle: "en todos tus proyectos",
    },
    {
      label: "Postulaciones",
      value: totalApps,
      icon: Users,
      color: "#F59E0B",
      bg: "#FFFBEB",
      subtitle: `${totalAccepted} aceptadas`,
    },
    {
      label: "Score promedio",
      value: avgScore > 0 ? `${avgScore}%` : "—",
      icon: Award,
      color: "#1D9E75",
      bg: "#E1F5EE",
      subtitle: "de los postulantes",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl border border-[#E8F3FD] p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: stat.bg }}>
                <Icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <TrendingUp className="w-4 h-4 text-[#1D9E75]" />
            </div>
            <p className="text-2xl font-bold text-[#0D3A6E]">{stat.value}</p>
            <p className="text-xs text-[#5B8DB8] mt-0.5">{stat.label}</p>
            <p className="text-[10px] text-[#93B8D4] mt-1">{stat.subtitle}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

function ProjectRow({
  project,
  expanded,
  onToggle,
}: {
  project: ProjectWithAnalytics;
  expanded: boolean;
  onToggle: () => void;
}) {
  const viewRate = project.total_views > 0
    ? ((project.total_applications / project.total_views) * 100).toFixed(1)
    : "0.0";

  const completionRate = project.total_applications > 0
    ? ((project.accepted / project.total_applications) * 100).toFixed(0)
    : "0";

  const topSkills: string[] = [];
  project.applications.forEach((app) => {
    if (app.student?.skills) {
      const skills = app.student.skills;
      if (Array.isArray(skills)) {
        skills.forEach((s: any) => {
          const name = typeof s === "string" ? s : s.name;
          if (name && !topSkills.includes(name)) topSkills.push(name);
        });
      }
    }
  });

  return (
    <motion.div
      layout
      className="bg-white rounded-xl border border-[#E8F3FD] overflow-hidden hover:shadow-sm transition-shadow"
    >
      {/* Header */}
      <button onClick={onToggle} className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-[#FAFDFF] transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-bold text-[#0D3A6E] truncate">{project.title}</h4>
            {project.is_featured && (
              <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
            )}
            <StatusBadge status={project.status} />
            {!project.is_published && (
              <span className="text-[10px] font-semibold text-[#93B8D4] bg-[#F5F5F5] px-2 py-0.5 rounded-full">
                No publicado
              </span>
            )}
          </div>
          {project.description && (
            <p className="text-xs text-[#5B8DB8] line-clamp-1">{project.description}</p>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-5 text-center">
          <div>
            <p className="text-sm font-bold text-[#0D3A6E]">{project.total_views}</p>
            <p className="text-[10px] text-[#93B8D4]">Vistas</p>
          </div>
          <div>
            <p className="text-sm font-bold text-[#0D3A6E]">{project.total_applications}</p>
            <p className="text-[10px] text-[#93B8D4]">Post.</p>
          </div>
          <div>
            <p className="text-sm font-bold text-[#0D3A6E]">{completionRate}%</p>
            <p className="text-[10px] text-[#93B8D4]">Acept.</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-[#93B8D4] shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#93B8D4] shrink-0" />
        )}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="border-t border-[#E8F3FD] px-5 py-4"
        >
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-[#FAFDFF] rounded-xl border border-[#E8F3FD] p-3">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span className="text-[10px] font-semibold text-[#0D3A6E] uppercase tracking-wide">Conversión</span>
              </div>
              <p className="text-lg font-bold text-[#0D3A6E]">{viewRate}%</p>
              <p className="text-[10px] text-[#93B8D4]">postulaciones / vistas</p>
            </div>
            <div className="bg-[#FAFDFF] rounded-xl border border-[#E8F3FD] p-3">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-3.5 h-3.5 text-[#1D9E75]" />
                <span className="text-[10px] font-semibold text-[#0D3A6E] uppercase tracking-wide">Aceptación</span>
              </div>
              <p className="text-lg font-bold text-[#0D3A6E]">{completionRate}%</p>
              <p className="text-[10px] text-[#93B8D4]">postulaciones aceptadas</p>
            </div>
            <div className="bg-[#FAFDFF] rounded-xl border border-[#E8F3FD] p-3">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span className="text-[10px] font-semibold text-[#0D3A6E] uppercase tracking-wide">Score</span>
              </div>
              <p className="text-lg font-bold text-[#0D3A6E]">
                {project.avg_student_score > 0 ? `${project.avg_student_score}%` : "—"}
              </p>
              <p className="text-[10px] text-[#93B8D4]">puntaje promedio</p>
            </div>
          </div>

          {/* Skills distribution */}
          {topSkills.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-3.5 h-3.5 text-[#38A3F1]" />
                <span className="text-[10px] font-semibold text-[#0D3A6E] uppercase tracking-wide">Skills de postulantes</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {topSkills.slice(0, 8).map((skill) => (
                  <span
                    key={skill}
                    className="text-[10px] font-medium px-2 py-1 rounded-full bg-[#F0F7FF] text-[#0D5FA6] border border-[#BAD8F7]"
                  >
                    {skill}
                  </span>
                ))}
                {topSkills.length > 8 && (
                  <span className="text-[10px] text-[#93B8D4]">+{topSkills.length - 8} más</span>
                )}
              </div>
            </div>
          )}

          {/* Applications list */}
          {project.applications.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-[#38A3F1]" />
                  <span className="text-[10px] font-semibold text-[#0D3A6E] uppercase tracking-wide">
                    Postulaciones ({project.applications.length})
                  </span>
                </div>
                <Link
                  href={`/pyme/projects/${project.id}/applications`}
                  className="text-[10px] font-semibold text-[#38A3F1] hover:text-[#0D5FA6] flex items-center gap-1"
                >
                  Ver todas
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {project.applications.slice(0, 5).map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#FAFDFF] border border-[#E8F3FD]"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#F0F7FF] border border-[#E8F3FD] flex items-center justify-center text-[10px] font-semibold text-[#0D5FA6] shrink-0">
                      {app.student?.full_name?.[0] || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#0D3A6E] truncate">
                        {app.student?.full_name || "Anónimo"}
                      </p>
                      <p className="text-[10px] text-[#93B8D4]">
                        {new Date(app.created_at).toLocaleDateString("es-SV", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{
                        background: app.status === "ACCEPTED" ? "#E1F5EE"
                          : app.status === "REJECTED" ? "#FEF2F2" : "#FFFBEB",
                        color: app.status === "ACCEPTED" ? "#1D9E75"
                          : app.status === "REJECTED" ? "#EF4444" : "#D97706",
                      }}
                    >
                      {app.status === "ACCEPTED" ? <CheckCircle2 className="w-3 h-3" />
                        : app.status === "REJECTED" ? <XCircle className="w-3 h-3" />
                        : <HelpCircle className="w-3 h-3" />}
                      {app.status === "ACCEPTED" ? "Aceptado"
                        : app.status === "REJECTED" ? "Rechazado" : "Pendiente"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {project.applications.length === 0 && (
            <div className="text-center py-4">
              <Users className="w-8 h-8 text-[#BAD8F7] mx-auto mb-2" />
              <p className="text-xs text-[#93B8D4]">Aún no hay postulaciones</p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

function ProjectAnalytics({ projects }: { projects: ProjectWithAnalytics[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const filtered = projects.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase())
      || p.description?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.status === filter;
    return matchSearch && matchFilter;
  });

  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E8F3FD] p-12 text-center">
        <BarChart3 className="w-12 h-12 text-[#BAD8F7] mx-auto mb-3" />
        <h3 className="text-sm font-bold text-[#0D3A6E] mb-1">No hay proyectos</h3>
        <p className="text-xs text-[#5B8DB8] mb-4">
          Creá tu primer proyecto para empezar a ver analytics
        </p>
        <Link
          href="/pyme/projects/new"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#38A3F1] px-5 py-2.5 rounded-xl hover:bg-[#0D5FA6] transition"
        >
          Crear proyecto
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
          <input
            type="text"
            placeholder="Buscar proyecto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white rounded-xl border border-[#E8F3FD] focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/20 focus:border-[#38A3F1] transition-colors text-[#0D3A6E] placeholder:text-[#93B8D4]"
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: "all", label: "Todos" },
            { value: "active", label: "Activos" },
            { value: "completed", label: "Completados" },
            { value: "draft", label: "Borradores" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
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

      {/* Project list */}
      <div className="space-y-3">
        {filtered.map((project) => (
          <ProjectRow
            key={project.id}
            project={project}
            expanded={expandedId === project.id}
            onToggle={() => setExpandedId(expandedId === project.id ? null : project.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8">
          <Search className="w-8 h-8 text-[#BAD8F7] mx-auto mb-2" />
          <p className="text-xs text-[#93B8D4]">No se encontraron proyectos con esos filtros</p>
        </div>
      )}
    </div>
  );
}

export default function PymeAnalyticsPage() {
  const [projects, setProjects] = useState<ProjectWithAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const data = await getAllProjectsAnalytics();
    setProjects(data as ProjectWithAnalytics[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const onFocus = () => fetchData();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#38A3F1]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0D3A6E] flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#38A3F1]" />
              Analítica de Proyectos
            </h1>
            <p className="text-sm text-[#5B8DB8] mt-1">
              Métricas detalladas de todos tus proyectos, postulaciones y rendimiento
            </p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#38A3F1] bg-white border border-[#BAD8F7] px-3 py-2 rounded-xl hover:bg-[#F0F7FF] transition shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Actualizar
          </button>
        </div>

        {/* Global stats */}
        <GlobalStats projects={projects} />

        {/* Per-project analytics */}
        <div className="bg-white rounded-2xl border border-[#E8F3FD] p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#38A3F1]" />
              <h3 className="text-base font-bold text-[#0D3A6E]">Proyectos</h3>
              <span className="text-xs text-[#93B8D4]">({projects.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#93B8D4]">
                {projects.reduce((s, p) => s + p.applications.length, 0)} postulaciones totales
              </span>
            </div>
          </div>
          <ProjectAnalytics projects={projects} />
        </div>

        {/* Export hint */}
        <div className="bg-[#F0F7FF] rounded-2xl border border-[#BAD8F7] p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-[#38A3F1]" />
            <div>
              <p className="text-sm font-semibold text-[#0D3A6E]">Exportar datos</p>
              <p className="text-xs text-[#5B8DB8]">Descargá reportes en CSV de tus analytics</p>
            </div>
          </div>
          <button className="text-xs font-semibold text-white bg-[#0D3A6E] px-5 py-2 rounded-xl hover:bg-[#0D5FA6] transition shadow-sm"
            onClick={() => {
              const csv = [
                ["Proyecto", "Vistas", "Postulaciones", "Aceptados", "Pendientes", "Rechazados", "Score Promedio", "Estado"],
                ...projects.map((p) => [
                  p.title,
                  p.total_views,
                  p.total_applications,
                  p.accepted,
                  p.pending,
                  p.rejected,
                  p.avg_student_score || "—",
                  p.status,
                ]),
              ].map((r) => r.join(",")).join("\n");
              const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `analytics-${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Exportar CSV
          </button>
        </div>
      </div>
  );
}
