"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface EntryData {
  id: string;
  title: string;
  description: string;
  custom_description?: string | null;
  tools_used?: string[];
  role_description?: string | null;
  project_url?: string | null;
  images?: string[];
  featured?: boolean;
  sort_order?: number;
}

interface PortfolioEntryEditorProps {
  entry: EntryData;
  onClose: () => void;
  onSaved: () => void;
}

export function PortfolioEntryEditor({ entry, onClose, onSaved }: PortfolioEntryEditorProps) {
  const [customDescription, setCustomDescription] = useState(entry.custom_description || "");
  const [tools, setTools] = useState<string[]>((entry.tools_used as string[]) || []);
  const [toolInput, setToolInput] = useState("");
  const [roleDescription, setRoleDescription] = useState(entry.role_description || "");
  const [projectUrl, setProjectUrl] = useState(entry.project_url || "");
  const [featured, setFeatured] = useState(entry.featured || false);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const addTool = () => {
    const t = toolInput.trim();
    if (t && !tools.includes(t)) {
      setTools([...tools, t]);
      setToolInput("");
    }
  };

  const removeTool = (tool: string) => {
    setTools(tools.filter((t) => t !== tool));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("portfolio_entries")
        .update({
          custom_description: customDescription || null,
          tools_used: tools,
          role_description: roleDescription || null,
          project_url: projectUrl || null,
          featured,
        })
        .eq("id", entry.id);

      if (error) throw error;
      toast.success("Entrada actualizada");
      onSaved();
      onClose();
    } catch (err) {
      toast.error("Error al guardar");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between p-5 border-b border-[#E8F3FD]">
            <div>
              <h2 className="text-base font-bold text-[#0D3A6E]">Editar entrada</h2>
              <p className="text-xs text-[#5B8DB8] mt-0.5">{entry.title}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-[#F0F7FF] flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-[#5B8DB8]" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Custom Description */}
            <div>
              <label className="block text-xs font-semibold text-[#0D3A6E] mb-1.5">
                Descripción personalizada
              </label>
              <textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="Cuenta qué hiciste en este proyecto, los retos que enfrentaste y qué aprendiste..."
                rows={4}
                className="w-full text-sm border border-[#E8F3FD] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30 focus:border-[#38A3F1] resize-none placeholder:text-[#BAD8D4]"
              />
              <p className="text-[10px] text-[#93B8D4] mt-1">
                Si no agregas nada, se mostrará la descripción automática del proyecto
              </p>
            </div>

            {/* Role Description */}
            <div>
              <label className="block text-xs font-semibold text-[#0D3A6E] mb-1.5">
                Tu rol en el proyecto
              </label>
              <input
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                placeholder="Ej: Desarrollador frontend, Diseñador UX, Líder de equipo..."
                className="w-full text-sm border border-[#E8F3FD] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30 focus:border-[#38A3F1] placeholder:text-[#BAD8D4]"
              />
            </div>

            {/* Tools / Technologies */}
            <div>
              <label className="block text-xs font-semibold text-[#0D3A6E] mb-1.5">
                Herramientas y tecnologías
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tools.map((tool) => (
                  <span key={tool} className="inline-flex items-center gap-1 text-[11px] bg-[#F0F7FF] text-[#0D5FA6] px-2.5 py-1 rounded-full font-medium">
                    {tool}
                    <button onClick={() => removeTool(tool)} className="hover:text-red-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={toolInput}
                  onChange={(e) => setToolInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTool(); } }}
                  placeholder="Escribe una tecnología y presiona Enter..."
                  className="flex-1 text-sm border border-[#E8F3FD] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30 focus:border-[#38A3F1] placeholder:text-[#BAD8D4]"
                />
                <button
                  onClick={addTool}
                  className="px-3 py-2.5 bg-[#F0F7FF] text-[#38A3F1] rounded-xl hover:bg-[#E8F3FD] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Project URL */}
            <div>
              <label className="block text-xs font-semibold text-[#0D3A6E] mb-1.5">
                Enlace al proyecto
              </label>
              <input
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                placeholder="https://github.com/tu-usuario/proyecto"
                className="w-full text-sm border border-[#E8F3FD] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30 focus:border-[#38A3F1] placeholder:text-[#BAD8D4]"
              />
            </div>

            {/* Featured */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setFeatured(!featured)}
                className={`w-10 h-5 rounded-full transition-colors relative ${featured ? "bg-[#38A3F1]" : "bg-[#D4E6F5]"}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute top-0.5 transition-all ${featured ? "left-5" : "left-0.5"}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0D3A6E]">Destacar este proyecto</p>
                <p className="text-[10px] text-[#5B8DB8]">Aparecerá primero en tu portafolio</p>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 p-5 border-t border-[#E8F3FD]">
            <button
              onClick={onClose}
              className="text-sm font-semibold text-[#5B8DB8] px-4 py-2.5 rounded-xl hover:bg-[#F0F7FF] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-sm font-semibold text-white bg-[#38A3F1] px-6 py-2.5 rounded-xl hover:bg-[#0D5FA6] transition-colors disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
