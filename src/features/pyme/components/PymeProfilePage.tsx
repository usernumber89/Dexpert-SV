"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { PymeProfile, ProjectStats, PymeSettings, TeamMember, Invoice } from "./profile/types";
import { defaultSettings } from "./profile/types";
import { PymeProfileCard } from "./profile/PymeProfileCard";
import { PymeProfileForm } from "./profile/PymeProfileForm";
import { PymeProfileInfo } from "./profile/PymeProfileInfo";
import { PymeSettingsPanel } from "./profile/PymeSettingsPanel";
import { PymeBillingPanel } from "./profile/PymeBillingPanel";

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
  const [activeTab, setActiveTab] = useState<"perfil" | "configuración" | "cuenta">("perfil");
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const supabase = useRef(createClient());

  // Settings tab state
  const [expandedSetting, setExpandedSetting] = useState<string | null>(null);
  const [settings, setSettings] = useState<PymeSettings>(defaultSettings);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Security sub-tab
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Team sub-tab
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  // Billing tab state
  const [creditsAvailable, setCreditsAvailable] = useState(0);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingBilling, setLoadingBilling] = useState(false);

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

      const { data: projects } = await supabase.current
        .from("projects")
        .select("id, status, is_published, applications(id)")
        .eq("pyme_id", profileData.id);

      const projectsData = projects as { id: string; status: string; is_published: boolean; applications: { id: string }[] }[] | null;

      if (projectsData) {
        setStats({
          total: projectsData.length,
          active: projectsData.filter(p => p.status === "active" && p.is_published).length,
          completed: projectsData.filter(p => p.status === "completed").length,
          totalApplications: projectsData.reduce((acc, p) => acc + (p.applications?.length || 0), 0),
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error cargando el perfil. Por favor, inténtalo de nuevo.");
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
      toast.success("Perfil actualizado!");
    } catch {
      toast.error("Error guardando el perfil. Por favor, inténtalo de nuevo.");
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
      toast.success("Logo subido!");
    } catch {
      toast.error("Error al subir el logo. Por favor, inténtalo de nuevo.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.current.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const loadSettings = async () => {
    if (!profile) return;
    setLoadingSettings(true);
    try {
      const { data } = await supabase.current
        .from("pyme_settings")
        .select("*")
        .eq("pyme_id", profile.id)
        .single();

      if (data) {
        setSettings({
          notify_new_applicants: data.notify_new_applicants,
          notify_project_updates: data.notify_project_updates,
          notify_weekly_summary: data.notify_weekly_summary,
        });
      }
    } catch {
      // Table might not exist yet, use defaults
    } finally {
      setLoadingSettings(false);
    }
  };

  const saveSettings = async () => {
    if (!profile) return;
    setSavingSettings(true);
    try {
      const { error } = await supabase.current
        .from("pyme_settings")
        .upsert({
          pyme_id: profile.id,
          notify_new_applicants: settings.notify_new_applicants,
          notify_project_updates: settings.notify_project_updates,
          notify_weekly_summary: settings.notify_weekly_summary,
          updated_at: new Date().toISOString(),
        }, { onConflict: "pyme_id" });

      if (error) throw error;
      toast.success("Preferencias guardadas!");
    } catch {
      toast.error("Error guardando preferencias.");
    } finally {
      setSavingSettings(false);
    }
  };

  const passwordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast.error("Debes ingresar tu contraseña actual.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas nuevas no coinciden.");
      return;
    }
    if (passwordStrength(newPassword) < 3) {
      toast.error("La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.");
      return;
    }
    if (currentPassword === newPassword) {
      toast.error("La nueva contraseña debe ser diferente a la actual.");
      return;
    }

    setChangingPassword(true);
    try {
      const { error: signInError } = await supabase.current.auth.signInWithPassword({
        email: (await supabase.current.auth.getUser()).data.user?.email ?? "",
        password: currentPassword,
      });

      if (signInError) {
        toast.error("La contraseña actual es incorrecta.");
        setChangingPassword(false);
        return;
      }

      const { error } = await supabase.current.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Contraseña actualizada!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setExpandedSetting(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error al cambiar la contraseña.";
      if (msg.includes("re-authentication") || msg.includes("reauthentication")) {
        toast.error("Por seguridad, cierra sesión y vuelve a iniciarla para cambiar tu contraseña.");
      } else {
        toast.error(msg);
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const loadTeam = async () => {
    if (!profile) return;
    setLoadingTeam(true);
    try {
      const { data } = await supabase.current
        .from("pyme_team_members")
        .select("*")
        .eq("pyme_id", profile.id)
        .order("created_at", { ascending: true });

      setTeamMembers(data || []);
    } catch {
      setTeamMembers([]);
    } finally {
      setLoadingTeam(false);
    }
  };

  const handleAddMember = async () => {
    if (!profile || !newMemberEmail.trim()) return;
    setAddingMember(true);
    try {
      const { error } = await supabase.current
        .from("pyme_team_members")
        .insert({
          pyme_id: profile.id,
          email: newMemberEmail.trim(),
          name: newMemberName.trim() || null,
          role: "member",
          invited_by: profile.user_id,
          status: "active",
        });

      if (error) {
        if (error.code === "23505") {
          toast.error("Este miembro ya existe en el equipo.");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Miembro añadido!");
      setNewMemberEmail("");
      setNewMemberName("");
      loadTeam();
    } catch {
      toast.error("Error al añadir miembro.");
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!profile) return;
    try {
      const { error } = await supabase.current
        .from("pyme_team_members")
        .delete()
        .eq("id", memberId)
        .eq("pyme_id", profile.id);

      if (error) throw error;
      toast.success("Miembro eliminado.");
      loadTeam();
    } catch {
      toast.error("Error al eliminar miembro.");
    }
  };

  const loadBilling = async () => {
    if (!profile) return;
    setLoadingBilling(true);
    try {
      const { data: credits } = await supabase.current
        .from("pyme_credits")
        .select("credits_available, credits_used")
        .eq("pyme_id", profile.id)
        .single();

      if (credits) {
        setCreditsAvailable(credits.credits_available);
        setCreditsUsed(credits.credits_used);
      }

      const { data: invoiceData } = await supabase.current
        .from("invoices")
        .select("*")
        .eq("pyme_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setInvoices(invoiceData || []);
    } catch {
      // Tables may not exist yet
    } finally {
      setLoadingBilling(false);
    }
  };

  const handleTabChange = (tab: "perfil" | "configuración" | "cuenta") => {
    setActiveTab(tab);
    setExpandedSetting(null);
    if (tab === "configuración") {
      loadSettings();
      loadTeam();
    }
    if (tab === "cuenta") {
      loadBilling();
    }
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
          <h2 className="text-2xl font-bold text-[#0D3A6E] mb-3">Perfil No Encontrado</h2>
          <p className="text-[#5B8DB8] mb-8 leading-relaxed">
            Completa tu perfil empresarial para comenzar a publicar proyectos y conectarte con estudiantes talentosos.
          </p>
          <Link
            href="/onboarding/pyme"
            className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#0D3A6E] to-[#1D5A9E] text-white font-semibold py-3.5 rounded-xl hover:shadow-lg hover:shadow-[#38A3F1]/25 transition-all group"
          >
            Completa Tu Perfil
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F9FF] via-white to-[#EEF6FF]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          <div className="lg:col-span-1">
            <PymeProfileCard
              profile={profile}
              stats={stats}
              isEditing={isEditing}
              onStartEdit={() => setIsEditing(true)}
              onCancelEdit={() => { setIsEditing(false); setEditedProfile(profile); }}
              onSave={handleSave}
              onLogoUpload={handleLogoUpload}
              saving={saving}
              uploadingLogo={uploadingLogo}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white rounded-3xl border border-[#E8F3FD] shadow-xl overflow-hidden"
            >
              <div className="flex p-1.5 bg-[#F0F7FF] m-4 rounded-xl">
                {(["perfil", "configuración", "cuenta"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`flex-1 py-3 text-sm font-medium rounded-lg capitalize transition-all duration-200 ${
                      activeTab === tab
                        ? "bg-white text-[#0D3A6E] shadow-md"
                        : "text-[#93B8D4] hover:text-[#0D3A6E] hover:bg-white/50"
                    }`}
                  >
                    {tab === "perfil" ? "Perfil de la Empresa" : tab === "cuenta" ? "Facturación" : "Configuración"}
                  </button>
                ))}
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === "perfil" && (
                    <motion.div
                      key="profile"
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isEditing ? (
                        <PymeProfileForm editedProfile={editedProfile} onChange={setEditedProfile} />
                      ) : (
                        <PymeProfileInfo profile={profile} />
                      )}
                    </motion.div>
                  )}

                  {activeTab === "configuración" && (
                    <PymeSettingsPanel
                      settings={settings}
                      loadingSettings={loadingSettings}
                      savingSettings={savingSettings}
                      expandedSetting={expandedSetting}
                      currentPassword={currentPassword}
                      newPassword={newPassword}
                      confirmPassword={confirmPassword}
                      showNewPassword={showNewPassword}
                      changingPassword={changingPassword}
                      teamMembers={teamMembers}
                      loadingTeam={loadingTeam}
                      newMemberEmail={newMemberEmail}
                      newMemberName={newMemberName}
                      addingMember={addingMember}
                      onToggleSetting={setExpandedSetting}
                      onSaveSettings={saveSettings}
                      onToggleSettingItem={(key) => setSettings({ ...settings, [key]: !settings[key] })}
                      onCurrentPasswordChange={setCurrentPassword}
                      onNewPasswordChange={setNewPassword}
                      onConfirmPasswordChange={setConfirmPassword}
                      onShowNewPasswordChange={() => setShowNewPassword(!showNewPassword)}
                      onChangePassword={handleChangePassword}
                      onNewMemberEmailChange={setNewMemberEmail}
                      onNewMemberNameChange={setNewMemberName}
                      onAddMember={handleAddMember}
                      onRemoveMember={handleRemoveMember}
                      onSignOut={handleSignOut}
                    />
                  )}

                  {activeTab === "cuenta" && (
                    <PymeBillingPanel
                      creditsAvailable={creditsAvailable}
                      creditsUsed={creditsUsed}
                      invoices={invoices}
                      loadingBilling={loadingBilling}
                    />
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
