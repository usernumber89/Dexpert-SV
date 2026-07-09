"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FolderOpen, Award, Clock, ChevronRight, MapPin, Briefcase, Zap, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

// ── Tipos ────────────────────────────────────────────────────────
type Pyme = { id: string; company_name?: string; logo_url?: string | null };
type Project = {
  id: string; title: string; description?: string | null;
  skills: string | string[]; level?: string | null; pyme?: Pyme | null;
};
type Application = {
  id: string; status: string; project?: Project | null; certificate?: { id: string; file_url?: string | null } | null;
};
type Student = { id: string; full_name?: string | null; avatar_url?: string | null; profile_boost_until?: string | null };
type ServerStats = {
  totalApps: number;
  totalAccepted: number;
  totalCompleted: number;
  totalCerts: number;
};
type Props = {
  user: { name: string; avatarUrl?: string | null };
  student: Student | null;
  applications: Application[];
  projects: Project[];
  serverStats: ServerStats;
};

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  PENDING:   { label: "Pendiente",   bg: "bg-amber-50",   text: "text-amber-600",  dot: "bg-amber-400" },
  ACCEPTED:  { label: "Aceptado",  bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500" },
  REJECTED:  { label: "Rechazado",  bg: "bg-red-50",     text: "text-red-500",    dot: "bg-red-400" },
  COMPLETED: { label: "Completado", bg: "bg-sky-50",     text: "text-sky-600",    dot: "bg-sky-500" },
};

