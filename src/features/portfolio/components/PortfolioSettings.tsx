"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

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

export function PortfolioSettings({ studentId, onClose, onSaved }: {
  studentId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [aboutMe, setAboutMe] = useState("");
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [links, setLinks] = useState<PortfolioLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  // Track original IDs so we know what was removed
  const [originalEduIds] = useState<Set<string>>(new Set());
  const [originalExpIds] = useState<Set<string>>(new Set());
  const [originalLinkIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const { data: student } = await supabase
        .from("students")
        .select("about_me")
        .eq("id", studentId)
        .single();
      if (student) setAboutMe(student.about_me || "");

      const [eduRes, expRes, linkRes] = await Promise.all([
        supabase.from("portfolio_education").select("*").eq("student_id", studentId).order("sort_order"),
        supabase.from("portfolio_experience").select("*").eq("student_id", studentId).order("sort_order"),
        supabase.from("portfolio_links").select("*").eq("student_id", studentId).order("sort_order"),
      ]);
      if (eduRes.data) {
        setEducation(eduRes.data);
        eduRes.data.forEach((e: any) => originalEduIds.add(e.id));
      }
      if (expRes.data) {
        setExperience(expRes.data);
        expRes.data.forEach((e: any) => originalExpIds.add(e.id));
      }
      if (linkRes.data) {
        setLinks(linkRes.data);
        linkRes.data.forEach((l: any) => originalLinkIds.add(l.id));
      }
      setLoading(false);
    })();
  }, [studentId, supabase, originalEduIds, originalExpIds, originalLinkIds]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await supabase.from("students").update({ about_me: aboutMe || null }).eq("id", studentId);

      const currentEduIds = new Set(education.filter((e) => e.id).map((e) => e.id));
      const removedEdu = [...originalEduIds].filter((id) => !currentEduIds.has(id));
      if (removedEdu.length > 0) {
        await supabase.from("portfolio_education").delete().in("id", removedEdu);
      }

      const currentExpIds = new Set(experience.filter((e) => e.id).map((e) => e.id));
      const removedExp = [...originalExpIds].filter((id) => !currentExpIds.has(id));
      if (removedExp.length > 0) {
        await supabase.from("portfolio_experience").delete().in("id", removedExp);
      }

      const currentLinkIds = new Set(links.filter((l) => l.id).map((l) => l.id));
      const removedLinks = [...originalLinkIds].filter((id) => !currentLinkIds.has(id));
      if (removedLinks.length > 0) {
        await supabase.from("portfolio_links").delete().in("id", removedLinks);
      }

      const existingEdu = education.filter((e) => e.id);
      for (const edu of existingEdu) {
        await supabase.from("portfolio_education").update(edu).eq("id", edu.id);
      }
      const newEdu = education.filter((e) => !e.id);
      for (const edu of newEdu) {
        await supabase.from("portfolio_education").insert({ ...edu, student_id: studentId });
      }

      const existingExp = experience.filter((e) => e.id);
      for (const exp of existingExp) {
        await supabase.from("portfolio_experience").update(exp).eq("id", exp.id);
      }
      const newExp = experience.filter((e) => !e.id);
      for (const exp of newExp) {
        await supabase.from("portfolio_experience").insert({ ...exp, student_id: studentId });
      }

      const existingLinks = links.filter((l) => l.id);
      for (const link of existingLinks) {
        await supabase.from("portfolio_links").update(link).eq("id", link.id);
      }
      const newLinks = links.filter((l) => !l.id);
      for (const link of newLinks) {
        await supabase.from("portfolio_links").insert({ ...link, student_id: studentId });
      }

      toast.success("Portafolio actualizado");
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const addEducation = () => setEducation([...education, { institution: "", degree: "", field: "", start_date: "", end_date: "", description: "" }]);
  const addExperience = () => setExperience([...experience, { company: "", role: "", start_date: "", end_date: "", description: "", tools: [] }]);
  const addLink = () => setLinks([...links, { label: "", url: "" }]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="w-8 h-8 border-4 border-[#BAD8F7] border-t-[#38A3F1] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between p-5 border-b border-[#E8F3FD] sticky top-0 bg-white z-10">
            <div>
              <h2 className="text-base font-bold text-[#0D3A6E]">Configurar portafolio</h2>
              <p className="text-xs text-[#5B8DB8] mt-0.5">Personaliza cada sección de tu portafolio público</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-[#F0F7FF] flex items-center justify-center">
              <X className="w-4 h-4 text-[#5B8DB8]" />
            </button>
          </div>

          <div className="p-5 space-y-6">
            {/* About Me */}
            <section>
              <label className="block text-xs font-semibold text-[#0D3A6E] mb-1.5">Sobre mí</label>
              <textarea
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                placeholder="Cuenta tu historia, tus motivaciones, lo que te hace único..."
                rows={5}
                className="w-full text-sm border border-[#E8F3FD] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30 focus:border-[#38A3F1] resize-none placeholder:text-[#BAD8D4]"
              />
            </section>

            {/* Education */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#0D3A6E]">Educación</label>
                <button onClick={addEducation} className="text-xs font-semibold text-[#38A3F1] flex items-center gap-1 hover:text-[#0D5FA6]">
                  <Plus className="w-3.5 h-3.5" /> Agregar
                </button>
              </div>
              <div className="space-y-3">
                {education.map((edu, i) => (
                  <div key={i} className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E8F3FD] relative">
                    <button onClick={() => setEducation(education.filter((_, j) => j !== i))} className="absolute top-3 right-3 text-[#93B8D4] hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <input value={edu.institution} onChange={(e) => { const ed = [...education]; ed[i] = { ...ed[i], institution: e.target.value }; setEducation(ed); }} placeholder="Institución" className="col-span-2 text-sm border border-[#E8F3FD] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30" />
                      <input value={edu.degree} onChange={(e) => { const ed = [...education]; ed[i] = { ...ed[i], degree: e.target.value }; setEducation(ed); }} placeholder="Título" className="text-sm border border-[#E8F3FD] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30" />
                      <input value={edu.field} onChange={(e) => { const ed = [...education]; ed[i] = { ...ed[i], field: e.target.value }; setEducation(ed); }} placeholder="Campo de estudio" className="text-sm border border-[#E8F3FD] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30" />
                      <input value={edu.start_date} onChange={(e) => { const ed = [...education]; ed[i] = { ...ed[i], start_date: e.target.value }; setEducation(ed); }} placeholder="Inicio (ej: 2022)" className="text-sm border border-[#E8F3FD] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30" />
                      <input value={edu.end_date} onChange={(e) => { const ed = [...education]; ed[i] = { ...ed[i], end_date: e.target.value }; setEducation(ed); }} placeholder="Fin (ej: 2026)" className="text-sm border border-[#E8F3FD] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30" />
                    </div>
                    <textarea value={edu.description} onChange={(e) => { const ed = [...education]; ed[i] = { ...ed[i], description: e.target.value }; setEducation(ed); }} placeholder="Descripción (logros, actividades, etc.)" rows={2} className="w-full text-sm border border-[#E8F3FD] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30 resize-none mt-2" />
                  </div>
                ))}
              </div>
            </section>

            {/* Experience */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#0D3A6E]">Experiencia laboral</label>
                <button onClick={addExperience} className="text-xs font-semibold text-[#38A3F1] flex items-center gap-1 hover:text-[#0D5FA6]">
                  <Plus className="w-3.5 h-3.5" /> Agregar
                </button>
              </div>
              <div className="space-y-3">
                {experience.map((exp, i) => (
                  <div key={i} className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E8F3FD] relative">
                    <button onClick={() => setExperience(experience.filter((_, j) => j !== i))} className="absolute top-3 right-3 text-[#93B8D4] hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <input value={exp.company} onChange={(e) => { const ex = [...experience]; ex[i] = { ...ex[i], company: e.target.value }; setExperience(ex); }} placeholder="Empresa" className="col-span-2 text-sm border border-[#E8F3FD] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30" />
                      <input value={exp.role} onChange={(e) => { const ex = [...experience]; ex[i] = { ...ex[i], role: e.target.value }; setExperience(ex); }} placeholder="Rol" className="col-span-2 text-sm border border-[#E8F3FD] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30" />
                      <input value={exp.start_date} onChange={(e) => { const ex = [...experience]; ex[i] = { ...ex[i], start_date: e.target.value }; setExperience(ex); }} placeholder="Inicio" className="text-sm border border-[#E8F3FD] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30" />
                      <input value={exp.end_date} onChange={(e) => { const ex = [...experience]; ex[i] = { ...ex[i], end_date: e.target.value }; setExperience(ex); }} placeholder="Fin" className="text-sm border border-[#E8F3FD] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30" />
                    </div>
                    <textarea value={exp.description} onChange={(e) => { const ex = [...experience]; ex[i] = { ...ex[i], description: e.target.value }; setExperience(ex); }} placeholder="Descripción de tus responsabilidades y logros" rows={2} className="w-full text-sm border border-[#E8F3FD] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30 resize-none mt-2" />
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {(exp.tools || []).map((tool: string) => (
                          <span key={tool} className="inline-flex items-center gap-1 text-[11px] bg-[#F0F7FF] text-[#0D5FA6] px-2 py-0.5 rounded-full font-medium">
                            {tool}
                            <button onClick={() => { const ex = [...experience]; ex[i] = { ...ex[i], tools: (ex[i].tools || []).filter((t: string) => t !== tool) }; setExperience(ex); }} className="hover:text-red-500"><X className="w-2.5 h-2.5" /></button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-1.5">
                        <input placeholder="Tecnología" className="flex-1 text-sm border border-[#E8F3FD] rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30"
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const input = e.currentTarget; const val = input.value.trim(); if (val) { const ex = [...experience]; ex[i] = { ...ex[i], tools: [...(ex[i].tools || []), val] }; setExperience(ex); input.value = ""; } } }} />
                        <button onClick={(e) => { const input = e.currentTarget.previousElementSibling as HTMLInputElement; const val = input?.value?.trim(); if (val) { const ex = [...experience]; ex[i] = { ...ex[i], tools: [...(ex[i].tools || []), val] }; setExperience(ex); input.value = ""; } }} className="px-2 py-1.5 bg-[#F0F7FF] text-[#38A3F1] rounded-lg hover:bg-[#E8F3FD] text-xs font-semibold">+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Custom Links */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#0D3A6E]">Enlaces personalizados</label>
                <button onClick={addLink} className="text-xs font-semibold text-[#38A3F1] flex items-center gap-1 hover:text-[#0D5FA6]">
                  <Plus className="w-3.5 h-3.5" /> Agregar
                </button>
              </div>
              <div className="space-y-2">
                {links.map((link, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input value={link.label} onChange={(e) => { const l = [...links]; l[i] = { ...l[i], label: e.target.value }; setLinks(l); }} placeholder="Label (ej: GitHub)" className="flex-1 text-sm border border-[#E8F3FD] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30" />
                    <input value={link.url} onChange={(e) => { const l = [...links]; l[i] = { ...l[i], url: e.target.value }; setLinks(l); }} placeholder="URL" className="flex-[2] text-sm border border-[#E8F3FD] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30" />
                    <button onClick={() => setLinks(links.filter((_, j) => j !== i))} className="text-[#93B8D4] hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="flex items-center justify-end gap-3 p-5 border-t border-[#E8F3FD] sticky bottom-0 bg-white">
            <button onClick={onClose} className="text-sm font-semibold text-[#5B8DB8] px-4 py-2.5 rounded-xl hover:bg-[#F0F7FF]">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving}
              className="text-sm font-semibold text-white bg-gradient-to-r from-[#38A3F1] to-[#0D5FA6] px-6 py-2.5 rounded-xl hover:from-[#0D5FA6] hover:to-[#0D3A6E] transition-all disabled:opacity-50 shadow-md">
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
