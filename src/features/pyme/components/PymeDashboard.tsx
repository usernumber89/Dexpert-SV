"use client";

import { Application, Project, Pyme, Student } from "@prisma/client";
import {
  FolderOpen, Users, TrendingUp, Plus, ChevronRight,
  Edit, X, Trash, Sparkles, MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { CreateProjectModal } from "./CreateProjectModal";

type ProjectWithApplications = Project & {
  applications: (Application & { student: Student })[];
};

type Props = {
  user: { name: string; imageUrl: string };
  pyme: Pyme | null;
  projects: ProjectWithApplications[];
};

export function PymeDashboard({ user, pyme, projects }: Props) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const stats = [
    {
      label: "Total projects",
      value: projects.length,
      icon: FolderOpen,
    },
    {
      label: "Active",
      value: projects.filter(p => p.status === "active" && p.isPublished).length,
      icon: TrendingUp,
    },
    {
      label: "Applications",
      value: projects.reduce((acc, p) => acc + p.applications.length, 0),
      icon: Users,
    },
  ];

  const closeProject = async (id: string) => {
    try {
      await axios.post(`/api/project/${id}/close`);
      toast.success("Project closed");
      router.refresh();
    } catch {
      toast.error("Error closing project");
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await axios.delete(`/api/project/${id}`);
      toast.success("Project deleted");
      router.refresh();
    } catch {
      toast.error("Error deleting project");
    }
  };

  return (
    <div className="min-h-screen bg-surface-raised p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-ink-muted mb-1">
            Business dashboard
          </p>
          <h1 className="text-xl font-semibold text-brand-navy">
            {pyme?.name ?? user.name}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-brand-mid text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-brand-title transition"
          >
            <Plus className="w-4 h-4" /> Add project
          </button>
          <Image
            src={user.imageUrl}
            alt={user.name}
            width={40}
            height={40}
            className="rounded-full border-2 border-brand-border"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-brand-border p-4">
            <s.icon className="w-4 h-4 text-brand-mid mb-2" />
            <p className="text-2xl font-semibold text-brand-navy">{s.value}</p>
            <p className="text-xs text-ink-secondary mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* AI Banner */}
      <div className="bg-brand-navy rounded-xl p-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-brand-mid" />
            <p className="text-xs font-medium text-brand-mid uppercase tracking-widest">
              AI Assistant
            </p>
          </div>
          <p className="text-white text-sm font-medium">
            Let AI write your project brief
          </p>
          <p className="text-ink-muted text-xs mt-0.5">
            Describe your need in plain words — AI does the rest
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex-shrink-0 bg-brand-mid text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-brand-title transition"
        >
          Create with AI
        </button>
      </div>

      {/* Projects list */}
      <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border">
          <h2 className="text-sm font-semibold text-brand-navy">My projects</h2>
          <span className="text-xs text-ink-muted">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </span>
        </div>

        {projects.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <FolderOpen className="w-10 h-10 text-brand-border" />
            <p className="text-sm text-ink-secondary">No projects yet</p>
            <button
              onClick={() => setShowCreate(true)}
              className="text-xs text-brand-mid hover:underline"
            >
              Create your first project
            </button>
          </div>
        ) : (
          <div className="divide-y divide-brand-border">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-raised transition-colors">

                {/* Image */}
                <div className="w-10 h-10 rounded-xl bg-surface-raised border border-brand-border flex items-center justify-center overflow-hidden flex-shrink-0">
                  {project.imageUrl ? (
                    <Image src={project.imageUrl} alt="" width={40} height={40} className="object-cover" />
                  ) : (
                    <span className="text-sm font-semibold text-brand-title">
                      {project.title[0]}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-sm font-medium text-brand-navy truncate">{project.title}</p>
                    {project.isPublished ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-surface-muted text-ink-muted">
                        <span className="w-1.5 h-1.5 rounded-full bg-ink-muted" /> Draft
                      </span>
                    )}
                    {project.status === "closed" && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-400">
                        Closed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-ink-secondary">
                      {project.applications.length} application{project.applications.length !== 1 ? "s" : ""}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {project.skills.split(",").slice(0, 2).map((s, i) => (
                        <span key={i} className="text-xs bg-brand-light text-brand-title px-2 py-0.5 rounded-full">
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/pyme/projects/${project.id}`}
                    className="p-2 rounded-lg text-ink-secondary hover:bg-surface-raised hover:text-brand-navy transition"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>

                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === project.id ? null : project.id)}
                      className="p-2 rounded-lg text-ink-secondary hover:bg-surface-raised hover:text-brand-navy transition"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {menuOpen === project.id && (
                      <div className="absolute right-0 top-9 z-10 bg-white border border-brand-border rounded-xl shadow-sm py-1 w-44">
                        <button
                          onClick={() => { closeProject(project.id); setMenuOpen(null); }}
                          disabled={project.status === "closed"}
                          className="flex items-center gap-2 w-full px-4 py-2 text-xs text-ink-secondary hover:bg-surface-raised disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <X className="w-3.5 h-3.5" /> Close project
                        </button>
                        <button
                          onClick={() => { deleteProject(project.id); setMenuOpen(null); }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-xs text-red-400 hover:bg-red-50"
                        >
                          <Trash className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}