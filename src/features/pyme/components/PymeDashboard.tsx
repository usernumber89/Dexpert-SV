"use client";

import {
  FolderOpen, Users, TrendingUp, Plus,
  Edit, X, Trash, Sparkles, MoreHorizontal,
  Eye, Calendar, Briefcase, CheckCircle,
  Clock, AlertCircle, ArrowUpRight,
  Search, Filter, Grid, List
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { CreateProjectModal } from "./CreateProjectModal";
import Image from "next/image";
import {CreditsWidget} from "./CreditsWidget"

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
  credits:{available:number;used:number};
};

export function PymeDashboard({ user, pyme, projects,credits }: Props) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "closed">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return project.status === "active" && project.is_published;
    if (statusFilter === "draft") return !project.is_published;
    if (statusFilter === "closed") return project.status === "closed";
    
    return true;
  });

  const stats = [
    { 
      label: "Total projects", 
      value: projects.length, 
      icon: FolderOpen,
      color: "text-[#38A3F1]",
      bgColor: "bg-[#38A3F1]/10"
    },
    { 
      label: "Active", 
      value: projects.filter(p => p.status === "active" && p.is_published).length, 
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-50"
    },
    { 
      label: "Drafts", 
      value: projects.filter(p => !p.is_published).length, 
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50"
    },
    { 
      label: "Applications", 
      value: projects.reduce((acc, p) => acc + (p.applications?.length || 0), 0), 
      icon: Users,
      color: "text-[#F59E0B]",
      bgColor: "bg-[#F59E0B]/10"
    },
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
      toast.success("Project closed successfully");
      router.refresh();
    }
    setIsLoading(false);
    setMenuOpen(null);
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) {
      toast.error("Error deleting project");
    } else {
      toast.success("Project deleted successfully");
      router.refresh();
    }
    setIsLoading(false);
    setMenuOpen(null);
  };

  const getStatusBadge = (project: Project) => {
    if (project.status === "closed") {
      return {
        label: "Closed",
        color: "bg-red-50 text-red-600 border-red-200",
        icon: AlertCircle
      };
    }
    if (!project.is_published) {
      return {
        label: "Draft",
        color: "bg-gray-50 text-gray-600 border-gray-200",
        icon: Clock
      };
    }
    return {
      label: "Active",
      color: "bg-green-50 text-green-600 border-green-200",
      icon: CheckCircle
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-white to-[#E8F3FD]">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-[#93B8D4] mb-2">
              Business Dashboard
            </p>
            <h1 className="text-2xl font-bold text-[#0D3A6E]">
              Welcome back, {pyme?.name ?? user.name}!
            </h1>
            <p className="text-sm text-[#5B8DB8] mt-1">
              Manage your projects and find talented students
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#0D3A6E] to-[#1D5A9E] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-[#38A3F1]/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Project
          </motion.button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2 }}
                className="bg-white rounded-xl border border-[#BAD8F7] p-4 hover:shadow-lg transition-all group"
              >
                <div className={`w-10 h-10 ${stat.bgColor} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-[#0D3A6E]">{stat.value}</p>
                <p className="text-xs text-[#5B8DB8] mt-1">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* AI Assistant Banner */}
        <CreditsWidget available={credits.available} used={credits.used} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden bg-gradient-to-r from-[#0D3A6E] to-[#1D5A9E] rounded-2xl p-6"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#38A3F1] rounded-full blur-3xl" />
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-[#F59E0B]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-medium text-[#F59E0B] uppercase tracking-widest">
                    AI Assistant
                  </p>
                  <span className="px-2 py-0.5 bg-[#F59E0B]/20 rounded-full text-[10px] text-[#F59E0B] font-medium">
                    New
                  </span>
                </div>
                <p className="text-white text-lg font-semibold mb-1">
                  Let AI write your project brief
                </p>
                <p className="text-[#BAD8F7] text-sm">
                  Describe your need in plain words — AI does the rest in seconds
                </p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreate(true)}
              className="flex-shrink-0 bg-white text-[#0D3A6E] text-sm font-semibold px-6 py-3 rounded-xl hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Create with AI
            </motion.button>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-[#BAD8F7] p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#BAD8F7] text-sm focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2.5 rounded-lg border border-[#BAD8F7] text-sm text-[#0D3A6E] bg-white focus:outline-none focus:border-[#38A3F1] cursor-pointer"
              >
                <option value="all">All Projects</option>
                <option value="active">Active</option>
                <option value="draft">Drafts</option>
                <option value="closed">Closed</option>
              </select>

              <div className="flex gap-1 p-1 bg-[#F0F7FF] rounded-lg">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "list" 
                      ? "bg-white shadow-sm text-[#0D3A6E]" 
                      : "text-[#93B8D4] hover:text-[#0D3A6E]"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "grid" 
                      ? "bg-white shadow-sm text-[#0D3A6E]" 
                      : "text-[#93B8D4] hover:text-[#0D3A6E]"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="bg-white rounded-xl border border-[#BAD8F7] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8F3FD] bg-gradient-to-r from-[#F0F7FF]/50 to-transparent">
            <div>
              <h2 className="text-sm font-semibold text-[#0D3A6E]">My Projects</h2>
              <p className="text-xs text-[#93B8D4] mt-0.5">
                {filteredProjects.length} {filteredProjects.length === 1 ? "project" : "projects"} found
              </p>
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 flex flex-col items-center gap-4"
            >
              <div className="w-20 h-20 bg-[#F0F7FF] rounded-2xl flex items-center justify-center">
                <FolderOpen className="w-10 h-10 text-[#BAD8F7]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[#0D3A6E] mb-1">
                  {searchTerm || statusFilter !== "all" ? "No matching projects" : "No projects yet"}
                </p>
                <p className="text-xs text-[#5B8DB8] mb-4">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your filters" 
                    : "Create your first project to get started"
                  }
                </p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="inline-flex items-center gap-2 bg-[#38A3F1] text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-[#0D5FA6] transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Project
                </button>
              </div>
            </motion.div>
          ) : viewMode === "list" ? (
            <div className="divide-y divide-[#E8F3FD]">
              {filteredProjects.map((project, index) => {
                const statusBadge = getStatusBadge(project);
                const StatusIcon = statusBadge.icon;
                
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group flex items-center gap-4 px-6 py-4 hover:bg-[#F0F7FF]/30 transition-all"
                  >
                    {/* Project Icon */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F0F7FF] to-[#E8F3FD] border border-[#BAD8F7] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        {project.image_url ? (
                          <Image
                            src={project.image_url}
                            alt={project.title}
                            width={48}
                            height={48}
                            className="rounded-xl object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold text-[#0D3A6E]">
                            {project.title[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Project Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/pyme/projects/${project.id}`}
                          className="text-sm font-semibold text-[#0D3A6E] hover:text-[#38A3F1] transition-colors truncate"
                        >
                          {project.title}
                        </Link>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </span>
                      </div>
                      
                      {project.description && (
                        <p className="text-xs text-[#5B8DB8] mb-2 line-clamp-1">
                          {project.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-xs text-[#93B8D4]">
                          <Users className="w-3 h-3" />
                          <span className="font-medium text-[#0D3A6E]">{project.applications?.length || 0}</span>
                          <span>application{(project.applications?.length || 0) !== 1 ? "s" : ""}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {project.skills.split(",").slice(0, 3).map((skill, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-[#F0F7FF] text-[#0D5FA6] px-2 py-0.5 rounded-full font-medium"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                          {project.skills.split(",").length > 3 && (
                            <span className="text-[10px] text-[#93B8D4] px-1">
                              +{project.skills.split(",").length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Link
                        href={`/pyme/projects/${project.id}`}
                        className="p-2 rounded-lg text-[#5B8DB8] hover:bg-[#F0F7FF] hover:text-[#0D3A6E] transition opacity-0 group-hover:opacity-100"
                        title="View project"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      
                      <Link
                        href={`/pyme/projects/${project.id}`}
                        className="p-2 rounded-lg text-[#5B8DB8] hover:bg-[#F0F7FF] hover:text-[#0D3A6E] transition"
                        title="Edit project"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>

                      <div className="relative">
                        <button
                          onClick={() => setMenuOpen(menuOpen === project.id ? null : project.id)}
                          className="p-2 rounded-lg text-[#5B8DB8] hover:bg-[#F0F7FF] hover:text-[#0D3A6E] transition"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        <AnimatePresence>
                          {menuOpen === project.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-0 top-10 z-20 bg-white rounded-xl border border-[#BAD8F7] shadow-xl py-1 w-48 overflow-hidden"
                              >
                                <button
                                  onClick={() => closeProject(project.id)}
                                  disabled={project.status === "closed" || isLoading}
                                  className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-[#5B8DB8] hover:bg-[#F0F7FF] disabled:opacity-40 transition"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  Close project
                                </button>
                                <button
                                  onClick={() => deleteProject(project.id)}
                                  disabled={isLoading}
                                  className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 transition"
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                  Delete project
                                </button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {filteredProjects.map((project, index) => {
                const statusBadge = getStatusBadge(project);
                const StatusIcon = statusBadge.icon;
                
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="group bg-white rounded-xl border border-[#BAD8F7] p-5 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F0F7FF] to-[#E8F3FD] border border-[#BAD8F7] flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-[#38A3F1]" />
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusBadge.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusBadge.label}
                      </span>
                    </div>

                    <Link href={`/pyme/projects/${project.id}`} className="block mb-2">
                      <h3 className="text-sm font-semibold text-[#0D3A6E] group-hover:text-[#38A3F1] transition-colors line-clamp-1">
                        {project.title}
                      </h3>
                    </Link>
                    
                    <p className="text-xs text-[#5B8DB8] mb-3 line-clamp-2">
                      {project.description || "No description provided"}
                    </p>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-1 text-xs text-[#93B8D4]">
                        <Users className="w-3 h-3" />
                        <span className="font-medium text-[#0D3A6E]">{project.applications?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#93B8D4]">
                        <Calendar className="w-3 h-3" />
                        <span>Active</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.skills.split(",").slice(0, 3).map((skill, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-[#F0F7FF] text-[#0D5FA6] px-2 py-0.5 rounded-full font-medium"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#E8F3FD]">
                      <div className="flex gap-1">
                        <Link
                          href={`/pyme/projects/${project.id}`}
                          className="p-1.5 rounded-lg text-[#5B8DB8] hover:bg-[#F0F7FF] transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/pyme/projects/${project.id}`}
                          className="p-1.5 rounded-lg text-[#5B8DB8] hover:bg-[#F0F7FF] transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                      <Link
                        href={`/pyme/projects/${project.id}/applications`}
                        className="text-[10px] font-medium text-[#38A3F1] hover:text-[#0D5FA6] flex items-center gap-1"
                      >
                        Applications
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateProjectModal
            onClose={() => setShowCreate(false)}
            onSuccess={() => { 
              setShowCreate(false); 
              router.refresh(); 
              toast.success("Project created successfully!");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}