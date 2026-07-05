"use client";

import React, { useState, useMemo, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Search, ChevronDown, ChevronUp, Clock, CheckCircle2,
  AlertCircle, FileText, Building2, Briefcase, Plus, X, Circle, Trash,
} from "lucide-react";
import { ActiveProject } from "@/app/actions/active-projects";
import { createMilestone } from "@/app/actions/milestones";
import { completeProject, deleteProject as deleteProjectAction } from "@/app/actions/projects";
import MilestoneTracker from "./MilestoneTracker";

interface ActiveProjectsHubProps {
  initialProjects: ActiveProject[];
  role: "STUDENT" | "PYME";
  userName: string;
}

type FilterKey = "ALL" | "IN_REVIEW" | "IN_PROGRESS" | "COMPLETED" | "NO_MILESTONES";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "Todos" },
  { key: "IN_REVIEW", label: "En revisión" },
  { key: "IN_PROGRESS", label: "En progreso" },
  { key: "COMPLETED", label: "Completados" },
  { key: "NO_MILESTONES", label: "Sin hitos" },
];

function getInitial(name: string | null | undefined, fallback = "D"): string {
  if (!name || name.trim().length === 0) return fallback;
  return name.trim()[0].toUpperCase();
}

function ProgressBar({ percent }: { percent: number }) {
  const color =
    percent >= 100 ? "#1D9E75"
    : percent >= 50 ? "#38A3F1"
    : "#F59E0B";

  return (
    <div className="w-full h-1.5 bg-[#F0F7FF] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${Math.min(percent, 100)}%`, background: color }}
      />
    </div>
  );
}

