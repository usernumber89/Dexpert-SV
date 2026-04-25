"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Mail, Phone, Globe, MapPin, Save, X,
  Camera, AlertCircle, Edit, LogOut, ChevronRight,
  Bell, Lock, Users, CreditCard, Sparkles,
  Briefcase, TrendingUp, CheckCircle, Calendar
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type PymeProfile = {
  id: string;
  user_id: string;
  company_name: string;
  contact_person: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  location: string | null;
  description: string | null;
  industry: string | null;
  logo_url: string | null;
  founded_year: string | null;
  employee_count: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
};

type ProjectStats = {
  total: number;
  active: number;
  completed: number;
  totalApplications: number;
};

export default function PymeProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<PymeProfile | null>(null);
  const [stats, setStats] = useState<ProjectStats>({
    total: 0, active: 0, completed: 0, totalApplications: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<PymeProfile>>({});
  const [activeTab, setActiveTab] = useState<"profile" | "settings" | "billing">("profile");
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const supabase = useRef(createClient());

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.current.auth.getUser();
      if (!user) { router.push("/sign-in"); return; }

      const { data: profileData, error } = await supabase.current
        .from("pymes")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setProfile(profileData);
      setEditedProfile(profileData);

      type ProjectStatsItem = {
  id: string;
  status: string;
  is_published: boolean;
  applications: { id: string }[];
};

const { data: projects } = await supabase.current
  .from("projects")
  .select("id, status, is_published, applications(id)")
  .eq("pyme_id", profileData.id);

const projectsData = projects as ProjectStatsItem[] | null;

if (projectsData) {
  setStats({
    total: projectsData.length,
    active: projectsData.filter(p => p.status === "active" && p.is_published).length,
    completed: projectsData.filter(p => p.status === "closed").length,
    totalApplications: projectsData.reduce((acc, p) => acc + (p.applications?.length || 0), 0),
  });
}
    } catch (error) {
      console.error(error);
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
        .from("pymes")
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

  const handleLogoUpload = async (file: File) => {
    if (!profile) return;
    setUploadingLogo(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `logos/${profile.id}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.current.storage
        .from("avatars").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.current.storage
        .from("avatars").getPublicUrl(path);
      await supabase.current.from("pymes")
        .update({ logo_url: publicUrl }).eq("id", profile.id);

      setProfile({ ...profile, logo_url: publicUrl });
      setEditedProfile({ ...editedProfile, logo_url: publicUrl });
      toast.success("Logo uploaded!");
    } catch {
      toast.error("Upload error");
    } finally {
      setUploadingLogo(false);
    }
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
            Complete your business profile to start posting projects and connecting with talented students.
          </p>
          <Link
            href="/onboarding/pyme"
            className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#0D3A6E] to-[#1D5A9E] text-white font-semibold py-3.5 rounded-xl hover:shadow-lg hover:shadow-[#38A3F1]/25 transition-all group"
          >
            Complete Your Profile
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F9FF] via-white to-[#EEF6FF]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left Column – Profile Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl border border-[#E8F3FD] shadow-xl overflow-hidden"
            >
              {/* Logo Section */}
              <div className="relative pt-8 pb-4 px-6">
                <div className="relative w-28 h-28 mx-auto">
                  {profile.logo_url ? (
                    <Image
                      src={profile.logo_url}
                      alt={profile.company_name}
                      fill
                      className="rounded-2xl object-cover border-4 border-white shadow-xl"
                    />
                  ) : (
                    <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#38A3F1] to-[#1D9E75] border-4 border-white shadow-xl flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-white" />
                    </div>
                  )}
                  {isEditing && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="absolute -bottom-3 -right-3 bg-white p-2.5 rounded-full shadow-lg border-2 border-[#BAD8F7] hover:border-[#38A3F1] hover:scale-110 transition-all duration-200"
                    >
                      {uploadingLogo
                        ? <div className="w-4 h-4 border-2 border-[#38A3F1] border-t-transparent rounded-full animate-spin" />
                        : <Camera className="w-4 h-4 text-[#38A3F1]" />}
                    </motion.button>
                  )}
                </div>
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); }} />
              </div>

              {/* Company Info */}
              <div className="text-center px-6 pb-4">
                <h2 className="text-xl font-bold text-[#0D3A6E] mb-1">{profile.company_name}</h2>
                {profile.industry && (
                  <span className="inline-block px-3 py-1 bg-[#F0F7FF] text-[#38A3F1] text-xs font-medium rounded-full">
                    {profile.industry}
                  </span>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 p-4 bg-[#F8FBFE] border-y border-[#E8F3FD]">
                <StatItem icon={Briefcase} value={stats.total} label="Projects" color="text-[#38A3F1]" bg="bg-[#F0F7FF]" />
                <StatItem icon={Users} value={stats.totalApplications} label="Applications" color="text-[#F59E0B]" bg="bg-[#F0F7FF]" />
                <StatItem icon={TrendingUp} value={stats.active} label="Active" color="text-green-600" bg="bg-green-50" />
                <StatItem icon={CheckCircle} value={stats.completed} label="Completed" color="text-gray-600" bg="bg-gray-50" />
              </div>

              {/* Contact Information */}
              <div className="p-6 space-y-3">
                <h3 className="text-xs font-semibold text-[#0D3A6E] uppercase tracking-wider mb-3">Contact Information</h3>
                {profile.email && <ContactItem icon={Mail} value={profile.email} />}
                {profile.phone && <ContactItem icon={Phone} value={profile.phone} />}
                {profile.website && (
                  <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F0F7FF] transition-colors group">
                    <div className="w-8 h-8 bg-[#F0F7FF] rounded-lg flex items-center justify-center group-hover:bg-white transition-colors">
                      <Globe className="w-4 h-4 text-[#38A3F1]" />
                    </div>
                    <a href={profile.website} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-[#38A3F1] hover:underline truncate">
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {profile.location && <ContactItem icon={MapPin} value={profile.location} />}
              </div>

              {/* Edit / Save Buttons */}
              <div className="p-6 pt-0">
                {!isEditing ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setIsEditing(true)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#38A3F1] to-[#1D9E75] text-white text-sm font-semibold py-3 rounded-xl hover:shadow-lg transition-all"
                  >
                    <Edit className="w-4 h-4" /> Edit Profile
                  </motion.button>
                ) : (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handleSave} disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#1D9E75] text-white text-sm font-semibold py-3 rounded-xl hover:bg-[#158A5F] hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => { setIsEditing(false); setEditedProfile(profile); }}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-[#5B8DB8] text-sm font-semibold py-3 rounded-xl hover:bg-gray-200 transition-all"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column – Tabs */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white rounded-3xl border border-[#E8F3FD] shadow-xl overflow-hidden"
            >
              {/* Tabs */}
              <div className="flex p-1.5 bg-[#F0F7FF] m-4 rounded-xl">
                {(["profile", "settings", "billing"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-sm font-medium rounded-lg capitalize transition-all duration-200 ${
                      activeTab === tab
                        ? "bg-white text-[#0D3A6E] shadow-md"
                        : "text-[#93B8D4] hover:text-[#0D3A6E] hover:bg-white/50"
                    }`}
                  >
                    {tab === "profile" ? "Company Profile" : tab}
                  </button>
                ))}
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === "profile" && (
                    <motion.div
                      key="profile"
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isEditing ? (
                        <div className="space-y-5">
                          <div className="grid md:grid-cols-2 gap-4">
                            {[
                              { key: "company_name", label: "Company name", type: "text", required: true },
                              { key: "contact_person", label: "Contact person", type: "text", required: true },
                              { key: "email", label: "Email address", type: "email", required: true },
                              { key: "phone", label: "Phone number", type: "tel" },
                              { key: "website", label: "Website URL", type: "url" },
                              { key: "industry", label: "Industry", type: "text" },
                              { key: "founded_year", label: "Founded year", type: "text" },
                              { key: "location", label: "Location", type: "text" },
                            ].map(f => (
                              <div key={f.key} className={f.key === "company_name" || f.key === "email" ? "md:col-span-2" : ""}>
                                <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                                  {f.label} {f.required && <span className="text-red-400">*</span>}
                                </label>
                                <input
                                  type={f.type}
                                  value={(editedProfile as any)[f.key] ?? ""}
                                  onChange={e => setEditedProfile({ ...editedProfile, [f.key]: e.target.value })}
                                  className="w-full px-4 py-3 rounded-xl border border-[#BAD8F7] bg-white/50 text-sm focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                                  placeholder={`Enter ${f.label.toLowerCase()}`}
                                />
                              </div>
                            ))}
                            <div className="md:col-span-2">
                              <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">Employee count</label>
                              <select
                                value={editedProfile.employee_count ?? ""}
                                onChange={e => setEditedProfile({ ...editedProfile, employee_count: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-[#BAD8F7] bg-white/50 text-sm focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all cursor-pointer"
                              >
                                <option value="">Select employee count...</option>
                                {["1-10", "11-50", "51-200", "201-500", "500+"].map(v => (
                                  <option key={v} value={v}>{v} employees</option>
                                ))}
                              </select>
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">Company description</label>
                              <textarea
                                value={editedProfile.description ?? ""}
                                onChange={e => setEditedProfile({ ...editedProfile, description: e.target.value })}
                                rows={5}
                                className="w-full px-4 py-3 rounded-xl border border-[#BAD8F7] bg-white/50 text-sm focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all resize-none"
                                placeholder="Tell us about your company..."
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-base font-semibold text-[#0D3A6E] mb-4 flex items-center gap-2">
                              <span className="w-1 h-5 bg-gradient-to-b from-[#38A3F1] to-[#1D9E75] rounded-full" />
                              About the Company
                            </h3>
                            <p className="text-sm text-[#5B8DB8] leading-relaxed">
                              {profile.description || "No description provided yet. Add a description to help students understand your business better."}
                            </p>
                          </div>

                          <div>
                            <h3 className="text-base font-semibold text-[#0D3A6E] mb-4 flex items-center gap-2">
                              <span className="w-1 h-5 bg-gradient-to-b from-[#38A3F1] to-[#1D9E75] rounded-full" />
                              Company Details
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-gradient-to-br from-[#F0F7FF] to-white rounded-xl p-4 border border-[#E8F3FD]">
                                <div className="flex items-center gap-2 mb-2">
                                  <Calendar className="w-4 h-4 text-[#38A3F1]" />
                                  <p className="text-xs text-[#93B8D4] uppercase tracking-wider">Founded</p>
                                </div>
                                <p className="text-lg font-semibold text-[#0D3A6E]">
                                  {profile.founded_year || "—"}
                                </p>
                              </div>
                              <div className="bg-gradient-to-br from-[#F0F7FF] to-white rounded-xl p-4 border border-[#E8F3FD]">
                                <div className="flex items-center gap-2 mb-2">
                                  <Users className="w-4 h-4 text-[#38A3F1]" />
                                  <p className="text-xs text-[#93B8D4] uppercase tracking-wider">Company Size</p>
                                </div>
                                <p className="text-lg font-semibold text-[#0D3A6E]">
                                  {profile.employee_count || "—"}
                                </p>
                              </div>
                              <div className="col-span-2 bg-gradient-to-br from-[#F0F7FF] to-white rounded-xl p-4 border border-[#E8F3FD]">
                                <div className="flex items-center gap-2 mb-2">
                                  <MapPin className="w-4 h-4 text-[#38A3F1]" />
                                  <p className="text-xs text-[#93B8D4] uppercase tracking-wider">Location</p>
                                </div>
                                <p className="text-base font-medium text-[#0D3A6E]">
                                  {profile.location || "—"}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="relative overflow-hidden bg-gradient-to-r from-[#0D3A6E] to-[#1D5A9E] rounded-xl p-5">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full opacity-5 blur-2xl" />
                            <div className="relative flex items-start gap-3">
                              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-5 h-5 text-[#F59E0B]" />
                              </div>
                              <div>
                                <p className="text-white font-semibold mb-1">Complete your profile to attract more talent</p>
                                <p className="text-[#BAD8F7] text-xs">
                                  Businesses with complete profiles receive 3x more quality applications
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Settings Tab */}
                  {activeTab === "settings" && (
                    <motion.div
                      key="settings"
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      <h3 className="text-base font-semibold text-[#0D3A6E] mb-4">Account Settings</h3>
                      {[
                        { icon: Bell, label: "Notifications", desc: "Manage how you receive alerts and updates" },
                        { icon: Lock, label: "Security", desc: "Update password and security preferences" },
                        { icon: Users, label: "Team Management", desc: "Add or remove team members" },
                      ].map((item, index) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
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
                          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
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

                  {/* Billing Tab */}
                  {activeTab === "billing" && (
                    <motion.div
                      key="billing"
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="text-center py-16"
                    >
                      <div className="w-24 h-24 bg-[#F0F7FF] rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <CreditCard className="w-12 h-12 text-[#BAD8F7]" />
                      </div>
                      <h3 className="text-xl font-bold text-[#0D3A6E] mb-3">Billing Coming Soon</h3>
                      <p className="text-sm text-[#5B8DB8] max-w-sm mx-auto">
                        We're working on bringing you powerful billing features. Stay tuned!
                      </p>
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

// ── Pequeños componentes utilitarios ─────────────────────────────
function StatItem({ icon: Icon, value, label, color, bg }: {
  icon: any; value: number; label: string; color: string; bg: string;
}) {
  return (
    <div className="bg-white rounded-xl p-3 text-center shadow-sm">
      <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mx-auto mb-2`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-[#93B8D4] uppercase tracking-wider">{label}</p>
    </div>
  );
}

function ContactItem({ icon: Icon, value }: { icon: any; value: string }) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F0F7FF] transition-colors group">
      <div className="w-8 h-8 bg-[#F0F7FF] rounded-lg flex items-center justify-center group-hover:bg-white transition-colors">
        <Icon className="w-4 h-4 text-[#38A3F1]" />
      </div>
      <span className="text-sm text-[#5B8DB8] truncate">{value}</span>
    </div>
  );
}