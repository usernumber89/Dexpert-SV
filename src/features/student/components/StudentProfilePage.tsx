"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, Globe, MapPin, Save, X, Upload,
  Camera, AlertCircle, Edit, LogOut, ChevronRight,
  Shield, Bell, Lock, FileText, Target,
  Briefcase, Clock, CheckCircle, Calendar
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ProfileGallery } from "@/components/ProfileGallery";

type StudentProfile = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null; // aún puede existir en BD pero no lo usamos
  university: string | null;
  major: string | null;
  graduation_year: string | null;
  skills: string[] | null;
  linkedin: string | null;
  github: string | null;
  portfolio: string | null;
  resume_url: string | null;
  verified: boolean;
  education: string | null;
  language: string | null;
  linked_in: string | null;
  created_at: string;
  updated_at: string;
};
type ApplicationWithProject = {
  id: string;
  status: string;
  created_at: string;
  project: {
    id: string;
    title: string;
    description: string | null;
    skills: string;
    pyme: {
      company_name: string | null;
      logo_url: string | null;
    } | null;
  } | null;
};
type ApplicationStats = {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
};

export default function StudentProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [stats, setStats] = useState<ApplicationStats>({ total: 0, pending: 0, accepted: 0, rejected: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<StudentProfile>>({});
  const [activeTab, setActiveTab] = useState<"profile" | "settings" | "applications">("profile");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [applications, setApplications] = useState<ApplicationWithProject[]>([]);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const supabase = useRef(createClient());

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.current.auth.getUser();
      if (!user) { router.push("/sign-in"); return; }

      const { data: profileData, error } = await supabase.current
        .from("students")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setProfile(profileData);
      setEditedProfile(profileData);

      const { data: applications } = await supabase.current
  .from("applications")
  .select(`
    id,
    status,
    created_at,
    project:projects(
      id,
      title,
      description,
      skills,
      pyme:pymes(company_name, logo_url)
    )
  `)
  .eq("student_id", profileData.id)
  .order("created_at", { ascending: false });

if (applications) {
  const apps = applications as any[];
  setApplications(apps);
  setStats({
    total: apps.length,
    pending: apps.filter(a => a.status === "PENDING").length,
    accepted: apps.filter(a => a.status === "ACCEPTED").length,
    rejected: apps.filter(a => a.status === "REJECTED").length,
  });
}
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Error al cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const { error } = await supabase.current
        .from("students")
        .update({ ...editedProfile, updated_at: new Date().toISOString() })
        .eq("id", profile.id);

      if (error) throw error;
      setProfile({ ...profile, ...editedProfile });
      setIsEditing(false);
      toast.success("¡Perfil actualizado!");
    } catch {
      toast.error("Error al guardar el perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (
    file: File,
    bucket: string,
    path: string,
    field: keyof StudentProfile,
    setUploading: (v: boolean) => void
  ) => {
    if (!profile) return;
    setUploading(true);
    try {
      const { error: uploadError } = await supabase.current.storage
        .from(bucket).upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.current.storage
        .from(bucket).getPublicUrl(path);

      await supabase.current.from("students")
        .update({ [field]: publicUrl }).eq("id", profile.id);

      setProfile({ ...profile, [field]: publicUrl });
      setEditedProfile({ ...editedProfile, [field]: publicUrl });
      toast.success("¡Subido exitosamente!");
    } catch {
      toast.error("Error al subir");
    } finally {
      setUploading(false);
    }
  };

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    const current = editedProfile.skills ?? profile?.skills ?? [];
    if (current.includes(skillInput.trim())) { toast.error("Ya agregado"); return; }
    setEditedProfile({ ...editedProfile, skills: [...current, skillInput.trim()] });
    setSkillInput("");
  };

  const handleRemoveSkill = (skill: string) => {
    const current = editedProfile.skills ?? profile?.skills ?? [];
    setEditedProfile({ ...editedProfile, skills: current.filter(s => s !== skill) });
  };

  const handleSignOut = async () => {
    await supabase.current.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F9FF] via-white to-[#EEF6FF] flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#BAD8F7] border-t-[#38A3F1] rounded-full animate-spin mx-auto" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-[#1D9E75] rounded-full animate-pulse opacity-50" />
        </div>
        <p className="text-[#5B8DB8] mt-4 font-medium">Cargando tu perfil...</p>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F9FF] via-white to-[#EEF6FF] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-3xl border border-[#E8F3FD] shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-[#0D3A6E] mb-3">Perfil no encontrado</h2>
          <p className="text-[#5B8DB8] mb-8 leading-relaxed">
            Completa tu perfil para empezar a postularte a proyectos y construir tu experiencia.
          </p>
          <Link 
            href="/onboarding/student" 
            className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#0D3A6E] to-[#1D5A9E] text-white font-semibold py-3.5 rounded-xl hover:shadow-lg hover:shadow-[#38A3F1]/25 transition-all group"
          >
            Completa tu perfil
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </motion.div>
    </div>
  );

  const currentSkills = editedProfile.skills ?? profile.skills ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F9FF] via-white to-[#EEF6FF]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl border border-[#E8F3FD] shadow-xl overflow-hidden"
            >
              {/* Header con avatar y nombre */}
              <div className="relative pt-8 pb-4 px-6 text-center">
                <div className="relative w-28 h-28 mx-auto mb-4">
                  {profile.avatar_url ? (
                    <Image 
                      src={profile.avatar_url} 
                      alt={profile.full_name} 
                      fill
                      className="rounded-full object-cover border-4 border-white shadow-xl" 
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[#1D5A9E] border-4 border-white shadow-xl flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {profile.full_name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                  )}
                  {isEditing && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute -bottom-3 -right-3 bg-white p-2.5 rounded-full shadow-lg border-2 border-[#BAD8F7] hover:border-[#38A3F1] hover:scale-110 transition-all duration-200"
                    >
                      {uploadingAvatar
                        ? <div className="w-4 h-4 border-2 border-[#38A3F1] border-t-transparent rounded-full animate-spin" />
                        : <Camera className="w-4 h-4 text-[#38A3F1]" />}
                    </motion.button>
                  )}
                </div>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f, "avatars", `avatars/${profile.id}-${Date.now()}`, "avatar_url", setUploadingAvatar); }} />

                <h2 className="text-xl font-bold text-[#0D3A6E] mb-1">{profile.full_name}</h2>
                <p className="text-sm text-[#5B8DB8]">{profile.university || profile.education || "Universidad no especificada"}</p>
                {profile.major && <p className="text-xs text-[#93B8D4]">{profile.major}</p>}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 p-4 bg-[#F8FBFE] border-y border-[#E8F3FD]">
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <div className="w-8 h-8 bg-[#F0F7FF] rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Briefcase className="w-4 h-4 text-[#38A3F1]" />
                  </div>
                  <p className="text-xl font-bold text-[#0D3A6E]">{stats.total}</p>
                   <p className="text-[10px] text-[#93B8D4] uppercase tracking-wider">Totales</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <div className="w-8 h-8 bg-[#F0F7FF] rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-4 h-4 text-[#38A3F1]" />
                  </div>
                  <p className="text-xl font-bold text-[#0D3A6E]">{stats.pending}</p>
                  <p className="text-[10px] text-[#93B8D4] uppercase tracking-wider">Pendientes</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <div className="w-8 h-8 bg-[#F0F7FF] rounded-lg flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-4 h-4 text-[#1D5A9E]" />
                  </div>
                  <p className="text-xl font-bold text-[#0D3A6E]">{stats.accepted}</p>
                  <p className="text-[10px] text-[#1D5A9E] uppercase tracking-wider">Aceptadas</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <div className="w-8 h-8 bg-[#F0F7FF] rounded-lg flex items-center justify-center mx-auto mb-2">
                    <X className="w-4 h-4 text-[#1D5A9E]" />
                  </div>
                  <p className="text-xl font-bold text-[#0D3A6E]">{stats.rejected}</p>
                  <p className="text-[10px] text-[#1D5A9E] uppercase tracking-wider">Rechazadas</p>
                </div>
              </div>

              {/* Skills */}
              <div className="p-6 pb-2">
                <h3 className="text-xs font-semibold text-[#0D3A6E] uppercase tracking-wider mb-3">Habilidades</h3>
                <div className="flex flex-wrap gap-2">
                  {(profile.skills ?? []).map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-[#F0F7FF] text-[#0D5FA6] text-xs rounded-full font-medium">{skill}</span>
                  ))}
                  {(!profile.skills?.length) && <p className="text-xs text-[#93B8D4]">Sin habilidades aún</p>}
                </div>
              </div>

              {/* Contact Info */}
              <div className="p-6 space-y-3">
                <h3 className="text-xs font-semibold text-[#0D3A6E] uppercase tracking-wider mb-3">Contacto</h3>
                
                <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F0F7FF] transition-colors group">
                  <div className="w-8 h-8 bg-[#F0F7FF] rounded-lg flex items-center justify-center group-hover:bg-white transition-colors">
                    <Mail className="w-4 h-4 text-[#38A3F1]" />
                  </div>
                  <span className="text-sm text-[#5B8DB8] truncate">{profile.email}</span>
                </div>
                
                {profile.phone && (
                  <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F0F7FF] transition-colors group">
                    <div className="w-8 h-8 bg-[#F0F7FF] rounded-lg flex items-center justify-center group-hover:bg-white transition-colors">
                      <Phone className="w-4 h-4 text-[#38A3F1]" />
                    </div>
                    <span className="text-sm text-[#5B8DB8]">{profile.phone}</span>
                  </div>
                )}
                
                {profile.location && (
                  <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F0F7FF] transition-colors group">
                    <div className="w-8 h-8 bg-[#F0F7FF] rounded-lg flex items-center justify-center group-hover:bg-white transition-colors">
                      <MapPin className="w-4 h-4 text-[#38A3F1]" />
                    </div>
                    <span className="text-sm text-[#5B8DB8]">{profile.location}</span>
                  </div>
                )}
                
                {profile.portfolio && (
                  <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F0F7FF] transition-colors group">
                    <div className="w-8 h-8 bg-[#F0F7FF] rounded-lg flex items-center justify-center group-hover:bg-white transition-colors">
                      <Globe className="w-4 h-4 text-[#38A3F1]" />
                    </div>
                    <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="text-sm text-[#38A3F1] hover:underline truncate">
                      {profile.portfolio.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>

              {/* Resume Download */}
              {profile.resume_url && (
                <div className="px-6 pb-4">
                  <a 
                    href={profile.resume_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#F0F7FF] text-[#38A3F1] text-sm font-medium rounded-xl hover:bg-[#E8F3FD] transition"
                  >
                    <FileText className="w-4 h-4" /> Ver CV
                  </a>
                </div>
              )}

              {/* Action Buttons */}
              <div className="p-6 pt-0">
                {!isEditing ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsEditing(true)}
                    className="w-full flex items-center justify-center gap-2 bg-[#38A3F1] text-white text-sm font-semibold py-3 rounded-xl hover:shadow-lg transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    Editar perfil
                  </motion.button>
                ) : (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#1D9E75] text-white text-sm font-semibold py-3 rounded-xl hover:bg-[#158A5F] hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Guardando..." : "Guardar"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setIsEditing(false); setEditedProfile(profile); }}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-[#5B8DB8] text-sm font-semibold py-3 rounded-xl hover:bg-gray-200 transition-all"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white rounded-3xl border border-[#E8F3FD] shadow-xl overflow-hidden"
            >
              {/* Tabs */}
              <div className="flex p-1.5 bg-[#F0F7FF] m-4 rounded-xl">
                {(["profile", "applications", "settings"] as const).map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-sm font-medium rounded-lg capitalize transition-all duration-200 ${
                      activeTab === tab 
                        ? "bg-white text-[#0D3A6E] shadow-md" 
                        : "text-[#93B8D4] hover:text-[#0D3A6E] hover:bg-white/50"
                    }`}
                  >
                    {tab === "profile" ? "Perfil" : tab === "applications" ? "Postulaciones" : "Configuración"}
                  </button>
                ))}
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === "profile" && (
                    <motion.div 
                      key="profile" 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isEditing ? (
                        <div className="space-y-5">
                          <div className="grid md:grid-cols-2 gap-4">
                            {[
                              { key: "full_name", label: "Nombre completo", type: "text", required: true },
                              { key: "email", label: "Correo electrónico", type: "email", required: true },
                              { key: "phone", label: "Teléfono", type: "tel" },
                              { key: "location", label: "Ubicación", type: "text" },
                              { key: "university", label: "Universidad", type: "text" },
                              { key: "major", label: "Carrera", type: "text" },
                              { key: "graduation_year", label: "Año de graduación", type: "text" },
                              { key: "linkedin", label: "LinkedIn", type: "url" },
                              { key: "github", label: "GitHub", type: "url" },
                              { key: "portfolio", label: "Portafolio", type: "url" },
                            ].map(f => (
                              <div key={f.key} className={f.key === "full_name" || f.key === "email" ? "md:col-span-2" : ""}>
                                <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                                  {f.label} {f.required && <span className="text-red-400">*</span>}
                                </label>
                                <input 
                                  type={f.type} 
                                  value={(editedProfile as any)[f.key] ?? ""}
                                  onChange={e => setEditedProfile({ ...editedProfile, [f.key]: e.target.value })}
                                  className="w-full px-4 py-3 rounded-xl border border-[#BAD8F7] bg-white/50 text-sm focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                                  placeholder={`Ingresa tu ${f.label.toLowerCase()}`}
                                />
                              </div>
                            ))}
                          </div>

                          {/* Skills editor */}
                          <div>
                            <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">Habilidades</label>
                            <div className="flex gap-2 mb-2">
                              <input 
                                value={skillInput} 
                                onChange={e => setSkillInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                                placeholder="Agregar habilidad..."
                                className="flex-1 px-4 py-3 rounded-xl border border-[#BAD8F7] bg-white/50 text-sm focus:outline-none focus:border-[#38A3F1]"
                              />
                              <button 
                                type="button" 
                                onClick={handleAddSkill}
                                className="px-4 py-3 bg-[#38A3F1] text-white rounded-xl hover:bg-[#0D5FA6] transition text-sm font-medium"
                              >
                                Agregar
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {currentSkills.map((skill, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F0F7FF] text-[#0D5FA6] text-xs rounded-full font-medium">
                                  {skill}
                                  <button 
                                    type="button" 
                                    onClick={() => handleRemoveSkill(skill)} 
                                    className="hover:text-red-400 transition"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Bio */}
                          <div>
                            <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">Biografía</label>
                            <textarea 
                              value={editedProfile.bio ?? ""}
                              onChange={e => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                              rows={4} 
                              className="w-full px-4 py-3 rounded-xl border border-[#BAD8F7] bg-white/50 text-sm focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all resize-none"
                              placeholder="Cuéntanos sobre ti..."
                            />
                          </div>

                          {/* Resume upload */}
                          <div>
                            <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">CV</label>
                            <button 
                              type="button" 
                              onClick={() => resumeInputRef.current?.click()} 
                              disabled={uploadingResume}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[#BAD8F7] rounded-xl text-sm text-[#5B8DB8] hover:border-[#38A3F1] hover:text-[#38A3F1] transition"
                            >
                              {uploadingResume ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-[#38A3F1] border-t-transparent rounded-full animate-spin" />
                                  Subiendo...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4" />
                                  {profile.resume_url ? "Reemplazar CV" : "Subir CV"}
                                </>
                              )}
                            </button>
                            <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                              onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f, "documents", `resumes/${profile.id}-${Date.now()}`, "resume_url", setUploadingResume); }} />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Bio */}
                          <div>
                            <h3 className="text-base font-semibold text-[#0D3A6E] mb-4 flex items-center gap-2">
                              <span className="w-1 h-5 bg-[#38A3F1] rounded-full" />
                              Sobre mí
                            </h3>
                            <p className="text-sm text-[#5B8DB8] leading-relaxed">
                              {profile.bio || "Aún sin biografía. Agrega una descripción para que las empresas te conozcan."}
                            </p>
                          </div>

                          {/* Education & Location */}
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-[#F0F7FF] to-white rounded-xl p-4 border border-[#E8F3FD]">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-[#38A3F1]" />
                                <p className="text-xs text-[#93B8D4] uppercase tracking-wider">Educación</p>
                              </div>
                              <p className="text-lg font-semibold text-[#0D3A6E]">
                                {profile.university || profile.education || "No especificado"}
                              </p>
                              {profile.major && (
                                <p className="text-xs text-[#5B8DB8] mt-1">
                                  {profile.major}{profile.graduation_year ? ` • Prom. ${profile.graduation_year}` : ""}
                                </p>
                              )}
                            </div>
                            <div className="bg-gradient-to-br from-[#F0F7FF] to-white rounded-xl p-4 border border-[#E8F3FD]">
                              <div className="flex items-center gap-2 mb-2">
                                <MapPin className="w-4 h-4 text-[#38A3F1]" />
                                <p className="text-xs text-[#93B8D4] uppercase tracking-wider">Ubicación</p>
                              </div>
                              <p className="text-lg font-semibold text-[#0D3A6E]">
                                {profile.location || "No especificado"}
                              </p>
                            </div>
                          </div>

                          {/* Tip */}
                          <div className="relative overflow-hidden bg-[#1D5A9E] rounded-xl p-5">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full opacity-10 blur-2xl" />
                            <div className="relative flex items-start gap-3">
                              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                                <Target className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-white font-semibold mb-1">Completa tu perfil para destacar</p>
                                <p className="text-[#E8F3FD] text-xs">
                                  Los estudiantes con perfiles completos tienen 5x más probabilidades de ser contratados
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Profile Gallery */}
                          <div className="pt-4">
                            <h3 className="text-base font-semibold text-[#0D3A6E] mb-4 flex items-center gap-2">
                              <span className="w-1 h-5 bg-[#38A3F1] rounded-full" />
                              Galería
                            </h3>
                            <ProfileGallery
                              ownerId={profile.id}
                              type="student"
                              isOwner={true}
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === "applications" && (
  <motion.div
    key="applications"
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 10 }}
    transition={{ duration: 0.2 }}
  >
     <h3 className="text-base font-semibold text-[#0D3A6E] mb-4">Mis postulaciones</h3>

    {applications.length === 0 ? (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-[#F0F7FF] rounded-3xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-10 h-10 text-[#BAD8F7]" />
        </div>
        <p className="text-sm font-medium text-[#0D3A6E] mb-1">Sin postulaciones aún</p>
        <p className="text-xs text-[#93B8D4] mb-6">Explora proyectos y postúlate para empezar</p>
        <Link
          href="/student/projects"
          className="inline-flex items-center gap-2 bg-[#38A3F1] text-white px-6 py-3 rounded-xl hover:bg-[#0D5FA6] transition font-medium text-sm"
        >
          Explorar proyectos <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    ) : (
      <div className="space-y-3">
        {applications.map((app) => {
          const statusMap: Record<string, { label: string; bg: string; text: string }> = {
            PENDING:   { label: "Pendiente",   bg: "bg-amber-50",  text: "text-amber-600" },
            ACCEPTED:  { label: "Aceptado",  bg: "bg-green-50",  text: "text-green-600" },
            REJECTED:  { label: "Rechazado",  bg: "bg-red-50",    text: "text-red-500" },
            COMPLETED: { label: "Completado", bg: "bg-[#F0F7FF]", text: "text-[#0D5FA6]" },
          };
          const s = statusMap[app.status] ?? statusMap.PENDING;

          return (
            <Link
              key={app.id}
              href={`/student/projects/${app.project?.id}`}
              className="flex items-center gap-4 p-4 bg-[#F8FBFE] rounded-xl border border-[#E8F3FD] hover:border-[#BAD8F7] hover:bg-[#F0F7FF] transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#38A3F1] to-[#0D5FA6] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {app.project?.title?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0D3A6E] truncate group-hover:text-[#38A3F1] transition-colors">
                  {app.project?.title ?? "Proyecto desconocido"}
                </p>
                <div className="flex items-center gap-1.5">
                  {app.project?.pyme?.logo_url ? (
                    <img
                      src={app.project.pyme.logo_url}
                      alt={app.project.pyme.company_name || "Logo"}
                      className="w-4 h-4 rounded object-cover flex-shrink-0"
                    />
                  ) : null}
                  <span className="text-xs text-[#93B8D4] truncate">
                    {app.project?.pyme?.company_name ?? "Empresa desconocida"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
                  {s.label}
                </span>
                <ChevronRight className="w-4 h-4 text-[#93B8D4] group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    )}
  </motion.div>
)}

                  {activeTab === "settings" && (
                    <motion.div 
                      key="settings" 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      <h3 className="text-base font-semibold text-[#0D3A6E] mb-4">Configuración de cuenta</h3>
                      
                      {[
                        { icon: Bell, label: "Notificaciones", desc: "Administra cómo recibes alertas y actualizaciones" },
                        { icon: Lock, label: "Seguridad", desc: "Actualiza contraseña y preferencias de seguridad" },
                        { icon: Shield, label: "Privacidad", desc: "Controla la visibilidad de tu perfil" },
                      ].map((item, index) => (
                        <motion.div 
                          key={item.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-4 bg-[#F8FBFE] rounded-xl hover:bg-[#F0F7FF] border border-[#E8F3FD] hover:border-[#38A3F1] transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow transition-all">
                              <item.icon className="w-5 h-5 text-[#38A3F1]" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#0D3A6E]">{item.label}</p>
                              <p className="text-xs text-[#93B8D4]">{item.desc}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#93B8D4] group-hover:translate-x-1 group-hover:text-[#38A3F1] transition-all" />
                        </motion.div>
                      ))}
                      
                      <div className="pt-4 mt-4 border-t border-[#E8F3FD]">
                        <motion.button 
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={handleSignOut}
                          className="w-full flex items-center justify-between p-4 bg-red-50 rounded-xl hover:bg-red-100 border border-red-100 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                              <LogOut className="w-5 h-5 text-red-400" />
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-semibold text-red-600">Cerrar sesión</p>
                              <p className="text-xs text-red-400">Salir de tu cuenta</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}