function ActiveProjectCard({
  project,
  role,
  isExpanded,
  onToggle,
}: {
  project: ActiveProject;
  role: "STUDENT" | "PYME";
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const stats = project.stats || { total: 0, approved: 0, inReview: 0, inProgress: 0, pending: 0, progressPercent: 0 };
  const milestones = project.milestones || [];
  const companyName = project.pyme?.company_name || null;
  const students = project.students || [];
  const firstStudent = students[0] || null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [milestoneStudentId, setMilestoneStudentId] = useState(firstStudent?.id || "");
  const displayName = role === "STUDENT" ? companyName : (firstStudent?.full_name || null);
  const initialLetter = getInitial(displayName, "D");

  const subtitleText = role === "STUDENT"
    ? (displayName ?? "Empresa por confirmar")
    : students.length === 0
      ? "Estudiante por asignar"
      : students.length === 1
        ? firstStudent!.full_name
        : `${firstStudent!.full_name} +${students.length - 1} más`;

  const statusLabel =
    stats.total === 0 ? "Sin hitos"
    : stats.approved === stats.total ? "Completado"
    : stats.inReview > 0 ? "En revisión"
    : stats.inProgress > 0 ? "En progreso"
    : "Pendiente";

  const statusStyle =
    stats.total === 0
      ? { bg: "#F8FAFC", text: "#94A3B8", border: "#E2E8F0" }
      : stats.approved === stats.total
        ? { bg: "#E1F5EE", text: "#1D9E75", border: "#BFE8DA" }
        : stats.inReview > 0
          ? { bg: "#FFFBEB", text: "#D97706", border: "#FDE9C0" }
          : stats.inProgress > 0
            ? { bg: "#F0F7FF", text: "#0D5FA6", border: "#BAD8F7" }
            : { bg: "#F8FAFC", text: "#94A3B8", border: "#E2E8F0" };

  const StatusIcon =
    stats.total === 0 ? Clock
    : stats.approved === stats.total ? CheckCircle2
    : stats.inReview > 0 ? AlertCircle
    : Clock;

  const [actionPending, setActionPending] = useState(false);

  const handleMarkComplete = async () => {
    if (!confirm("¿Estás seguro de marcar este proyecto como completado? Se generarán los certificados para los estudiantes aceptados.")) return;
    setActionPending(true);
    try {
      const result = await completeProject(project.id);
      if (result.success) {
        toast.success("Proyecto completado y certificados generados.");
        router.refresh();
      } else {
        toast.error(result.error || "Error al completar el proyecto");
      }
    } catch {
      toast.error("Error inesperado al conectar con el servidor.");
    } finally {
      setActionPending(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.")) return;
    setActionPending(true);
    try {
      const result = await deleteProjectAction(project.id);
      if (result.success) {
        toast.success("Proyecto eliminado exitosamente.");
        router.refresh();
      } else {
        toast.error(result.error || "Error al eliminar el proyecto");
      }
    } catch {
      toast.error("Error inesperado al conectar con el servidor.");
    } finally {
      setActionPending(false);
    }
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !milestoneStudentId) return;

    startTransition(async () => {
      const res = await createMilestone(project.id, milestoneStudentId, title, description, dueDate);
      if (res.success) {
        setTitle("");
        setDescription("");
        setDueDate("");
        setMilestoneStudentId(students[0]?.id || "");
        setShowCreateForm(false);
        router.refresh();
      } else {
        alert(res.error || "Hubo un problema al crear el hito.");
      }
    });
  };

  return (
    <div
      className="bg-white border rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        borderColor: isExpanded ? "#38A3F1" : "#E8F3FD",
        boxShadow: isExpanded ? "0 4px 20px -4px rgba(56,163,241,0.15)" : "none",
      }}
    >
      <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              {role === "STUDENT" && project.pyme?.logo_url ? (
                <Image
                  src={project.pyme.logo_url}
                  alt={project.pyme.company_name || "Logo"}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-xl object-cover border border-[#E8F3FD] flex-shrink-0"
                />
              ) : role === "PYME" && firstStudent?.avatar_url ? (
                <div className="relative flex-shrink-0">
                  <Image
                    src={firstStudent.avatar_url}
                    alt={firstStudent.full_name || "Estudiante"}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#BAD8F7]"
                  />
                  {students.length > 1 && (
                    <span
                      className="absolute -bottom-1 -right-1 text-[9px] font-bold text-white bg-[#0D5FA6] rounded-full w-4.5 h-4.5 flex items-center justify-center border-2 border-white leading-none"
                      style={{ width: 18, height: 18, lineHeight: 1 }}
                    >
                      +{students.length - 1}
                    </span>
                  )}
                </div>
              ) : (
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold shrink-0"
                  style={{ background: "#F0F7FF", color: "#0D5FA6" }}
                >
                  {initialLetter}
                </div>
              )}
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-[#0D3A6E] truncate leading-snug">
                  {project.title}
                </h3>
                <p className="text-xs text-[#93B8D4] flex items-center gap-1 mt-0.5 truncate">
                  {role === "STUDENT" && project.pyme?.logo_url ? (
                    <Image
                      src={project.pyme.logo_url}
                      alt=""
                      width={14}
                      height={14}
                      className="w-3.5 h-3.5 rounded object-cover flex-shrink-0"
                    />
                  ) : role === "PYME" && firstStudent?.avatar_url ? (
                    <Image
                      src={firstStudent.avatar_url}
                      alt=""
                      width={14}
                      height={14}
                      className="w-3.5 h-3.5 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <Building2 className="w-3 h-3 shrink-0" />
                  )}
                  {subtitleText}
                </p>
              </div>
            </div>

          <span
            className="inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full border shrink-0"
            style={{ background: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border }}
          >
            <StatusIcon className="w-3 h-3" />
            {statusLabel}
          </span>
        </div>

        {stats.total > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[#93B8D4]">Progreso</span>
              <span className="font-medium text-[#0D3A6E]">
                {stats.approved}/{stats.total} hitos
              </span>
            </div>
            <ProgressBar percent={stats.progressPercent} />
          </div>
        )}

        {stats.total > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {stats.approved > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-[#1D9E75]">
                <Circle className="w-1.5 h-1.5 fill-[#1D9E75] text-[#1D9E75]" />
                {stats.approved} aprobado{stats.approved !== 1 ? "s" : ""}
              </span>
            )}
            {stats.inReview > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-[#D97706]">
                <Circle className="w-1.5 h-1.5 fill-[#D97706] text-[#D97706]" />
                {stats.inReview} en revisión
              </span>
            )}
            {stats.inProgress > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-[#38A3F1]">
                <Circle className="w-1.5 h-1.5 fill-[#38A3F1] text-[#38A3F1]" />
                {stats.inProgress} en progreso
              </span>
            )}
            {stats.pending > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-[#93B8D4]">
                <Circle className="w-1.5 h-1.5 fill-[#93B8D4] text-[#93B8D4]" />
                {stats.pending} pendiente{stats.pending !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onToggle}
            className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg border transition-colors"
            style={
              isExpanded
                ? { background: "#0D3A6E", borderColor: "#0D3A6E", color: "white" }
                : { background: "white", borderColor: "#E8F3FD", color: "#5B8DB8" }
            }
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {isExpanded ? "Ocultar hitos" : "Ver hitos"}
          </button>

          {role === "PYME" && (
            <>
              <button
                onClick={() => {
                  if (!isExpanded) onToggle();
                  setShowCreateForm(!showCreateForm);
                }}
                className="px-3 inline-flex items-center justify-center gap-1 text-xs font-medium py-2 rounded-lg border transition-colors"
                style={
                  showCreateForm
                    ? { background: "#FEF2F2", borderColor: "#FECACA", color: "#DC2626" }
                    : { background: "white", borderColor: "#BAD8F7", color: "#38A3F1" }
                }
              >
                {showCreateForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {showCreateForm ? "Cancelar" : "Hito"}
              </button>
              <button
                onClick={handleMarkComplete}
                disabled={actionPending || stats.approved !== stats.total || stats.total === 0}
                className="px-3 inline-flex items-center justify-center gap-1 text-xs font-medium py-2 rounded-lg border transition-colors disabled:opacity-40"
                style={{ background: "white", borderColor: "#BFE8DA", color: "#1D9E75" }}
                title={
                  stats.total === 0
                    ? "Crea al menos un hito antes de completar"
                    : stats.approved !== stats.total
                      ? "Todos los hitos deben estar aprobados"
                      : "Marcar proyecto como completado"
                }
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completar
              </button>
              <button
                onClick={handleDelete}
                disabled={actionPending}
                className="px-3 inline-flex items-center justify-center gap-1 text-xs font-medium py-2 rounded-lg border transition-colors disabled:opacity-40"
                style={{ background: "white", borderColor: "#FECACA", color: "#DC2626" }}
              >
                <Trash className="w-3.5 h-3.5" />
                Eliminar
              </button>
            </>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-[#E8F3FD] bg-[#F8FBFF] p-5 space-y-4">
          {role === "PYME" && showCreateForm && (
            <form onSubmit={handleCreateMilestone} className="bg-white border border-[#BAD8F7] rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-[#0D3A6E] uppercase tracking-wide">Nuevo hito</p>

              {students.length > 1 && (
                <div>
                  <label className="block text-[10px] font-medium text-[#93B8D4] mb-1">Estudiante *</label>
                  <select
                    value={milestoneStudentId}
                    onChange={(e) => setMilestoneStudentId(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-[#E8F3FD] rounded-lg focus:outline-none focus:border-[#38A3F1] text-[#0D3A6E]"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>{s.full_name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-medium text-[#93B8D4] mb-1">Título *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Sprint 1 — Modelado de base de datos"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-[#E8F3FD] rounded-lg focus:outline-none focus:border-[#38A3F1] text-[#0D3A6E]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-[#93B8D4] mb-1">Fecha límite</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-[#E8F3FD] rounded-lg focus:outline-none focus:border-[#38A3F1] text-[#0D3A6E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-[#93B8D4] mb-1">Criterios de aceptación</label>
                <textarea
                  placeholder="¿Qué debe entregar el estudiante?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full text-xs px-3 py-2 bg-white border border-[#E8F3FD] rounded-lg focus:outline-none focus:border-[#38A3F1] text-[#0D3A6E] resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isPending || !milestoneStudentId}
                  className="text-xs font-medium bg-[#0D3A6E] text-white px-4 py-2 rounded-lg hover:bg-[#0D5FA6] disabled:opacity-50 transition-colors"
                >
                  {isPending ? "Creando..." : "Crear hito"}
                </button>
              </div>
            </form>
          )}

          <MilestoneTracker
            key={`${project.id}-${milestones.length}-${milestones.map(m => m.status).join("-")}`}
            projectId={project.id}
            initialMilestones={milestones}
            role={role}
            pymeLogoUrl={project.pyme?.logo_url}
            pymeName={project.pyme?.company_name}
            studentName={firstStudent?.full_name}
            studentAvatarUrl={firstStudent?.avatar_url}
            students={students}
          />
        </div>
      )}
    </div>
  );
}

export default function ActiveProjectsHub({
  initialProjects,
  role,
}: ActiveProjectsHubProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("ALL");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Stats globales calculadas sobre milestones individuales, no proyectos
  const globalStats = useMemo(() => {
    let inReview = 0, inProgress = 0, approved = 0, pending = 0;

    initialProjects.forEach((p) => {
      inReview += p.stats?.inReview || 0;
      inProgress += p.stats?.inProgress || 0;
      approved += p.stats?.approved || 0;
      pending += p.stats?.pending || 0;
    });

    return {
      projectsCount: initialProjects.length,
      milestonesInReview: inReview,
      milestonesInProgress: inProgress,
      milestonesCompleted: approved,
      milestonesPending: pending,
    };
  }, [initialProjects]);

  // Filtro corregido: un proyecto puede aparecer en varios filtros a la vez
  // según su estado real, sin excluir por la presencia de otro estado.
  const filtered = useMemo(() => {
    return initialProjects.filter((p) => {
      const matchSearch =
        !searchTerm ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.pyme?.company_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.students.some((s) => s.full_name.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchSearch) return false;

      const s = p.stats || { total: 0, approved: 0, inReview: 0, inProgress: 0, pending: 0, progressPercent: 0 };

      switch (activeFilter) {
        case "ALL": return true;
        case "IN_REVIEW": return s.inReview > 0;
        case "IN_PROGRESS": return s.inProgress > 0;
        case "COMPLETED": return s.total > 0 && s.approved === s.total;
        case "NO_MILESTONES": return s.total === 0;
        default: return true;
      }
    });
  }, [initialProjects, searchTerm, activeFilter]);

  const statCards = [
    { label: "Proyectos activos", value: globalStats.projectsCount, icon: Briefcase, color: "#0D3A6E" },
    { label: "Hitos en revisión", value: globalStats.milestonesInReview, icon: AlertCircle, color: "#D97706" },
    { label: "Hitos en progreso", value: globalStats.milestonesInProgress, icon: Clock, color: "#38A3F1" },
    { label: "Hitos completados", value: globalStats.milestonesCompleted, icon: CheckCircle2, color: "#1D9E75" },
  ];

  return (
    <div className="min-h-screen bg-[#FAFCFF]">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

        {/* Header */}
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-[#93B8D4] mb-1.5">
            {role === "STUDENT" ? "Estudiante" : "Empresa"} · Panel operativo
          </p>
          <h1 className="text-2xl font-semibold text-[#0D3A6E]">
            Proyectos en marcha
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-[#E8F3FD] p-4">
              <div className="flex items-center justify-between mb-2">
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <p className="text-2xl font-semibold text-[#0D3A6E]">{s.value}</p>
              <p className="text-xs text-[#93B8D4] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
            <input
              type="text"
              placeholder="Buscar por proyecto, empresa o estudiante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E8F3FD] rounded-xl focus:outline-none focus:border-[#38A3F1] text-[#0D3A6E] placeholder:text-[#93B8D4]"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => {
              const isActive = activeFilter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className="text-xs font-medium px-3.5 py-1.5 rounded-full border transition-colors"
                  style={
                    isActive
                      ? { background: "#0D3A6E", borderColor: "#0D3A6E", color: "white" }
                      : { background: "white", borderColor: "#E8F3FD", color: "#5B8DB8" }
                  }
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Project list */}
        {filtered.length === 0 ? (
          <div className="py-20 bg-white border border-[#E8F3FD] rounded-2xl flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-xl bg-[#F0F7FF] flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#BAD8F7]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#0D3A6E]">Sin resultados</p>
              <p className="text-xs text-[#93B8D4] mt-1">
                {searchTerm
                  ? "No hay proyectos que coincidan con tu búsqueda"
                  : activeFilter !== "ALL"
                    ? "No hay proyectos en este filtro"
                    : "Aún no tienes proyectos activos"}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((project) => (
              <ActiveProjectCard
                key={project.id}
                project={project}
                role={role}
                isExpanded={expandedIds.has(project.id)}
                onToggle={() => toggleExpand(project.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}