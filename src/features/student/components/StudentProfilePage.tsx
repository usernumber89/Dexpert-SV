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
  banner_url: string | null;
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
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
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
        .eq("user_id", user.id)  // ← corregido
        .single();

      if (error) throw error;
      setProfile(profileData);
      setEditedProfile(profileData);

      const { data: applications } = await supabase.current
        .from("applications")
        .select("status")
        .eq("student_id", profileData.id);

      if (applications) {
        setStats({
          total: applications.length,
          pending: applications.filter(a => a.status === "PENDING").length,
          accepted: applications.filter(a => a.status === "ACCEPTED").length,
          rejected: applications.filter(a => a.status === "REJECTED").length,
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
    <div className="min-h-screen bg-[#F0F7FF] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#38A3F1] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-[#F0F7FF] flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-[#0D3A6E] mb-2">Profile not found</h2>
        <Link href="/onboarding/student" className="inline-flex items-center gap-2 bg-[#38A3F1] text-white px-6 py-2.5 rounded-xl hover:bg-[#0D5FA6] transition">
          Complete Profile <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );

  const currentSkills = editedProfile.skills ?? profile.skills ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-white to-[#E8F3FD]">
      {/* Banner */}
      <div className="relative h-48 bg-gradient-to-r from-[#38A3F1] to-[#1D9E75]">
        {profile.banner_url && (
          <Image src={profile.banner_url} alt="Banner" fill className="object-cover" />
        )}
        {isEditing && (
          <button
            onClick={() => bannerInputRef.current?.click()}
            disabled={uploadingBanner}
            className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-lg shadow-lg hover:bg-white transition"
          >
            {uploadingBanner
              ? <div className="w-4 h-4 border-2 border-[#38A3F1] border-t-transparent rounded-full animate-spin" />
              : <Camera className="w-4 h-4 text-[#0D3A6E]" />}
          </button>
        )}
        <input ref={bannerInputRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f, "avatars", `banners/${profile.id}-${Date.now()}`, "banner_url", setUploadingBanner); }} />
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-16 pb-12">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-[#BAD8F7] shadow-xl p-6">

              {/* Avatar */}
              <div className="relative -mt-16 mb-4">
                <div className="relative w-24 h-24 mx-auto">
                  {profile.avatar_url ? (
                    <Image src={profile.avatar_url} alt={profile.full_name} fill
                      className="rounded-full object-cover border-4 border-white shadow-lg" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[#38A3F1] to-[#1D9E75] border-4 border-white shadow-lg flex items-center justify-center">
                      <User className="w-10 h-10 text-white" />
                    </div>
                  )}
                  {isEditing && (
                    <button onClick={() => avatarInputRef.current?.click()} disabled={uploadingAvatar}
                      className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-lg border border-[#BAD8F7] hover:bg-[#F0F7FF] transition">
                      {uploadingAvatar
                        ? <div className="w-4 h-4 border-2 border-[#38A3F1] border-t-transparent rounded-full animate-spin" />
                        : <Camera className="w-4 h-4 text-[#38A3F1]" />}
                    </button>
                  )}
                </div>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f, "avatars", `avatars/${profile.id}-${Date.now()}`, "avatar_url", setUploadingAvatar); }} />
              </div>

              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-[#0D3A6E] mb-1">{profile.full_name}</h2>
                <p className="text-sm text-[#5B8DB8]">{profile.university || profile.education || "University not specified"}</p>
                <p className="text-xs text-[#93B8D4]">{profile.major || ""}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: "Applications", value: stats.total, bg: "bg-[#F0F7FF]", text: "text-[#0D3A6E]" },
                  { label: "Pending", value: stats.pending, bg: "bg-amber-50", text: "text-amber-600" },
                  { label: "Accepted", value: stats.accepted, bg: "bg-green-50", text: "text-green-600" },
                  { label: "Rejected", value: stats.rejected, bg: "bg-red-50", text: "text-red-500" },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                    <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
                    <p className={`text-xs ${s.text}`}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-[#0D3A6E] uppercase tracking-wider mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {(profile.skills ?? []).map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-[#F0F7FF] text-[#0D5FA6] text-xs rounded-full">{skill}</span>
                  ))}
                  {(!profile.skills?.length) && <p className="text-xs text-[#93B8D4]">No skills added yet</p>}
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-[#93B8D4]" />
                  <span className="text-[#5B8DB8]">{profile.email}</span>
                </div>
                {profile.phone && <div className="flex items-center gap-3 text-sm"><Phone className="w-4 h-4 text-[#93B8D4]" /><span className="text-[#5B8DB8]">{profile.phone}</span></div>}
                {profile.location && <div className="flex items-center gap-3 text-sm"><MapPin className="w-4 h-4 text-[#93B8D4]" /><span className="text-[#5B8DB8]">{profile.location}</span></div>}
                {profile.portfolio && <div className="flex items-center gap-3 text-sm"><Globe className="w-4 h-4 text-[#93B8D4]" /><a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="text-[#38A3F1] hover:underline truncate">{profile.portfolio}</a></div>}
              </div>

              {profile.resume_url && (
                <a href={profile.resume_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full mt-4 py-2.5 bg-[#F0F7FF] text-[#38A3F1] text-sm font-medium rounded-xl hover:bg-[#E8F3FD] transition">
                  <FileText className="w-4 h-4" /> View Resume
                </a>
              )}

              {/* Edit/Save */}
              <div className="flex gap-2 mt-6 pt-6 border-t border-[#E8F3FD]">
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#38A3F1] text-white text-sm font-medium py-2.5 rounded-xl hover:bg-[#0D5FA6] transition">
                    <Edit className="w-4 h-4" /> Edit Profile
                  </button>
                ) : (
                  <>
                    <button onClick={handleSave} disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#1D9E75] text-white text-sm font-medium py-2.5 rounded-xl hover:bg-[#158A5F] transition disabled:opacity-50">
                      <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
                    </button>
                    <button onClick={() => { setIsEditing(false); setEditedProfile(profile); }}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-[#5B8DB8] text-sm font-medium py-2.5 rounded-xl hover:bg-gray-200 transition">
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-[#BAD8F7] overflow-hidden">
              <div className="flex border-b border-[#E8F3FD]">
                {(["profile", "applications", "settings"] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 text-sm font-medium capitalize transition ${activeTab === tab ? "text-[#38A3F1] border-b-2 border-[#38A3F1]" : "text-[#5B8DB8] hover:text-[#0D3A6E]"}`}>
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === "profile" && (
                    <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            {[
                              { key: "full_name", label: "Full name", type: "text" },
                              { key: "email", label: "Email", type: "email" },
                              { key: "phone", label: "Phone", type: "tel" },
                              { key: "location", label: "Location", type: "text" },
                              { key: "university", label: "University", type: "text" },
                              { key: "major", label: "Major", type: "text" },
                              { key: "graduation_year", label: "Graduation year", type: "text" },
                              { key: "linkedin", label: "LinkedIn", type: "url" },
                              { key: "github", label: "GitHub", type: "url" },
                              { key: "portfolio", label: "Portfolio", type: "url" },
                            ].map(f => (
                              <div key={f.key}>
                                <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">{f.label}</label>
                                <input type={f.type}
                                  value={(editedProfile as any)[f.key] ?? ""}
                                  onChange={e => setEditedProfile({ ...editedProfile, [f.key]: e.target.value })}
                                  className="w-full px-4 py-2.5 rounded-xl border border-[#BAD8F7] text-sm focus:outline-none focus:border-[#38A3F1]" />
                              </div>
                            ))}
                          </div>

                          {/* Skills */}
                          <div>
                            <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">Skills</label>
                            <div className="flex gap-2 mb-2">
                              <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                                placeholder="Add a skill..."
                                className="flex-1 px-4 py-2.5 rounded-xl border border-[#BAD8F7] text-sm focus:outline-none focus:border-[#38A3F1]" />
                              <button type="button" onClick={handleAddSkill}
                                className="px-4 py-2.5 bg-[#38A3F1] text-white rounded-xl hover:bg-[#0D5FA6] transition text-sm">
                                Add
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {currentSkills.map((skill, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-[#F0F7FF] text-[#0D5FA6] text-xs rounded-full">
                                  {skill}
                                  <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-red-400">
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Bio */}
                          <div>
                            <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">Bio</label>
                            <textarea value={editedProfile.bio ?? ""}
                              onChange={e => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                              rows={4} className="w-full px-4 py-2.5 rounded-xl border border-[#BAD8F7] text-sm focus:outline-none focus:border-[#38A3F1] resize-none" />
                          </div>

                          {/* Resume */}
                          <div>
                            <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">Resume</label>
                            <button type="button" onClick={() => resumeInputRef.current?.click()} disabled={uploadingResume}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[#BAD8F7] rounded-xl text-sm text-[#5B8DB8] hover:border-[#38A3F1] hover:text-[#38A3F1] transition">
                              {uploadingResume ? <><div className="w-4 h-4 border-2 border-[#38A3F1] border-t-transparent rounded-full animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" />{profile.resume_url ? "Replace Resume" : "Upload Resume"}</>}
                            </button>
                            <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                              onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f, "documents", `resumes/${profile.id}-${Date.now()}`, "resume_url", setUploadingResume); }} />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-sm font-semibold text-[#0D3A6E] mb-3">About Me</h3>
                            <p className="text-sm text-[#5B8DB8] leading-relaxed">{profile.bio || "No bio provided yet."}</p>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-[#F0F7FF] rounded-xl p-4">
                              <p className="text-xs text-[#93B8D4] mb-1">Education</p>
                              <p className="text-sm font-medium text-[#0D3A6E]">{profile.university || profile.education || "Not specified"}</p>
                              {profile.major && <p className="text-xs text-[#5B8DB8] mt-1">{profile.major} {profile.graduation_year ? `• Class of ${profile.graduation_year}` : ""}</p>}
                            </div>
                            <div className="bg-[#F0F7FF] rounded-xl p-4">
                              <p className="text-xs text-[#93B8D4] mb-1">Location</p>
                              <p className="text-sm font-medium text-[#0D3A6E]">{profile.location || "Not specified"}</p>
                            </div>
                          </div>
                          <div className="bg-[#F0F7FF] rounded-xl p-4 border border-[#BAD8F7]">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Target className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-[#0D3A6E] mb-1">Complete your profile to stand out</p>
                                <p className="text-xs text-[#5B8DB8]">Students with complete profiles are 5x more likely to get hired</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === "applications" && (
                    <motion.div key="applications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="text-center py-12">
                      <FileText className="w-16 h-16 text-[#BAD8F7] mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-[#0D3A6E] mb-2">Your Applications</h3>
                      <p className="text-sm text-[#5B8DB8] mb-4">Track all your project applications in one place</p>
                      <Link href="/student/projects"
                        className="inline-flex items-center gap-2 bg-[#38A3F1] text-white px-4 py-2 rounded-xl hover:bg-[#0D5FA6] transition">
                        Browse Projects <ChevronRight className="w-4 h-4" />
                      </Link>
                    </motion.div>
                  )}

                  {activeTab === "settings" && (
                    <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="space-y-4">
                      {[
                        { href: "#", icon: Bell, label: "Notifications", desc: "Manage email and in-app notifications" },
                        { href: "#", icon: Lock, label: "Security", desc: "Password and authentication settings" },
                        { href: "#", icon: Shield, label: "Privacy", desc: "Control your profile visibility" },
                      ].map(item => (
                        <Link key={item.label} href={item.href}
                          className="flex items-center justify-between p-4 bg-[#F0F7FF] rounded-xl hover:bg-[#E8F3FD] transition group">
                          <div className="flex items-center gap-3">
                            <item.icon className="w-5 h-5 text-[#38A3F1]" />
                            <div>
                              <p className="text-sm font-medium text-[#0D3A6E]">{item.label}</p>
                              <p className="text-xs text-[#5B8DB8]">{item.desc}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#93B8D4] group-hover:translate-x-1 transition-transform" />
                        </Link>
                      ))}
                      <button onClick={handleSignOut}
                        className="w-full flex items-center justify-between p-4 bg-red-50 rounded-xl hover:bg-red-100 transition">
                        <div className="flex items-center gap-3">
                          <LogOut className="w-5 h-5 text-red-400" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-red-600">Sign Out</p>
                            <p className="text-xs text-red-400">Log out of your account</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-red-400" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}