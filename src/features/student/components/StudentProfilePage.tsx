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
        .select("status")
        .eq("student_id", profileData.id);

      if (applications) {
        const apps = applications as { status: string }[];
        setStats({
          total: apps.length,
          pending: apps.filter(a => a.status === "PENDING").length,
          accepted: apps.filter(a => a.status === "ACCEPTED").length,
          rejected: apps.filter(a => a.status === "REJECTED").length,
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Error loading profile");
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
      toast.success("Profile updated!");
    } catch {
      toast.error("Error saving profile");
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
      toast.success("Uploaded successfully!");
    } catch {
      toast.error("Upload error");
    } finally {
      setUploading(false);
    }
  };

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    const current = editedProfile.skills ?? profile?.skills ?? [];
    if (current.includes(skillInput.trim())) { toast.error("Already added"); return; }
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
        <p className="text-[#5B8DB8] mt-4 font-medium">Loading your profile...</p>
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
          <h2 className="text-2xl font-bold text-[#0D3A6E] mb-3">Profile Not Found</h2>
          <p className="text-[#5B8DB8] mb-8 leading-relaxed">
            Complete your profile to start applying for projects and building your experience.
          </p>
          <Link 
            href="/onboarding/student" 
            className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#0D3A6E] to-[#1D5A9E] text-white font-semibold py-3.5 rounded-xl hover:shadow-lg hover:shadow-[#38A3F1]/25 transition-all group"
          >
            Complete Your Profile
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
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[#38A3F1] to-[#1D9E75] border-4 border-white shadow-xl flex items-center justify-center">
                      <User className="w-12 h-12 text-white" />
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
                <p className="text-sm text-[#5B8DB8]">{profile.university || profile.education || "University not specified"}</p>
                {profile.major && <p className="text-xs text-[#93B8D4]">{profile.major}</p>}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 p-4 bg-[#F8FBFE] border-y border-[#E8F3FD]">
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <div className="w-8 h-8 bg-[#F0F7FF] rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Briefcase className="w-4 h-4 text-[#38A3F1]" />
                  </div>
                  <p className="text-xl font-bold text-[#0D3A6E]">{stats.total}</p>
                  <p className="text-[10px] text-[#93B8D4] uppercase tracking-wider">Total</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-xl font-bold text-amber-600">{stats.pending}</p>
                  <p className="text-[10px] text-amber-500 uppercase tracking-wider">Pending</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-xl font-bold text-green-600">{stats.accepted}</p>
                  <p className="text-[10px] text-green-500 uppercase tracking-wider">Accepted</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <X className="w-4 h-4 text-red-500" />
                  </div>
                  <p className="text-xl font-bold text-red-500">{stats.rejected}</p>
                  <p className="text-[10px] text-red-500 uppercase tracking-wider">Rejected</p>
                </div>
              </div>

              {/* Skills */}
              <div className="p-6 pb-2">
                <h3 className="text-xs font-semibold text-[#0D3A6E] uppercase tracking-wider mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {(profile.skills ?? []).map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-[#F0F7FF] text-[#0D5FA6] text-xs rounded-full font-medium">{skill}</span>
                  ))}
                  {(!profile.skills?.length) && <p className="text-xs text-[#93B8D4]">No skills added yet</p>}
                </div>
              </div>

              {/* Contact Info */}
              <div className="p-6 space-y-3">
                <h3 className="text-xs font-semibold text-[#0D3A6E] uppercase tracking-wider mb-3">Contact</h3>
                
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
                    <FileText className="w-4 h-4" /> View Resume
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
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#38A3F1] to-[#1D9E75] text-white text-sm font-semibold py-3 rounded-xl hover:shadow-lg transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
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
                      {saving ? "Saving..." : "Save"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setIsEditing(false); setEditedProfile(profile); }}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-[#5B8DB8] text-sm font-semibold py-3 rounded-xl hover:bg-gray-200 transition-all"
                    >
                      <X className="w-4 h-4" />
                      Cancel
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
                    {tab === "profile" ? "Profile" : tab}
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
                              { key: "full_name", label: "Full name", type: "text", required: true },
                              { key: "email", label: "Email", type: "email", required: true },
                              { key: "phone", label: "Phone", type: "tel" },
                              { key: "location", label: "Location", type: "text" },
                              { key: "university", label: "University", type: "text" },
                              { key: "major", label: "Major", type: "text" },
                              { key: "graduation_year", label: "Graduation year", type: "text" },
                              { key: "linkedin", label: "LinkedIn", type: "url" },
                              { key: "github", label: "GitHub", type: "url" },
                              { key: "portfolio", label: "Portfolio", type: "url" },
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
                                  placeholder={`Enter your ${f.label.toLowerCase()}`}
                                />
                              </div>
                            ))}
                          </div>

                          {/* Skills editor */}
                          <div>
                            <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">Skills</label>
                            <div className="flex gap-2 mb-2">
                              <input 
                                value={skillInput} 
                                onChange={e => setSkillInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                                placeholder="Add a skill..."
                                className="flex-1 px-4 py-3 rounded-xl border border-[#BAD8F7] bg-white/50 text-sm focus:outline-none focus:border-[#38A3F1]"
                              />
                              <button 
                                type="button" 
                                onClick={handleAddSkill}
                                className="px-4 py-3 bg-[#38A3F1] text-white rounded-xl hover:bg-[#0D5FA6] transition text-sm font-medium"
                              >
                                Add
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
                            <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">Bio</label>
                            <textarea 
                              value={editedProfile.bio ?? ""}
                              onChange={e => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                              rows={4} 
                              className="w-full px-4 py-3 rounded-xl border border-[#BAD8F7] bg-white/50 text-sm focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all resize-none"
                              placeholder="Tell us about yourself..."
                            />
                          </div>

                          {/* Resume upload */}
                          <div>
                            <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">Resume</label>
                            <button 
                              type="button" 
                              onClick={() => resumeInputRef.current?.click()} 
                              disabled={uploadingResume}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[#BAD8F7] rounded-xl text-sm text-[#5B8DB8] hover:border-[#38A3F1] hover:text-[#38A3F1] transition"
                            >
                              {uploadingResume ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-[#38A3F1] border-t-transparent rounded-full animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4" />
                                  {profile.resume_url ? "Replace Resume" : "Upload Resume"}
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
                              <span className="w-1 h-5 bg-gradient-to-b from-[#38A3F1] to-[#1D9E75] rounded-full" />
                              About Me
                            </h3>
                            <p className="text-sm text-[#5B8DB8] leading-relaxed">
                              {profile.bio || "No bio provided yet. Add a description to help businesses get to know you."}
                            </p>
                          </div>

                          {/* Education & Location */}
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-[#F0F7FF] to-white rounded-xl p-4 border border-[#E8F3FD]">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-[#38A3F1]" />
                                <p className="text-xs text-[#93B8D4] uppercase tracking-wider">Education</p>
                              </div>
                              <p className="text-lg font-semibold text-[#0D3A6E]">
                                {profile.university || profile.education || "Not specified"}
                              </p>
                              {profile.major && (
                                <p className="text-xs text-[#5B8DB8] mt-1">
                                  {profile.major}{profile.graduation_year ? ` • Class of ${profile.graduation_year}` : ""}
                                </p>
                              )}
                            </div>
                            <div className="bg-gradient-to-br from-[#F0F7FF] to-white rounded-xl p-4 border border-[#E8F3FD]">
                              <div className="flex items-center gap-2 mb-2">
                                <MapPin className="w-4 h-4 text-[#38A3F1]" />
                                <p className="text-xs text-[#93B8D4] uppercase tracking-wider">Location</p>
                              </div>
                              <p className="text-lg font-semibold text-[#0D3A6E]">
                                {profile.location || "Not specified"}
                              </p>
                            </div>
                          </div>

                          {/* Tip */}
                          <div className="relative overflow-hidden bg-gradient-to-r from-[#38A3F1] to-[#1D9E75] rounded-xl p-5">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full opacity-10 blur-2xl" />
                            <div className="relative flex items-start gap-3">
                              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                                <Target className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-white font-semibold mb-1">Complete your profile to stand out</p>
                                <p className="text-[#E8F3FD] text-xs">
                                  Students with complete profiles are 5x more likely to get hired
                                </p>
                              </div>
                            </div>
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
                      className="text-center py-16"
                    >
                      <div className="w-24 h-24 bg-[#F0F7FF] rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-12 h-12 text-[#BAD8F7]" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0D3A6E] mb-3">Your Applications</h3>
                      <p className="text-sm text-[#5B8DB8] max-w-sm mx-auto mb-6">
                        Track all your project applications in one place
                      </p>
                      <Link 
                        href="/student/projects" 
                        className="inline-flex items-center gap-2 bg-[#38A3F1] text-white px-6 py-3 rounded-xl hover:bg-[#0D5FA6] transition font-medium"
                      >
                        Browse Projects <ChevronRight className="w-4 h-4" />
                      </Link>
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
                      <h3 className="text-base font-semibold text-[#0D3A6E] mb-4">Account Settings</h3>
                      
                      {[
                        { icon: Bell, label: "Notifications", desc: "Manage how you receive alerts and updates" },
                        { icon: Lock, label: "Security", desc: "Update password and security preferences" },
                        { icon: Shield, label: "Privacy", desc: "Control your profile visibility" },
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
                              <p className="text-sm font-semibold text-red-600">Sign Out</p>
                              <p className="text-xs text-red-400">Log out of your account</p>
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