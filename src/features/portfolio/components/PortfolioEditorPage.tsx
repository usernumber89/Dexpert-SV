"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, MotionConfig } from "framer-motion";
import Link from "next/link";
import {
  X, Plus, Trash2, Eye, Edit3, Save, ArrowLeft,
  GraduationCap, Briefcase, Globe, Quote, Palette,
  BookOpen, Sparkles, BadgeCheck, MapPin, ExternalLink,
  Calendar, ChevronDown, ChevronUp, GripVertical,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const GOLD = "#B8924A";

interface Education {
  id?: string;
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date: string;
  description: string;
}

interface Experience {
  id?: string;
  company: string;
  role: string;
  start_date: string;
  end_date: string;
  description: string;
  tools: string[];
}

interface PortfolioLink {
  id?: string;
  label: string;
  url: string;
}

interface EntryData {
  id: string;
  title: string;
  description: string | null;
  custom_description: string | null;
  tools_used: string[];
  role_description: string | null;
  project_url: string | null;
  featured: boolean;
  source_type: string;
  score?: number | null;
  completed_at: string | null;
  skills_demonstrated: string[];
}

type TabKey = "contenido" | "apariencia" | "entradas";

export function PortfolioEditorPage({ studentId }: { studentId: string }) {
  const [activeTab, setActiveTab] = useState<TabKey>("contenido");

  // Data
  const [aboutMe, setAboutMe] = useState("");
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [links, setLinks] = useState<PortfolioLink[]>([]);
  const [entries, setEntries] = useState<EntryData[]>([]);
  const [theme, setTheme] = useState("blue");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const supabase = useRef<ReturnType<typeof createClient> | null>(null);
  if (!supabase.current) supabase.current = createClient();

  const fetchAll = useCallback(async () => {
    const s = supabase.current!;
    const { data: student } = await s
      .from("students")
      .select("about_me, portfolio_theme")
      .eq("id", studentId)
      .maybeSingle();
    if (student) {
      setAboutMe(student.about_me || "");
      if (student.portfolio_theme) setTheme(student.portfolio_theme);
    }

    const [eduRes, expRes, linkRes, entriesRes] = await Promise.all([
      s.from("portfolio_education").select("*").eq("student_id", studentId).order("sort_order"),
      s.from("portfolio_experience").select("*").eq("student_id", studentId).order("sort_order"),
      s.from("portfolio_links").select("*").eq("student_id", studentId).order("sort_order"),
      s.from("portfolio_entries").select("*").eq("student_id", studentId).order("sort_order", { ascending: true }),
    ]);

    if (eduRes.data) setEducation(eduRes.data);
    if (expRes.data) setExperience(expRes.data);
    if (linkRes.data) setLinks(linkRes.data);
    if (entriesRes.data) setEntries(entriesRes.data as EntryData[]);

    setLoading(false);
  }, [studentId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Preview data derived from state (live)
  const previewStudent = {
    full_name: "Preview",
    about_me: aboutMe || null,
    bio: null,
    is_premium: true,
    id: studentId,
  };

  const THEMES: Record<string, string> = {
    blue: "from-[#0D3A6E] to-[#38A3F1]",
    dark: "from-[#0f0c29] to-[#24243e]",
    purple: "from-[#1a0533] to-[#7c3aed]",
    teal: "from-[#003333] to-[#009999]",
  };

  const activeEntries = entries.filter((e) => e.featured);
  const regularEntries = entries.filter((e) => !e.featured);
  const allItems = [...activeEntries, ...regularEntries];
  const allTools = [...new Set(entries.flatMap((e) => e.tools_used || []))];

  // ─── SAVE ───

  const handleSave = async () => {
    setSaving(true);
    const s = supabase.current!;
    try {
      await s.from("students").update({ about_me: aboutMe || null, portfolio_theme: theme }).eq("id", studentId);

      const existingEdu = education.filter((e) => e.id);
      const newEdu = education.filter((e) => !e.id);
      const savedEduIds = new Set(existingEdu.map((e) => e.id));
      const { data: allEdu } = await s.from("portfolio_education").select("id").eq("student_id", studentId);
      for (const row of allEdu ?? []) {
        if (!savedEduIds.has(row.id)) {
          await s.from("portfolio_education").delete().eq("id", row.id);
        }
      }
      for (const edu of existingEdu) {
        await s.from("portfolio_education").update(edu).eq("id", edu.id);
      }
      for (const edu of newEdu) {
        await s.from("portfolio_education").insert({ ...edu, student_id: studentId });
      }

      const existingExp = experience.filter((e) => e.id);
      const newExp = experience.filter((e) => !e.id);
      const savedExpIds = new Set(existingExp.map((e) => e.id));
      const { data: allExp } = await s.from("portfolio_experience").select("id").eq("student_id", studentId);
      for (const row of allExp ?? []) {
        if (!savedExpIds.has(row.id)) {
          await s.from("portfolio_experience").delete().eq("id", row.id);
        }
      }
      for (const exp of existingExp) {
        await s.from("portfolio_experience").update(exp).eq("id", exp.id);
      }
      for (const exp of newExp) {
        await s.from("portfolio_experience").insert({ ...exp, student_id: studentId });
      }

      const existingLinks = links.filter((l) => l.id);
      const newLinks = links.filter((l) => !l.id);
      const savedLinkIds = new Set(existingLinks.map((l) => l.id));
      const { data: allLinks } = await s.from("portfolio_links").select("id").eq("student_id", studentId);
      for (const row of allLinks ?? []) {
        if (!savedLinkIds.has(row.id)) {
          await s.from("portfolio_links").delete().eq("id", row.id);
        }
      }
      for (const link of existingLinks) {
        await s.from("portfolio_links").update(link).eq("id", link.id);
      }
      for (const link of newLinks) {
        await s.from("portfolio_links").insert({ ...link, student_id: studentId });
      }

      toast.success("Cambios guardados");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4F9FF] via-white to-[#EEF6FF] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#BAD8F7] border-t-[#38A3F1] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F9FF]">
      {/* Header */}
      <header className="bg-white border-b border-[#E3EEF7] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/student/portfolio" className="w-8 h-8 rounded-lg bg-[#F0F7FF] flex items-center justify-center hover:bg-[#E8F3FD] transition-colors">
              <ArrowLeft className="w-4 h-4 text-[#0D3A6E]" />
            </Link>
            <div>
              <h1 className="text-sm font-bold text-[#0D3A6E]">Personalizar portafolio</h1>
              <p className="text-[10px] text-[#93B8D4]">Todos los cambios se guardan automáticamente al salir</p>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-[#38A3F1] to-[#0D5FA6] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:from-[#0D5FA6] hover:to-[#0D3A6E] transition-all disabled:opacity-50 shadow-md">
            <Save className="w-4 h-4" />
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          {/* ─── LEFT: Editor ─── */}
          <div className="w-full lg:w-[440px] shrink-0 space-y-4">
            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-[#E3EEF7] p-1 flex">
              {[
                { key: "contenido" as TabKey, label: "Secciones", icon: Edit3 },
                { key: "apariencia" as TabKey, label: "Apariencia", icon: Palette },
                { key: "entradas" as TabKey, label: "Proyectos", icon: BookOpen },
              ].map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-xl transition-all ${
                    activeTab === tab.key ? "bg-[#0D3A6E] text-white shadow-sm" : "text-[#5B8DB8] hover:text-[#0D3A6E]"
                  }`}>
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab panels */}
            {activeTab === "contenido" && (
              <ContentEditor
                aboutMe={aboutMe} setAboutMe={setAboutMe}
                education={education} setEducation={setEducation}
                experience={experience} setExperience={setExperience}
                links={links} setLinks={setLinks}
              />
            )}

            {activeTab === "apariencia" && (
              <AppearanceEditor theme={theme} setTheme={setTheme} studentId={studentId} />
            )}

            {activeTab === "entradas" && (
              <EntriesEditor entries={entries} setEntries={setEntries} studentId={studentId} />
            )}
          </div>

          {/* ─── RIGHT: Live Preview ─── */}
          <div className="hidden lg:block flex-1 min-w-0">
            <div className="sticky top-20">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-[#93B8D4]" />
                <span className="text-xs font-semibold text-[#93B8D4] uppercase tracking-wider">Vista previa en vivo</span>
              </div>
              <div className="bg-white rounded-2xl border border-[#E3EEF7] overflow-hidden shadow-lg max-h-[calc(100vh-140px)] overflow-y-auto">
                <PreviewPanel
                  aboutMe={aboutMe}
                  education={education}
                  experience={experience}
                  links={links}
                  entries={allItems}
                  tools={allTools}
                  theme={theme}
                  themeGrad={THEMES[theme]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CONTENT EDITOR ───

function ContentEditor({ aboutMe, setAboutMe, education, setEducation, experience, setExperience, links, setLinks }: {
  aboutMe: string; setAboutMe: (v: string) => void;
  education: Education[]; setEducation: (v: Education[]) => void;
  experience: Experience[]; setExperience: (v: Experience[]) => void;
  links: PortfolioLink[]; setLinks: (v: PortfolioLink[]) => void;
}) {
  const [expandedSection, setExpandedSection] = useState<string | null>("about");

  const sections = [
    {
      key: "about",
      icon: Quote,
      label: "Sobre mí",
      count: aboutMe ? 1 : 0,
      content: (
        <textarea value={aboutMe} onChange={(e) => setAboutMe(e.target.value)}
          placeholder="Cuenta tu historia, tus motivaciones, lo que te hace único..."
          rows={5}
          className="w-full text-sm border border-[#E8F3FD] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30 focus:border-[#38A3F1] resize-none placeholder:text-[#BAD8D4]" />
      ),
    },
    {
      key: "education",
      icon: GraduationCap,
      label: "Educación",
      count: education.length,
      content: (
        <div className="space-y-3">
          {education.map((edu, i) => (
            <div key={i} className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E8F3FD] relative">
              <button onClick={() => setEducation(education.filter((_, j) => j !== i))} className="absolute top-3 right-3 text-[#93B8D4] hover:text-red-500">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="grid grid-cols-2 gap-2">
                <input value={edu.institution} onChange={(e) => { const ed = [...education]; ed[i] = { ...ed[i], institution: e.target.value }; setEducation(ed); }} placeholder="Institución" className="col-span-2 text-sm border border-[#E8F3FD] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30" />
                <input value={edu.degree} onChange={(e) => { const ed = [...education]; ed[i] = { ...ed[i], degree: e.target.value }; setEducation(ed); }} placeholder="Título" className="text-sm border border-[#E8F3FD] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30" />
                <input value={edu.field} onChange={(e) => { const ed = [...education]; ed[i] = { ...ed[i], field: e.target.value }; setEducation(ed); }} placeholder="Campo" className="text-sm border border-[#E8F3FD] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30" />
                <input value={edu.start_date} onChange={(e) => { const ed = [...education]; ed[i] = { ...ed[i], start_date: e.target.value }; setEducation(ed); }} placeholder="Inicio" className="text-sm border border-[#E8F3FD] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30" />
                <input value={edu.end_date} onChange={(e) => { const ed = [...education]; ed[i] = { ...ed[i], end_date: e.target.value }; setEducation(ed); }} placeholder="Fin" className="text-sm border border-[#E8F3FD] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30" />
              </div>
              <textarea value={edu.description} onChange={(e) => { const ed = [...education]; ed[i] = { ...ed[i], description: e.target.value }; setEducation(ed); }} placeholder="Descripción" rows={2} className="w-full text-sm border border-[#E8F3FD] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30 resize-none mt-2" />
            </div>
          ))}
          <button onClick={() => setEducation([...education, { institution: "", degree: "", field: "", start_date: "", end_date: "", description: "" }])}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-[#38A3F1] bg-[#F0F7FF] border border-dashed border-[#BAD8F7] py-3 rounded-xl hover:bg-[#E8F3FD] transition-colors">
            <Plus className="w-3.5 h-3.5" /> Agregar educación
          </button>
        </div>
      ),
    },
    {
      key: "experience",
      icon: Briefcase,
      label: "Experiencia",
      count: experience.length,
      content: (
        <div className="space-y-3">
          {experience.map((exp, i) => (
            <div key={i} className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E8F3FD] relative">
              <button onClick={() => setExperience(experience.filter((_, j) => j !== i))} className="absolute top-3 right-3 text-[#93B8D4] hover:text-red-500">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="grid grid-cols-2 gap-2">
                <input value={exp.company} onChange={(e) => { const ex = [...experience]; ex[i] = { ...ex[i], company: e.target.value }; setExperience(ex); }} placeholder="Empresa" className="col-span-2 text-sm border border-[#E8F3FD] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30" />
                <input value={exp.role} onChange={(e) => { const ex = [...experience]; ex[i] = { ...ex[i], role: e.target.value }; setExperience(ex); }} placeholder="Rol" className="col-span-2 text-sm border border-[#E8F3FD] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30" />
                <input value={exp.start_date} onChange={(e) => { const ex = [...experience]; ex[i] = { ...ex[i], start_date: e.target.value }; setExperience(ex); }} placeholder="Inicio" className="text-sm border border-[#E8F3FD] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30" />
                <input value={exp.end_date} onChange={(e) => { const ex = [...experience]; ex[i] = { ...ex[i], end_date: e.target.value }; setExperience(ex); }} placeholder="Fin" className="text-sm border border-[#E8F3FD] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30" />
              </div>
              <textarea value={exp.description} onChange={(e) => { const ex = [...experience]; ex[i] = { ...ex[i], description: e.target.value }; setExperience(ex); }} placeholder="Descripción" rows={2} className="w-full text-sm border border-[#E8F3FD] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30 resize-none mt-2" />
              <div className="mt-2">
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {(exp.tools || []).map((tool: string) => (
                    <span key={tool} className="inline-flex items-center gap-1 text-[11px] bg-[#F0F7FF] text-[#0D5FA6] px-2 py-0.5 rounded-full font-medium">
                      {tool}
                      <button onClick={() => { const ex = [...experience]; ex[i] = { ...ex[i], tools: (ex[i].tools || []).filter((t: string) => t !== tool) }; setExperience(ex); }}><X className="w-2.5 h-2.5" /></button>
                    </span>
                  ))}
                </div>
                <input placeholder="Tecnología (Enter para agregar)" className="w-full text-sm border border-[#E8F3FD] rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const val = (e.currentTarget as HTMLInputElement).value.trim(); if (val) { const ex = [...experience]; ex[i] = { ...ex[i], tools: [...(ex[i].tools || []), val] }; setExperience(ex); (e.currentTarget as HTMLInputElement).value = ""; } } }} />
              </div>
            </div>
          ))}
          <button onClick={() => setExperience([...experience, { company: "", role: "", start_date: "", end_date: "", description: "", tools: [] }])}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-[#38A3F1] bg-[#F0F7FF] border border-dashed border-[#BAD8F7] py-3 rounded-xl hover:bg-[#E8F3FD] transition-colors">
            <Plus className="w-3.5 h-3.5" /> Agregar experiencia
          </button>
        </div>
      ),
    },
    {
      key: "links",
      icon: Globe,
      label: "Enlaces",
      count: links.length,
      content: (
        <div className="space-y-2">
          {links.map((link, i) => (
            <div key={i} className="flex items-center gap-2">
              <input value={link.label} onChange={(e) => { const l = [...links]; l[i] = { ...l[i], label: e.target.value }; setLinks(l); }} placeholder="Label (ej: GitHub)" className="flex-1 text-sm border border-[#E8F3FD] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30" />
              <input value={link.url} onChange={(e) => { const l = [...links]; l[i] = { ...l[i], url: e.target.value }; setLinks(l); }} placeholder="URL" className="flex-[2] text-sm border border-[#E8F3FD] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30" />
              <button onClick={() => setLinks(links.filter((_, j) => j !== i))} className="text-[#93B8D4] hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          <button onClick={() => setLinks([...links, { label: "", url: "" }])}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-[#38A3F1] bg-[#F0F7FF] border border-dashed border-[#BAD8F7] py-3 rounded-xl hover:bg-[#E8F3FD] transition-colors">
            <Plus className="w-3.5 h-3.5" /> Agregar enlace
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-2">
      {sections.map((s) => {
        const isOpen = expandedSection === s.key;
        return (
          <div key={s.key} className="bg-white rounded-2xl border border-[#E3EEF7] overflow-hidden">
            <button onClick={() => setExpandedSection(isOpen ? null : s.key)}
              className="w-full flex items-center justify-between p-4 hover:bg-[#F8FBFE] transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F0F7FF] flex items-center justify-center">
                  <s.icon className="w-4 h-4 text-[#38A3F1]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#0D3A6E]">{s.label}</p>
                  <p className="text-[10px] text-[#93B8D4]">{s.count} elemento{(s.count as number) !== 1 ? "s" : ""}</p>
                </div>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-[#93B8D4]" /> : <ChevronDown className="w-4 h-4 text-[#93B8D4]" />}
            </button>
            {isOpen && (
              <div className="px-4 pb-4 border-t border-[#E8F3FD] pt-3">
                {s.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── APPEARANCE EDITOR ───

function AppearanceEditor({ theme, setTheme, studentId }: { theme: string; setTheme: (v: string) => void; studentId: string }) {
  const supabase = createClient();
  const themes = [
    { key: "blue", label: "Azul profesional", colors: "from-[#0D3A6E] to-[#38A3F1]", desc: "Clásico corporativo" },
    { key: "dark", label: "Oscuro", colors: "from-[#0f0c29] to-[#24243e]", desc: "Elegante y moderno" },
    { key: "purple", label: "Púrpura", colors: "from-[#1a0533] to-[#7c3aed]", desc: "Creativo" },
    { key: "teal", label: "Teal", colors: "from-[#003333] to-[#009999]", desc: "Fresco y juvenil" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E3EEF7] p-5 space-y-4">
      <div>
        <p className="text-sm font-semibold text-[#0D3A6E] mb-1">Tema de color</p>
        <p className="text-xs text-[#93B8D4] mb-4">Define la personalidad visual de tu portafolio</p>
        <div className="grid grid-cols-2 gap-3">
          {themes.map((t) => (
            <button key={t.key} onClick={async () => {
              setTheme(t.key);
              await supabase.from("students").update({ portfolio_theme: t.key }).eq("id", studentId);
            }}
              className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                theme === t.key ? "border-[#38A3F1] bg-[#F0F7FF]" : "border-[#E3EEF7] bg-white hover:border-[#BAD8F7]"
              }`}>
              <div className={`w-full h-10 rounded-lg bg-gradient-to-br ${t.colors} mb-2`} />
              <p className="text-xs font-semibold text-[#0D3A6E]">{t.label}</p>
              <p className="text-[10px] text-[#93B8D4]">{t.desc}</p>
              {theme === t.key && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#38A3F1] flex items-center justify-center">
                  <BadgeCheck className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ENTRIES EDITOR ───

function EntriesEditor({ entries, setEntries, studentId }: { entries: EntryData[]; setEntries: (v: EntryData[]) => void; studentId: string }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const supabase = createClient();

  const toggleFeatured = async (entry: EntryData) => {
    const updated = { ...entry, featured: !entry.featured };
    await supabase.from("portfolio_entries").update({ featured: updated.featured }).eq("id", entry.id);
    setEntries(entries.map((e) => e.id === entry.id ? updated : e));
    toast.success(updated.featured ? "Proyecto destacado" : "Destacado quitado");
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E3EEF7] p-5 space-y-3">
      <div>
        <p className="text-sm font-semibold text-[#0D3A6E] mb-1">Proyectos y entradas</p>
        <p className="text-xs text-[#93B8D4] mb-4">Personaliza cada entrada de tu portafolio</p>
      </div>
      {entries.length === 0 ? (
        <div className="text-center py-8 bg-[#F8FBFE] rounded-xl border border-dashed border-[#E3EEF7]">
          <BookOpen className="w-8 h-8 text-[#BAD8F7] mx-auto mb-2" />
          <p className="text-xs text-[#93B8D4]">Aún no hay proyectos en tu portafolio</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const isOpen = expandedId === entry.id;
            return (
              <div key={entry.id} className="border border-[#E8F3FD] rounded-xl overflow-hidden hover:border-[#BAD8F7] transition-colors">
                <button onClick={() => setExpandedId(isOpen ? null : entry.id)}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-[#F8FBFE] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <GripVertical className="w-3.5 h-3.5 text-[#BAD8F7] shrink-0" />
                    <div className="min-w-0 text-left">
                      <p className="text-sm font-semibold text-[#0D3A6E] truncate">{entry.title}</p>
                      <p className="text-[10px] text-[#93B8D4]">
                        {entry.featured && "Destacado · "}
                        {entry.source_type === "simulation" ? "Simulación" : "Proyecto real"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div onClick={(e) => { e.stopPropagation(); toggleFeatured(entry); }}
                      role="button" tabIndex={0}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); toggleFeatured(entry); } }}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                        entry.featured ? "bg-[#FBF4E8] text-[#B8924A]" : "bg-[#F0F7FF] text-[#BAD8F7] hover:text-[#38A3F1]"
                      }`}
                      title={entry.featured ? "Quitar destacado" : "Destacar"}>
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-[#93B8D4]" /> : <ChevronDown className="w-4 h-4 text-[#93B8D4]" />}
                  </div>
                </button>
                {isOpen && (
                  <EntryEditForm entry={entry} entries={entries} setEntries={setEntries} studentId={studentId} onClose={() => setExpandedId(null)} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EntryEditForm({ entry, entries, setEntries, studentId, onClose }: {
  entry: EntryData; entries: EntryData[]; setEntries: (v: EntryData[]) => void; studentId: string; onClose: () => void;
}) {
  const [customDescription, setCustomDescription] = useState(entry.custom_description || "");
  const [tools, setTools] = useState<string[]>(entry.tools_used || []);
  const [toolInput, setToolInput] = useState("");
  const [roleDescription, setRoleDescription] = useState(entry.role_description || "");
  const [projectUrl, setProjectUrl] = useState(entry.project_url || "");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const handleSave = async () => {
    setSaving(true);
    try {
      await supabase.from("portfolio_entries").update({
        custom_description: customDescription || null,
        tools_used: tools,
        role_description: roleDescription || null,
        project_url: projectUrl || null,
      }).eq("id", entry.id);
      setEntries(entries.map((e) => e.id === entry.id ? {
        ...e,
        custom_description: customDescription || null,
        tools_used: tools,
        role_description: roleDescription || null,
        project_url: projectUrl || null,
      } : e));
      toast.success("Entrada actualizada");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border-t border-[#E8F3FD] p-4 space-y-4 bg-[#F8FBFE]">
      <div>
        <label className="block text-xs font-semibold text-[#0D3A6E] mb-1">Descripción personalizada</label>
        <textarea value={customDescription} onChange={(e) => setCustomDescription(e.target.value)}
          placeholder="Cuenta qué hiciste en este proyecto..."
          rows={3} className="w-full text-sm border border-[#E8F3FD] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30 resize-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#0D3A6E] mb-1">Tu rol</label>
        <input value={roleDescription} onChange={(e) => setRoleDescription(e.target.value)}
          placeholder="Ej: Desarrollador frontend" className="w-full text-sm border border-[#E8F3FD] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#0D3A6E] mb-1">Herramientas</label>
        <div className="flex flex-wrap gap-1 mb-2">
          {tools.map((tool) => (
            <span key={tool} className="inline-flex items-center gap-1 text-[11px] bg-[#F0F7FF] text-[#0D5FA6] px-2 py-0.5 rounded-full font-medium">
              {tool}
              <button onClick={() => setTools(tools.filter((t) => t !== tool))}><X className="w-2.5 h-2.5" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={toolInput} onChange={(e) => setToolInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const t = toolInput.trim(); if (t && !tools.includes(t)) { setTools([...tools, t]); setToolInput(""); } } }}
            placeholder="Agregar tecnología..." className="flex-1 text-sm border border-[#E8F3FD] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30" />
          <button onClick={() => { const t = toolInput.trim(); if (t && !tools.includes(t)) { setTools([...tools, t]); setToolInput(""); } }}
            className="px-3 py-1.5 bg-[#F0F7FF] text-[#38A3F1] rounded-lg hover:bg-[#E8F3FD] text-xs font-semibold">+</button>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#0D3A6E] mb-1">Enlace al proyecto</label>
        <input value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)}
          placeholder="https://github.com/..." className="w-full text-sm border border-[#E8F3FD] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30" />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button onClick={onClose} className="text-xs font-semibold text-[#5B8DB8] px-3 py-1.5 rounded-lg hover:bg-white transition-colors">Cancelar</button>
        <button onClick={handleSave} disabled={saving}
          className="text-xs font-semibold text-white bg-[#38A3F1] px-4 py-1.5 rounded-lg hover:bg-[#0D5FA6] transition-colors disabled:opacity-50">
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}

// ─── LIVE PREVIEW ───

function PreviewPanel({ aboutMe, education, experience, links, entries, tools, theme, themeGrad }: {
  aboutMe: string;
  education: Education[];
  experience: Experience[];
  links: PortfolioLink[];
  entries: EntryData[];
  tools: string[];
  theme: string;
  themeGrad: string;
}) {
  const shortId = "PREVIEW";

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-[600px] bg-[#F8FAFC] font-sans text-[10px] leading-tight">
      {/* Mini Hero */}
      <div className={`bg-gradient-to-br ${themeGrad} px-4 pt-8 pb-12 relative overflow-hidden`}>
        <div className="relative text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/90 to-white/70 p-0.5 shadow-lg mx-auto mb-2">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#38A3F1] to-[#0D3A6E] flex items-center justify-center">
              <span className="font-bold text-sm text-white">P</span>
            </div>
          </div>
          <h2 className="text-sm font-bold text-white mb-1">Preview</h2>
          {education.length > 0 && (
            <p className="text-[9px] text-white/70">{education[0]?.institution}</p>
          )}
        </div>
      </div>

      {/* Mini Stats */}
      <div className="relative -mt-6 z-10 max-w-sm mx-auto px-2">
        <div className="grid grid-cols-3 bg-white rounded-xl border border-[#E3EEF7] shadow divide-x divide-[#E3EEF7]">
          <div className="text-center py-2 px-1">
            <p className="font-mono text-xs font-bold text-[#0D3A6E]">{entries.length}</p>
            <p className="text-[7px] text-[#93B8D4]">Proyectos</p>
          </div>
          <div className="text-center py-2 px-1">
            <p className="font-mono text-xs font-bold text-[#0D5FA6]">{tools.length}</p>
            <p className="text-[7px] text-[#93B8D4]">Skills</p>
          </div>
          <div className="text-center py-2 px-1">
            <p className="font-mono text-xs font-bold text-[#0D3A6E]">{education.length + experience.length}</p>
            <p className="text-[7px] text-[#93B8D4]">Secciones</p>
          </div>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-2 py-4 space-y-3">
        {/* About Me */}
        {aboutMe && (
          <div className="bg-white rounded-xl border border-[#E3EEF7] p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Quote className="w-3 h-3 text-[#8B5CF6]" />
              <h3 className="text-[9px] font-semibold text-[#0D3A6E]">Sobre mí</h3>
            </div>
            <p className="text-[9px] text-[#4C7BA0] leading-relaxed line-clamp-3">{aboutMe}</p>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E3EEF7] p-3">
            <h3 className="text-[9px] font-semibold text-[#0D3A6E] mb-2">Educación ({education.length})</h3>
            <div className="space-y-2">
              {education.slice(0, 2).map((edu, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#8B5CF6] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[9px] font-medium text-[#0D3A6E]">{edu.institution || "Institución"}</p>
                    <p className="text-[8px] text-[#93B8D4]">{edu.degree}{edu.field && ` · ${edu.field}`}</p>
                  </div>
                </div>
              ))}
              {education.length > 2 && <p className="text-[8px] text-[#BAD8F7]">+{education.length - 2} más</p>}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E3EEF7] p-3">
            <h3 className="text-[9px] font-semibold text-[#0D3A6E] mb-2">Experiencia ({experience.length})</h3>
            <div className="space-y-2">
              {experience.slice(0, 2).map((exp, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#D97706] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[9px] font-medium text-[#0D3A6E]">{exp.role || "Rol"} {exp.company && `· ${exp.company}`}</p>
                    <p className="text-[8px] text-[#93B8D4]">{exp.start_date}{exp.start_date && exp.end_date && " — "}{exp.end_date}</p>
                  </div>
                </div>
              ))}
              {experience.length > 2 && <p className="text-[8px] text-[#BAD8F7]">+{experience.length - 2} más</p>}
            </div>
          </div>
        )}

        {/* Links */}
        {links.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E3EEF7] p-3">
            <h3 className="text-[9px] font-semibold text-[#0D3A6E] mb-1.5">Enlaces ({links.length})</h3>
            <div className="flex flex-wrap gap-1">
              {links.map((link, i) => (
                <span key={i} className="text-[8px] bg-[#F0F7FF] text-[#38A3F1] px-2 py-0.5 rounded-full font-medium">{link.label || "Link"}</span>
              ))}
            </div>
          </div>
        )}

        {/* Mini entries */}
        {entries.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E3EEF7] p-3">
            <h3 className="text-[9px] font-semibold text-[#0D3A6E] mb-2">Proyectos ({entries.length})</h3>
            <div className="space-y-2">
              {entries.slice(0, 3).map((entry) => (
                <div key={entry.id} className="flex items-start gap-2 border-b border-[#F0F7FF] pb-1.5 last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-[#1D9E75] mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-medium text-[#0D3A6E] truncate">{entry.title}</p>
                    <div className="flex items-center gap-1.5 text-[7px] text-[#93B8D4]">
                      {entry.tools_used?.length > 0 && <span>· {entry.tools_used.length} tools</span>}
                      {entry.tools_used?.length > 0 && <span>· {entry.tools_used.length} tools</span>}
                    </div>
                  </div>
                </div>
              ))}
              {entries.length > 3 && <p className="text-[8px] text-[#BAD8F7]">+{entries.length - 3} más</p>}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!aboutMe && education.length === 0 && experience.length === 0 && links.length === 0 && entries.length === 0 && (
          <div className="text-center py-8 bg-white rounded-xl border border-dashed border-[#E3EEF7]">
            <Sparkles className="w-6 h-6 text-[#BAD8F7] mx-auto mb-1" />
            <p className="text-[9px] text-[#93B8D4]">Agrega secciones para ver la vista previa</p>
          </div>
        )}
      </div>
    </div>
    </MotionConfig>
  );
}