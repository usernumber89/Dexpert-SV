"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen,
  Users,
  TrendingUp,
  Plus,
  Edit,
  X,
  Trash,
  Sparkles,
  MoreHorizontal,
  Search,
  Filter,
  Briefcase,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  Calendar,
  MapPin,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { CreateProjectModal } from "@/features/pyme/components/CreateProjectModal";

type Student = {
  id: string;
  full_name: string | null;
  education: string | null;
  skills: string[];
  avatar_url: string | null;
};

type Application = {
  id: string;
  status: string;
  created_at: string;
  student: Student;
};

type Project = {
  id: string;
  title: string;
  description: string | null;
  skills_required: string[];
  image_url: string | null;
  is_published: boolean;
  status: string;
  budget: string | null;
  location: string | null;
  created_at: string;
  applications: Application[];
};

type Pyme = {
  id: string;
  company_name: string;
  description: string | null;
  logo_url: string | null;
};

export default function PymeProjectsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pyme, setPyme] = useState<Pyme | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "closed">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Cargar datos
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [searchTerm, statusFilter, projects]);

  const loadData = async () => {
    const supabase = createClient();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/sign-in");
        return;
      }

      // Cargar PYME
      const { data: pymeData } = await supabase
        .from("pymes")
        .select("*")
        .eq("id", user.id)
        .single();

      if (pymeData) setPyme(pymeData);

      // Cargar proyectos con aplicaciones
      const { data: projectsData } = await supabase
        .from("projects")
        .select(`
          *,
          applications (
            id,
            status,
            created_at,
            student:students (
              id,
              full_name,
              education,
              skills,
              avatar_url
            )
          )
        `)
        .eq("pyme_id", user.id)
        .order("created_at", { ascending: false });

      if (projectsData) {
        setProjects(projectsData);
        setFilteredProjects(projectsData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error loading projects");
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(p => {
        if (statusFilter === "active") return p.status === "active" && p.is_published;
        if (statusFilter === "draft") return !p.is_published;
        if (statusFilter === "closed") return p.status === "closed";
        return true;
      });
    }

    setFilteredProjects(filtered);
  };

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === "active" && p.is_published).length,
    draft: projects.filter(p => !p.is_published).length,
    closed: projects.filter(p => p.status === "closed").length,
    totalApplications: projects.reduce((acc, p) => acc + (p.applications?.length || 0), 0),
  };

  const closeProject = async (id: string) => {
    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("projects")
      .update({ status: "closed", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast.error("Error closing project");
    } else {
      toast.success("Project closed successfully");
      loadData();
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
      loadData();
    }
    setIsLoading(false);
    setMenuOpen(null);
  };

  const getStatusBadge = (project: Project) => {
    if (project.status === "closed") {
      return { label: "Closed", color: "bg-red-50 text-red-600 border-red-200", icon: XCircle };
    }
    if (!project.is_published) {
      return { label: "Draft", color: "bg-gray-50 text-gray-600 border-gray-200", icon: Clock };
    }
    return { label: "Active", color: "bg-green-50 text-green-600 border-green-200", icon: CheckCircle };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F7FF] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#38A3F1] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#5B8DB8]">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-white to-[#E8F3FD]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-[#93B8D4] mb-2">
                Projects Management
              </p>
              <h1 className="text-3xl font-bold text-[#0D3A6E]">
                {pyme?.company_name || "My Projects"}
              </h1>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-[#0D3A6E] to-[#1D5A9E] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-[#38A3F1]/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
          <p className="text-sm text-[#5B8DB8]">
            Manage and track all your projects in one place
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-[#BAD8F7] p-4"
          >
            <Briefcase className="w-4 h-4 text-[#38A3F1] mb-2" />
            <p className="text-2xl font-bold text-[#0D3A6E]">{stats.total}</p>
            <p className="text-xs text-[#5B8DB8]">Total Projects</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-[#BAD8F7] p-4"
          >
            <CheckCircle className="w-4 h-4 text-green-500 mb-2" />
            <p className="text-2xl font-bold text-[#0D3A6E]">{stats.active}</p>
            <p className="text-xs text-[#5B8DB8]">Active</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-[#BAD8F7] p-4"
          >
            <Clock className="w-4 h-4 text-yellow-500 mb-2" />
            <p className="text-2xl font-bold text-[#0D3A6E]">{stats.draft}</p>
            <p className="text-xs text-[#5B8DB8]">Drafts</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl border border-[#BAD8F7] p-4"
          >
            <XCircle className="w-4 h-4 text-red-500 mb-2" />
            <p className="text-2xl font-bold text-[#0D3A6E]">{stats.closed}</p>
            <p className="text-xs text-[#5B8DB8]">Closed</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl border border-[#BAD8F7] p-4"
          >
            <Users className="w-4 h-4 text-[#F59E0B] mb-2" />
            <p className="text-2xl font-bold text-[#0D3A6E]">{stats.totalApplications}</p>
            <p className="text-xs text-[#5B8DB8]">Applications</p>
          </motion.div>
        </div>

        {/* AI Assistant Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-[#0D3A6E] to-[#1D5A9E] rounded-xl p-5 mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <div>
              <p className="text-white font-semibold mb-1">
                Create projects faster with AI
              </p>
              <p className="text-[#BAD8F7] text-sm">
                Describe your project in plain words and let AI write the perfect brief
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-white text-[#0D3A6E] text-sm font-medium px-5 py-2.5 rounded-xl hover:shadow-lg transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Try AI Assistant
          </button>
        </motion.div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-[#BAD8F7] p-4 mb-6">
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
                className="px-4 py-2.5 rounded-lg border border-[#BAD8F7] text-sm text-[#0D3A6E] focus:outline-none focus:border-[#38A3F1]"
              >
                <option value="all">All Projects</option>
                <option value="active">Active</option>
                <option value="draft">Drafts</option>
                <option value="closed">Closed</option>
              </select>

              <div className="flex gap-1 p-1 bg-[#F0F7FF] rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-colors ${viewMode === "grid" ? "bg-white shadow-sm" : "text-[#93B8D4] hover:text-[#0D3A6E]"}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-colors ${viewMode === "list" ? "bg-white shadow-sm" : "text-[#93B8D4] hover:text-[#0D3A6E]"}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" />
                    <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" />
                    <line x1="3" y1="18" x2="21" y2="18" strokeWidth="2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-white rounded-xl border border-[#BAD8F7] overflow-hidden">
          {filteredProjects.length === 0 ? (
            <div className="py-20 text-center">
              <FolderOpen className="w-16 h-16 text-[#BAD8F7] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#0D3A6E] mb-2">
                {searchTerm ? "No projects found" : "No projects yet"}
              </h3>
              <p className="text-sm text-[#5B8DB8] mb-6">
                {searchTerm ? "Try adjusting your search" : "Create your first project to get started"}
              </p>
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 bg-[#38A3F1] text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-[#0D5FA6] transition"
              >
                <Plus className="w-4 h-4" />
                Create Project
              </button>
            </div>
          ) : viewMode === "list" ? (
            <div className="divide-y divide-[#E8F3FD]">
              {filteredProjects.map((project) => {
                const statusBadge = getStatusBadge(project);
                const StatusIcon = statusBadge.icon;
                
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-[#F0F7FF]/30 transition-colors group"
                  >
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F0F7FF] to-[#E8F3FD] border border-[#BAD8F7] flex items-center justify-center flex-shrink-0">
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

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
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
                      
                      <p className="text-xs text-[#5B8DB8] mb-2 line-clamp-1">
                        {project.description || "No description"}
                      </p>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-xs text-[#93B8D4]">
                          <Users className="w-3 h-3" />
                          {project.applications?.length || 0} applications
                        </div>
                        {project.budget && (
                          <div className="flex items-center gap-1 text-xs text-[#93B8D4]">
                            <DollarSign className="w-3 h-3" />
                            {project.budget}
                          </div>
                        )}
                        {project.location && (
                          <div className="flex items-center gap-1 text-xs text-[#93B8D4]">
                            <MapPin className="w-3 h-3" />
                            {project.location}
                          </div>
                        )}
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.skills_required?.slice(0, 3).map((skill, i) => (
                          <span key={i} className="text-[10px] bg-[#F0F7FF] text-[#0D5FA6] px-2 py-0.5 rounded-full">
                            {skill}
                          </span>
                        ))}
                        {project.skills_required?.length > 3 && (
                          <span className="text-[10px] text-[#93B8D4] px-1">
                            +{project.skills_required.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        href={`/pyme/projects/${project.id}`}
                        className="p-2 rounded-lg text-[#5B8DB8] hover:bg-[#F0F7FF] hover:text-[#0D3A6E] transition opacity-0 group-hover:opacity-100"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      
                      <Link
                        href={`/pyme/projects/${project.id}/edit`}
                        className="p-2 rounded-lg text-[#5B8DB8] hover:bg-[#F0F7FF] hover:text-[#0D3A6E] transition"
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
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 top-10 z-20 bg-white rounded-xl border border-[#BAD8F7] shadow-xl py-1 w-48"
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
              {filteredProjects.map((project) => {
                const statusBadge = getStatusBadge(project);
                const StatusIcon = statusBadge.icon;
                
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-xl border border-[#BAD8F7] p-5 hover:shadow-lg transition-shadow group"
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

                    <Link
                      href={`/pyme/projects/${project.id}`}
                      className="block mb-2"
                    >
                      <h3 className="text-sm font-semibold text-[#0D3A6E] hover:text-[#38A3F1] transition-colors line-clamp-1">
                        {project.title}
                      </h3>
                    </Link>
                    
                    <p className="text-xs text-[#5B8DB8] mb-3 line-clamp-2">
                      {project.description || "No description"}
                    </p>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-1 text-xs text-[#93B8D4]">
                        <Users className="w-3 h-3" />
                        {project.applications?.length || 0}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#93B8D4]">
                        <Calendar className="w-3 h-3" />
                        {new Date(project.created_at).toLocaleDateString()}
                      </div>
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
                          href={`/pyme/projects/${project.id}/edit`}
                          className="p-1.5 rounded-lg text-[#5B8DB8] hover:bg-[#F0F7FF] transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                      <Link
                        href={`/pyme/projects/${project.id}/applications`}
                        className="text-[10px] font-medium text-[#38A3F1] hover:text-[#0D5FA6] flex items-center gap-1"
                      >
                        View applications
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
              loadData();
              toast.success("Project created successfully!");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
