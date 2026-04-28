"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Users, Search, Filter, Check, X, ChevronRight,
  GraduationCap, MapPin, Mail, Phone, Globe,
 FileText, Star, Briefcase,
  Clock, CheckCircle, XCircle, AlertCircle,
  TrendingUp, BarChart2, SlidersHorizontal,
  ExternalLink, MessageSquare, ChevronDown
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────
type Student = {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  bio?: string | null;
  university?: string | null;
  major?: string | null;
  graduation_year?: string | null;
  skills?: string[] | null;
  linkedin?: string | null;
  github?: string | null;
  portfolio?: string | null;
  resume_url?: string | null;
  avatar_url?: string | null;
  verified?: boolean | null;
  education?: string | null;
};

type Application = {
  id: string;
  status: string;
  created_at: string;
  students?: Student | null;
};

type Project = {
  id: string;
  title: string;
  skills: string;
  status: string;
  is_published: boolean;
  created_at: string;
  applications: Application[];
};

type Props = { projects: Project[] };

// ── Status config ────────────────────────────────────────────────
const STATUS = {
  PENDING:   { label: "Pending",   bg: "bg-amber-50",  text: "text-amber-600",  border: "border-amber-200",  icon: Clock },
  ACCEPTED:  { label: "Accepted",  bg: "bg-green-50",  text: "text-green-600",  border: "border-green-200",  icon: CheckCircle },
  REJECTED:  { label: "Rejected",  bg: "bg-red-50",    text: "text-red-500",    border: "border-red-200",    icon: XCircle },
  COMPLETED: { label: "Completed", bg: "bg-[#F0F7FF]", text: "text-[#0D5FA6]", border: "border-[#BAD8F7]",  icon: Star },
} as const;

