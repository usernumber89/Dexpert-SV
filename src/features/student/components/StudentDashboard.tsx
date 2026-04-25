"use client";

import { FolderOpen, Award, Clock, ChevronRight, Sparkles, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

// ── Tipos (igual que antes) ──────────────────────────────────────
type Pyme = { id: string; company_name?: string; logo_url?: string | null };
type Project = {
  id: string; title: string; description?: string | null;
  skills: string | string[]; level?: string | null; pyme?: Pyme | null;
};
type Certificate = { id: string; file_url?: string | null };
type Application = {
  id: string; status: string; project?: Project | null; certificate?: Certificate | null;
};
type Student = { id: string; full_name?: string | null; avatar_url?: string | null };
type Props = {
  user: { name: string; avatarUrl?: string | null };
  student: Student | null;
  applications: Application[];
  projects: Project[];
};

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  PENDING:   { label: "Pending",   bg: "bg-amber-50",   text: "text-amber-600",  dot: "bg-amber-400" },
  ACCEPTED:  { label: "Accepted",  bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500" },
  REJECTED:  { label: "Rejected",  bg: "bg-red-50",     text: "text-red-500",    dot: "bg-red-400" },
  COMPLETED: { label: "Completed", bg: "bg-sky-50",     text: "text-sky-600",    dot: "bg-sky-500" },
};

// ── Tarjeta de proyecto (mismo estilo que ProjectCard) ──────────
function DashboardProjectCard({ project }: { project: Project }) {
  const skillsList = Array.isArray(project.skills)
    ? project.skills
    : project.skills?.split(",").filter(Boolean) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group bg-white rounded-2xl border border-[#E8F3FD] p-5 shadow-sm hover:shadow-xl hover:border-[#38A3F1]/40 transition-all duration-300 flex flex-col gap-3"
    >
      {/* Empresa + nivel */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F0F7FF] to-[#E8F3FD] border border-[#BAD8F7] flex items-center justify-center text-sm font-bold text-[#0D3A6E] shadow-sm">
            {project.pyme?.company_name?.[0]?.toUpperCase() ?? "D"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#0D3A6E] truncate">
              {project.pyme?.company_name ?? "Empresa"}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-[#93B8D4]" />
              <p className="text-[10px] text-[#93B8D4]">Remoto</p>
            </div>
          </div>
        </div>
        <span className="text-[10px] text-[#5B8DB8] bg-[#F0F7FF] px-2 py-1 rounded-full">
          {project.level ?? "Any level"}
        </span>
      </div>

      {/* Título + descripción */}
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-[#0D3A6E] mb-1.5 line-clamp-2 group-hover:text-[#38A3F1] transition-colors leading-snug">
          {project.title}
        </h3>
        <p className="text-xs text-[#5B8DB8] line-clamp-2 leading-relaxed">
          {project.description ?? "Sin descripción"}
        </p>
      </div>

      {/* Skills */}
      {skillsList.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skillsList.slice(0, 4).map((skill, i) => (
            <span
              key={i}
              className="text-[10px] bg-[#F0F7FF] text-[#0D5FA6] font-medium px-2.5 py-1 rounded-full border border-[#BAD8F7]"
            >
              {skill.trim()}
            </span>
          ))}
          {skillsList.length > 4 && (
            <span className="text-[10px] text-[#93B8D4] self-center">
              +{skillsList.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Enlace */}
      <Link
        href={`/student/projects/${project.id}`}
        className="mt-1 flex items-center justify-between text-xs font-semibold text-[#38A3F1] group/link"
      >
        <span>Ver detalles</span>
        <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
      </Link>
    </motion.div>
  );
}

// ── Componente principal ─────────────────────────────────────────
export function StudentDashboard({ user, student, applications, projects }: Props) {
  const stats = [
    { label: "Applications", value: applications.length, icon: FolderOpen },
    { label: "Accepted", value: applications.filter(a => a.status === "ACCEPTED").length, icon: Clock },
    { label: "Certificates", value: applications.filter(a => a.certificate).length, icon: Award },
  ];

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F9FF] via-white to-[#EEF6FF]">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#5B8DB8] mb-1">Welcome back</p>
            <h1 className="text-2xl font-bold text-[#0D3A6E] md:text-3xl">{user.name}</h1>
          </div>
          {user.avatarUrl ? (
            <Image src={user.avatarUrl} alt={user.name} width={48} height={48}
              className="rounded-full border-2 border-[#38A3F1] shadow-md object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#38A3F1] to-[#1D9E75] flex items-center justify-center text-white text-base font-bold shadow-md">
              {getInitials(user.name)}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map(s => (
            <div key={s.label}
              className="bg-white rounded-2xl border border-[#E8F3FD] p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F0F7FF] flex items-center justify-center flex-shrink-0">
                <s.icon className="w-6 h-6 text-[#38A3F1]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0D3A6E]">{s.value}</p>
                <p className="text-sm text-[#5B8DB8]">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* AI Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0D3A6E] to-[#1A4A7A] rounded-2xl p-6 shadow-xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-7 h-7 text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#F59E0B] mb-1">AI Product Manager</p>
                <p className="text-white text-lg font-semibold mb-1">Get feedback on your current project</p>
                <p className="text-[#BAD8F7] text-sm">Our AI reviews your work and suggests next steps</p>
              </div>
            </div>
            <Link href="/student/ai"
              className="inline-flex items-center justify-center bg-white text-[#0D3A6E] font-semibold text-sm px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors whitespace-nowrap">
              Open AI
            </Link>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-2xl border border-[#E8F3FD] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8F3FD]">
            <h2 className="text-base font-semibold text-[#0D3A6E]">Recent applications</h2>
            <Link href="/student/projects" className="text-sm text-[#38A3F1] hover:text-[#0D5FA6] font-medium flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#F0F7FF] flex items-center justify-center">
                <FolderOpen className="w-7 h-7 text-[#BAD8F7]" />
              </div>
              <p className="text-sm text-[#5B8DB8]">No applications yet</p>
              <Link href="/student/projects" className="text-xs font-medium text-[#38A3F1] hover:underline">
                Browse projects
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#E8F3FD]">
              {applications.map(app => {
                const status = statusConfig[app.status] ?? statusConfig.PENDING;
                return (
                  <div key={app.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#F9FBFF] transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0D3A6E] truncate">{app.project?.title ?? "Untitled Project"}</p>
                      <p className="text-xs text-[#5B8DB8] mt-0.5">{app.project?.pyme?.company_name ?? "Company"} · Remote</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${status.bg} ${status.text}`}>
                      <span className={`w-2 h-2 rounded-full ${status.dot}`} />{status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Available Projects – tarjetas unificadas */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#0D3A6E]">Available projects</h2>
            <Link href="/student/projects" className="text-sm text-[#38A3F1] hover:text-[#0D5FA6] font-medium flex items-center gap-1">
              See all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <DashboardProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}