"use client";

import {
  FolderOpen, Users, TrendingUp, Plus,
  Edit, X, Trash, Sparkles, MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { CreateProjectModal } from "./CreateProjectModal";

type Student = {
  id: string;
  full_name: string | null;
  education: string | null;
  skills: string | null;
};

type Application = {
  id: string;
  status: string;
  student: Student;
};

type Project = {
  id: string;
  title: string;
  description: string | null;
  skills: string;
  image_url: string | null;
  is_published: boolean;
  status: string;
  applications: Application[];
};

type Pyme = {
  id: string;
  name: string;
  description: string | null;
};

type Props = {
  user: { name: string; avatarUrl?: string | null };
  pyme: Pyme | null;
  projects: Project[];
};

export function PymeDashboard({ user, pyme, projects }: Props) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const stats = [
    { label: "Total projects", value: projects.length, icon: FolderOpen },
    { label: "Active", value: projects.filter(p => p.status === "active" && p.is_published).length, icon: TrendingUp },
    { label: "Applications", value: projects.reduce((acc, p) => acc + (p.applications?.length || 0), 0), icon: Users },
  ];

  const closeProject = async (id: string) => {
    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("projects")
      .update({ status: "closed" })
      .eq("id", id);

    if (error) {
      toast.error("Error closing project");
    } else {
      toast.success("Project closed");
      router.refresh();
    }
    setIsLoading(false);
    setMenuOpen(null);
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) {
      toast.error("Error deleting project");
    } else {
      toast.success("Project deleted");
      router.refresh();
    }
    setIsLoading(false);
    setMenuOpen(null);
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-[#93B8D4] mb-1">Business dashboard</p>
          <h1 className="text-xl font-semibold text-[#0D3A6E]">{pyme?.name ?? user.name}</h1>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-[#38A3F1] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#0D5FA6] transition"
        >
          <Plus className="w-4 h-4" /> Add project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-[#BAD8F7] p-4">
            <s.icon className="w-4 h-4 text-[#38A3F1] mb-2" />
            <p className="text-2xl font-semibold text-[#0D3A6E]">{s.value}</p>
            <p className="text-xs text-[#5B8DB8] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* AI Banner */}
      <div className="bg-[#0D3A6E] rounded-xl p-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-[#38A3F1]" />
            <p className="text-xs font-medium text-[#38A3F1] uppercase tracking-widest">AI Assistant</p>
          </div>
          <p className="text-white text-sm font-medium">Let AI write your project brief</p>
          <p className="text-[#BAD8F7] text-xs mt-0.5">Describe your need in plain words — AI does the rest</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex-shrink-0 bg-[#38A3F1] text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-[#0D5FA6] transition"
        >
          Create with AI
        </button>
      </div>

      {/* Projects */}
      <div className="bg-white rounded-xl border border-[#BAD8F7] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8F3FD]">
          <h2 className="text-sm font-semibold text-[#0D3A6E]">My projects</h2>
          <span className="text-xs text-[#93B8D4]">{projects.length} {projects.length === 1 ? "project" : "projects"}</span>
        </div>

        {projects.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <FolderOpen className="w-10 h-10 text-[#BAD8F7]" />
            <p className="text-sm text-[#5B8DB8]">No projects yet</p>
            <button onClick={() => setShowCreate(true)} className="text-xs text-[#38A3F1] hover:underline">
              Create your first project
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#E8F3FD]">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F0F7FF]/50 transition-colors">

                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-[#F0F7FF] border border-[#BAD8F7] flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-[#0D3A6E]">
                    {project.title[0].toUpperCase()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-sm font-medium text-[#0D3A6E] truncate">{project.title}</p>
                    {project.is_published ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Draft
                      </span>
                    )}
                    {project.status === "closed" && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-400">Closed</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-[#5B8DB8]">
                      {project.applications?.length || 0} application{(project.applications?.length || 0) !== 1 ? "s" : ""}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {project.skills.split(",").slice(0, 2).map((s, i) => (
                        <span key={i} className="text-[10px] bg-[#F0F7FF] text-[#0D5FA6] px-2 py-0.5 rounded-full">
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
                    className="p-2 rounded-lg text-[#5B8DB8] hover:bg-[#F0F7FF] hover:text-[#0D3A6E] transition"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === project.id ? null : project.id)}
                      className="p-2 rounded-lg text-[#5B8DB8] hover:bg-[#F0F7FF] transition"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {menuOpen === project.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                        <div className="absolute right-0 top-9 z-20 bg-white border border-[#BAD8F7] rounded-xl shadow-lg py-1 w-44">
                          <button
                            onClick={() => closeProject(project.id)}
                            disabled={project.status === "closed" || isLoading}
                            className="flex items-center gap-2 w-full px-4 py-2 text-xs text-[#5B8DB8] hover:bg-[#F0F7FF] disabled:opacity-40 transition"
                          >
                            <X className="w-3.5 h-3.5" /> Close project
                          </button>
                          <button
                            onClick={() => deleteProject(project.id)}
                            disabled={isLoading}
                            className="flex items-center gap-2 w-full px-4 py-2 text-xs text-red-500 hover:bg-red-50 transition"
                          >
                            <Trash className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); router.refresh(); }}
        />
      )}
    </div>
  );
}