// ── StudentPanel ─────────────────────────────────────────────────
function StudentPanel({
  app,
  projectId,
  onClose,
  onStatusChange,
}: {
  app: Application;
  projectId: string;
  onClose: () => void;
  onStatusChange: (appId: string, status: "ACCEPTED" | "REJECTED") => void;
}) {
  const [updating, setUpdating] = useState(false);
  const s = app.students;
  if (!s) return null;

  const initial = s.full_name?.[0]?.toUpperCase() ?? "?";
  const cfg = STATUS[app.status as keyof typeof STATUS] ?? STATUS.PENDING;
  const StatusIcon = cfg.icon;

  const handleAction = async (status: "ACCEPTED" | "REJECTED") => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/project/${projectId}/application/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      onStatusChange(app.id, status);
      toast.success(status === "ACCEPTED" ? "Applicant accepted!" : "Applicant rejected");
    } catch {
      toast.error("Error updating status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l border-[#BAD8F7] shadow-2xl z-50 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8F3FD] bg-gradient-to-r from-[#F8FBFF] to-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#93B8D4]">Applicant Profile</p>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F0F7FF] text-[#93B8D4] hover:text-[#0D3A6E] transition">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Hero */}
        <div className="relative bg-gradient-to-br from-[#0D3A6E] to-[#1D5A9E] px-6 pt-8 pb-10">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#38A3F1] rounded-full blur-3xl" />
          </div>
          <div className="relative flex items-center gap-4">
            {s.avatar_url ? (
              <img src={s.avatar_url} alt={s.full_name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#38A3F1] to-[#0D5FA6] flex items-center justify-center text-2xl font-bold text-white border-2 border-white/20">
                {initial}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{s.full_name}</h2>
                {s.verified && (
                  <span className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                )}
              </div>
              {(s.university || s.education) && (
                <p className="text-sm text-[#BAD8F7]">{s.university ?? s.education}</p>
              )}
              {s.major && <p className="text-xs text-[#93B8D4]">{s.major}</p>}
            </div>
          </div>
          {/* Status */}
          <div className="relative mt-4">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {cfg.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5 -mt-4">

          {/* Actions */}
          {app.status === "PENDING" && (
            <div className="bg-white rounded-2xl border border-[#E8F3FD] shadow-lg p-4 flex gap-3">
              <button
                onClick={() => handleAction("ACCEPTED")}
                disabled={updating}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white text-sm font-semibold py-3 rounded-xl hover:bg-green-600 transition disabled:opacity-50"
              >
                <Check className="w-4 h-4" /> Accept
              </button>
              <button
                onClick={() => handleAction("REJECTED")}
                disabled={updating}
                className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-500 text-sm font-semibold py-3 rounded-xl hover:bg-red-100 transition disabled:opacity-50 border border-red-200"
              >
                <X className="w-4 h-4" /> Reject
              </button>
            </div>
          )}

          {/* Bio */}
          {s.bio && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#93B8D4] mb-2">About</p>
              <p className="text-sm text-[#5B8DB8] leading-relaxed">{s.bio}</p>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Mail, value: s.email, href: `mailto:${s.email}` },
              { icon: Phone, value: s.phone, href: `tel:${s.phone}` },
              { icon: MapPin, value: s.location },
              { icon: GraduationCap, value: s.graduation_year ? `Class of ${s.graduation_year}` : null },
            ].filter(i => i.value).map((item, idx) => {
              const Icon = item.icon;
              const content = (
                <div key={idx} className="flex items-center gap-2 p-3 bg-[#F8FBFF] rounded-xl border border-[#E8F3FD]">
                  <Icon className="w-3.5 h-3.5 text-[#38A3F1] flex-shrink-0" />
                  <span className="text-xs text-[#5B8DB8] truncate">{item.value}</span>
                </div>
              );
              return item.href
                ? <a key={idx} href={item.href}>{content}</a>
                : <div key={idx}>{content}</div>;
            })}
          </div>

          {/* Skills */}
          {s.skills && s.skills.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#93B8D4] mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {s.skills.map((skill, i) => (
                  <span key={i} className="text-xs bg-gradient-to-r from-[#F0F7FF] to-[#E8F3FD] text-[#0D5FA6] px-2.5 py-1 rounded-full border border-[#BAD8F7] font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          <div className="space-y-2">
  {[
    { label: "LinkedIn",  href: s.linkedin,                  color: "text-blue-600" },
    { label: "GitHub",    href: s.github,                    color: "text-[#0D3A6E]" },
    { label: "Portfolio", href: s.portfolio,                 color: "text-[#38A3F1]" },
    { label: "Resume",    href: s.resume_url,                color: "text-[#5B8DB8]" },
    { label: "Email",     href: `mailto:${s.email}`,         color: "text-[#38A3F1]" },
  ].filter(l => l.href).map((link, i) => (
    <a
      key={i}
      href={link.href!}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between px-4 py-3 rounded-xl border border-[#E8F3FD] hover:border-[#BAD8F7] hover:bg-[#F8FBFF] transition group"
    >
      <span className={`text-sm font-medium ${link.color}`}>{link.label}</span>
      <ExternalLink className="w-3.5 h-3.5 text-[#93B8D4] group-hover:text-[#38A3F1] transition" />
    </a>
  ))}
</div>
        </div>
      </div>
    </motion.div>
  );
}

// ── ProjectGroup ─────────────────────────────────────────────────
function ProjectGroup({
  project,
  filterStatus,
  onSelect,
  selectedAppId,
  onStatusChange,
}: {
  project: Project;
  filterStatus: string;
  onSelect: (app: Application, projectId: string) => void;
  selectedAppId: string | null;
  onStatusChange: (appId: string, status: "ACCEPTED" | "REJECTED") => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const filtered = project.applications.filter(a =>
    filterStatus === "ALL" ? true : a.status === filterStatus
  );

  if (filtered.length === 0) return null;

  const pending = project.applications.filter(a => a.status === "PENDING").length;

  return (
    <motion.div
      layout
      className="bg-white rounded-2xl border border-[#E8F3FD] overflow-hidden"
    >
      {/* Project header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#F8FBFF] transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0D3A6E] to-[#1D5A9E] flex items-center justify-center text-white font-bold text-sm">
            {project.title[0].toUpperCase()}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-[#0D3A6E]">{project.title}</p>
            <p className="text-xs text-[#93B8D4]">{filtered.length} application{filtered.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pending > 0 && (
            <span className="text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full">
              {pending} pending
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-[#93B8D4] transition-transform ${collapsed ? "-rotate-90" : ""}`} />
        </div>
      </button>

      {/* Applications list */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-[#F0F7FF] border-t border-[#E8F3FD]">
              {filtered.map((app) => {
                const s = app.students;
                const cfg = STATUS[app.status as keyof typeof STATUS] ?? STATUS.PENDING;
                const StatusIcon = cfg.icon;
                const isSelected = selectedAppId === app.id;
                const initial = s?.full_name?.[0]?.toUpperCase() ?? "?";
                const daysAgo = Math.floor((Date.now() - new Date(app.created_at).getTime()) / 86400000);

                return (
                  <motion.div
                    key={app.id}
                    layout
                    onClick={() => onSelect(app, project.id)}
                    className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-all ${
                      isSelected ? "bg-[#F0F7FF]" : "hover:bg-[#F8FBFF]"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {s?.avatar_url ? (
                        <img src={s.avatar_url} alt={s.full_name} className="w-9 h-9 rounded-full object-cover border border-[#BAD8F7]" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#38A3F1] to-[#0D5FA6] flex items-center justify-center text-sm font-bold text-white">
                          {initial}
                        </div>
                      )}
                      {s?.verified && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                          <Check className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0D3A6E] truncate">{s?.full_name ?? "Unknown"}</p>
                      <p className="text-xs text-[#93B8D4] truncate">{s?.university ?? s?.education ?? s?.major ?? "—"}</p>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-[#93B8D4]">{daysAgo === 0 ? "Today" : `${daysAgo}d ago`}</span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-colors ${isSelected ? "text-[#38A3F1]" : "text-[#BAD8F7]"}`} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Component ───────────────────────────────────────────────
export function PymeApplications({ projects }: Props) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedApp, setSelectedApp] = useState<{ app: Application; projectId: string } | null>(null);
  const [localProjects, setLocalProjects] = useState(projects);

  // Métricas
  const allApps = localProjects.flatMap(p => p.applications);
  const metrics = {
    total:    allApps.length,
    pending:  allApps.filter(a => a.status === "PENDING").length,
    accepted: allApps.filter(a => a.status === "ACCEPTED").length,
    rejected: allApps.filter(a => a.status === "REJECTED").length,
  };

  const handleStatusChange = (appId: string, status: "ACCEPTED" | "REJECTED") => {
    setLocalProjects(prev =>
      prev.map(p => ({
        ...p,
        applications: p.applications.map(a =>
          a.id === appId ? { ...a, status } : a
        ),
      }))
    );
    // Actualiza el panel si está abierto
    if (selectedApp?.app.id === appId) {
      setSelectedApp(prev => prev ? { ...prev, app: { ...prev.app, status } } : null);
    }
  };

  const filteredProjects = useMemo(() => {
    return localProjects.filter(p => {
      const titleMatch = p.title.toLowerCase().includes(search.toLowerCase());
      const appMatch = p.applications.some(a =>
        a.students?.full_name?.toLowerCase().includes(search.toLowerCase())
      );
      return titleMatch || appMatch;
    });
  }, [localProjects, search]);

  const statusFilters = [
    { key: "ALL",      label: "All",      count: metrics.total },
    { key: "PENDING",  label: "Pending",  count: metrics.pending },
    { key: "ACCEPTED", label: "Accepted", count: metrics.accepted },
    { key: "REJECTED", label: "Rejected", count: metrics.rejected },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-white to-[#E8F3FD]">
      <div className={`transition-all duration-300 ${selectedApp ? "mr-[400px]" : ""}`}>
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

          {/* Header */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#93B8D4] mb-1">Applications</p>
            <h1 className="text-2xl font-bold text-[#0D3A6E]">Candidate Pipeline</h1>
            <p className="text-sm text-[#5B8DB8] mt-1">Review and manage all incoming applications</p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total",    value: metrics.total,    icon: Users,       color: "text-[#38A3F1]", bg: "bg-[#F0F7FF]" },
              { label: "Pending",  value: metrics.pending,  icon: Clock,       color: "text-amber-500", bg: "bg-amber-50" },
              { label: "Accepted", value: metrics.accepted, icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
              { label: "Rejected", value: metrics.rejected, icon: XCircle,     color: "text-red-400",   bg: "bg-red-50" },
            ].map((m, i) => {
              const Icon = m.icon;
              return (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white rounded-2xl border border-[#E8F3FD] p-4 flex items-center gap-3"
                >
                  <div className={`w-10 h-10 ${m.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${m.color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[#0D3A6E]">{m.value}</p>
                    <p className="text-[10px] text-[#93B8D4] uppercase tracking-wide">{m.label}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Acceptance rate bar */}
          {metrics.total > 0 && (
            <div className="bg-white rounded-2xl border border-[#E8F3FD] px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-[#38A3F1]" />
                  <p className="text-sm font-semibold text-[#0D3A6E]">Pipeline breakdown</p>
                </div>
                <p className="text-xs text-[#93B8D4]">
                  {Math.round((metrics.accepted / metrics.total) * 100)}% acceptance rate
                </p>
              </div>
              <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
                {metrics.pending > 0 && (
                  <div className="bg-amber-400 rounded-full transition-all" style={{ width: `${(metrics.pending / metrics.total) * 100}%` }} />
                )}
                {metrics.accepted > 0 && (
                  <div className="bg-green-400 rounded-full transition-all" style={{ width: `${(metrics.accepted / metrics.total) * 100}%` }} />
                )}
                {metrics.rejected > 0 && (
                  <div className="bg-red-300 rounded-full transition-all" style={{ width: `${(metrics.rejected / metrics.total) * 100}%` }} />
                )}
              </div>
              <div className="flex gap-4 mt-2">
                {[
                  { color: "bg-amber-400", label: "Pending" },
                  { color: "bg-green-400", label: "Accepted" },
                  { color: "bg-red-300",   label: "Rejected" },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${l.color}`} />
                    <span className="text-[10px] text-[#93B8D4]">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by project or student name..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#BAD8F7] text-sm bg-white focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/10 transition"
              />
            </div>
            <div className="flex gap-1.5 bg-white border border-[#BAD8F7] rounded-xl p-1">
              {statusFilters.map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilterStatus(f.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterStatus === f.key
                      ? "bg-[#0D3A6E] text-white shadow-sm"
                      : "text-[#93B8D4] hover:text-[#0D3A6E] hover:bg-[#F0F7FF]"
                  }`}
                >
                  {f.label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    filterStatus === f.key ? "bg-white/20 text-white" : "bg-[#F0F7FF] text-[#5B8DB8]"
                  }`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Projects list */}
          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E8F3FD] py-20 flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-[#F0F7FF] rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8 text-[#BAD8F7]" />
              </div>
              <p className="text-sm font-semibold text-[#0D3A6E]">No applications found</p>
              <p className="text-xs text-[#93B8D4]">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProjects.map(p => (
                <ProjectGroup
                  key={p.id}
                  project={p}
                  filterStatus={filterStatus}
                  onSelect={(app, projectId) => setSelectedApp({ app, projectId })}
                  selectedAppId={selectedApp?.app.id ?? null}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Side Panel */}
      <AnimatePresence>
        {selectedApp && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="fixed inset-0 bg-[#0D3A6E]/10 backdrop-blur-sm z-40"
            />
            <StudentPanel
              app={selectedApp.app}
              projectId={selectedApp.projectId}
              onClose={() => setSelectedApp(null)}
              onStatusChange={handleStatusChange}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}