// ── Tarjeta de proyecto ──────────────────────────────────────────
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
          {project.pyme?.logo_url ? (
            <Image
              src={project.pyme.logo_url}
              alt={project.pyme.company_name || "Logo"}
              width={40}
              height={40}
              className="w-10 h-10 rounded-xl object-cover border border-[#BAD8F7] flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F0F7FF] to-[#E8F3FD] border border-[#BAD8F7] flex items-center justify-center text-sm font-bold text-[#0D3A6E] shadow-sm">
              {project.pyme?.company_name?.[0]?.toUpperCase() ?? "D"}
            </div>
          )}
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
          {project.level ?? "Cualquier nivel"}
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
export function StudentDashboard({ user, student, applications, projects, serverStats }: Props) {
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  if (!supabaseRef.current) supabaseRef.current = createClient();

  const [stats, setStats] = useState([
    { label: "Postulaciones", value: serverStats.totalApps, icon: FolderOpen },
    { label: "Aceptadas", value: serverStats.totalAccepted, icon: Clock },
    { label: "Completados", value: serverStats.totalCompleted, icon: Briefcase },
    { label: "Certificados", value: serverStats.totalCerts, icon: Award },
  ]);

  const fetchStats = useCallback(async () => {
    if (!student) return;
    const supabase = supabaseRef.current!;

    const [{ count: totalApps }, { count: totalAccepted }, { count: totalCompleted }] = await Promise.all([
      supabase.from("applications").select("*", { count: "exact", head: true }).eq("student_id", student.id),
      supabase.from("applications").select("*", { count: "exact", head: true }).eq("student_id", student.id).in("status", ["ACCEPTED", "COMPLETED"]),
      supabase.from("applications").select("*", { count: "exact", head: true }).eq("student_id", student.id).eq("status", "COMPLETED"),
    ]);

    const { data: appIds } = await supabase.from("applications").select("id").eq("student_id", student.id);
    let totalCerts = 0;
    if (appIds && appIds.length > 0) {
      const { count } = await supabase.from("certificates").select("*", { count: "exact", head: true }).in("application_id", appIds.map((a: { id: string }) => a.id));
      totalCerts = count ?? 0;
    }

    setStats([
      { label: "Postulaciones", value: totalApps ?? 0, icon: FolderOpen },
      { label: "Aceptadas", value: totalAccepted ?? 0, icon: Clock },
      { label: "Completados", value: totalCompleted ?? 0, icon: Briefcase },
      { label: "Certificados", value: totalCerts, icon: Award },
    ]);
  }, [student]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (!student) return;
    let cancelled = false;
    const supabase = supabaseRef.current!;

    const channel = supabase
      .channel(`dashboard-apps-${student.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applications", filter: `student_id=eq.${student.id}` },
        () => { if (!cancelled) fetchStats(); }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [student, fetchStats]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F9FF] via-white to-[#EEF6FF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div>
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#5B8DB8] mb-1">Bienvenido</p>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0D3A6E] md:text-3xl">{user.name}</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          {stats.map(s => (
            <div key={s.label}
              className="bg-white rounded-xl sm:rounded-2xl border border-[#E8F3FD] p-3 sm:p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left group">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-[#F0F7FF] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <s.icon className="w-4 h-4 sm:w-6 sm:h-6 text-[#38A3F1]" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-[#0D3A6E]">{s.value}</p>
                <p className="text-[10px] sm:text-sm text-[#5B8DB8]">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Boost */}
        {student?.profile_boost_until && new Date(student.profile_boost_until) > new Date() ? (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800">Perfil destacado</p>
                <p className="text-xs text-amber-600">
                  Visible hasta {new Date(student.profile_boost_until).toLocaleDateString("es-SV", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-[#F0F7FF] to-[#E8F3FD] rounded-2xl border border-[#BAD8F7] p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#BAD8F7] flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#38A3F1]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0D3A6E]">Destaca tu perfil</p>
                <p className="text-xs text-[#5B8DB8]">Sé el primero en ser visto por las empresas por solo $2.99/mes</p>
              </div>
            </div>
            <button
              onClick={async () => {
                try {
                  const res = await fetch("/api/wompi/boost-checkout", { method: "POST" });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                } catch { toast?.error?.("Error al iniciar el pago"); }
              }}
              className="bg-[#38A3F1] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#0D5FA6] transition-colors whitespace-nowrap"
            >
              Destacar por $2.99
            </button>
          </div>
        )}

        {/* Recent Applications */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E8F3FD] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-5 border-b border-[#E8F3FD]">
            <h2 className="text-sm sm:text-base font-semibold text-[#0D3A6E]">Postulaciones recientes</h2>
            <Link href="/student/projects" className="text-sm text-[#38A3F1] hover:text-[#0D5FA6] font-medium flex items-center gap-1">
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#F0F7FF] flex items-center justify-center">
                <FolderOpen className="w-7 h-7 text-[#BAD8F7]" />
              </div>
              <p className="text-sm text-[#5B8DB8]">Sin postulaciones aún</p>
              <Link href="/student/projects" className="text-xs font-medium text-[#38A3F1] hover:underline">
                Explorar proyectos
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#E8F3FD]">
              {applications.map(app => {
                const status = statusConfig[app.status] ?? statusConfig.PENDING;
                return (
                  <div key={app.id} className="flex items-center gap-2 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-[#F9FBFF] transition-colors">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      {app.project?.pyme?.logo_url ? (
                        <Image
                          src={app.project.pyme.logo_url}
                          alt={app.project.pyme.company_name || "Logo"}
                          width={32}
                          height={32}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border border-[#E8F3FD] flex-shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#F0F7FF] border border-[#E8F3FD] flex items-center justify-center text-xs font-bold text-[#0D3A6E] flex-shrink-0">
                          {app.project?.pyme?.company_name?.[0]?.toUpperCase() ?? "D"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-[#0D3A6E] truncate">{app.project?.title ?? "Proyecto sin título"}</p>
                        <p className="text-[10px] sm:text-xs text-[#5B8DB8] mt-0.5">{app.project?.pyme?.company_name ?? "Empresa"} · Remoto</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-medium px-2 sm:px-3 py-1 rounded-full whitespace-nowrap ${status.bg} ${status.text}`}>
                      <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${status.dot}`} />{status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Available Projects */}
        <div>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-sm sm:text-base font-semibold text-[#0D3A6E]">Proyectos disponibles</h2>
            <Link href="/student/projects" className="text-xs sm:text-sm text-[#38A3F1] hover:text-[#0D5FA6] font-medium flex items-center gap-1">
              Ver todas <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {projects.map(project => (
              <DashboardProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}