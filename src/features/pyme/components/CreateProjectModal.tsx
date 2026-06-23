"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Sparkles, Brain, Loader2 } from "lucide-react";
import { ProjectAnalysis } from "./ProjectAnalysis";

const schema = z.object({
  projectName: z.string().min(3, "El nombre del proyecto es requerido"),
  description: z.string().min(10, "La descripción es requerida"),
  skills: z.string().min(2, "Las habilidades son requeridas"),
  prompt: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type AnalysisResult = {
  categoria: string;
  nivel: string;
  habilidades: string[];
  duracion_estimada_semanas: number;
  es_apto_para_estudiantes: boolean;
  puntuacion_complejidad: number;
  riesgos_detectados: string[];
  recomendaciones: string[];
  subproyectos_sugeridos: string[];
};

export function CreateProjectModal({ onClose, onSuccess }: {
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { projectName: "", description: "", skills: "", prompt: "" },
  });

  const description = watch("description");

  const runAnalysis = async (text: string) => {
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await fetch("/api/ai/analyze-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.json();
      if (data.categoria) {
        setAnalysis(data);
        setCategory(data.categoria);
        setLevel(data.nivel);
        if (!watch("skills") || watch("skills").trim().length < 2) {
          setValue("skills", data.habilidades.join(", "));
        }
        toast.success("Proyecto analizado!");
      } else {
        toast.error(data.error || "No se pudo analizar el proyecto");
      }
    } catch {
      toast.error("Error al analizar el proyecto");
    } finally {
      setAnalyzing(false);
    }
  };

  const analyzeProject = () => {
    const text = watch("description")?.trim();
    if (!text || text.length < 10) {
      toast.error("Escribe una descripción primero");
      return;
    }
    runAnalysis(text);
  };

  const generateWithAI = async () => {
    const prompt = watch("prompt")?.trim();
    if (!prompt) { toast.error("Escribe un prompt primero"); return; }

    setGenerating(true);
    setAnalysis(null);
    try {
      const res = await fetch("/api/ai/generate-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.title) {
        setValue("projectName", data.title);
        setValue("description", data.description);
        setValue("skills", data.skills);
        toast.success("Brief generado!");
        setGenerating(false);
        runAnalysis(data.description);
      } else {
        toast.error("Intenta con un prompt diferente");
        setGenerating(false);
      }
    } catch {
      toast.error("Error en la IA, intenta de nuevo");
      setGenerating(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          category: category || undefined,
          level: level || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.noCredits) {
          toast.error("No tienes créditos disponibles. Adquiere un plan para publicar proyectos.");
          onClose();
          router.push("/pyme/pricing");
          return;
        }
        toast.error(data.error || "Error al crear el proyecto");
        return;
      }

      toast.success("Proyecto creado!");
      onSuccess?.();
      router.push(`/pyme/projects/${data.id}`);
      onClose();
    } catch {
      toast.error("Error creando el proyecto, intenta de nuevo");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0D3A6E]/40 flex items-start justify-center p-4 pt-8 sm:pt-16 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-[#BAD8F7] w-full max-w-lg shadow-xl my-4">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#BAD8F7]">
          <h2 className="text-sm font-semibold text-[#0D3A6E]">Crear proyecto</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F0F7FF] transition">
            <X className="w-4 h-4 text-[#5B8DB8]" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">

          {/* AI section */}
          <div className="rounded-xl bg-[#F0F7FF] border border-[#BAD8F7] p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#38A3F1]" />
              <p className="text-xs font-medium text-[#38A3F1] uppercase tracking-widest">Generar con IA</p>
            </div>
            <input
              {...register("prompt")}
              placeholder="ej. Necesito un sitio web para mi panadería en Santa Ana"
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-[#BAD8F7] bg-white text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] transition-colors"
            />
            <button
              type="button"
              onClick={generateWithAI}
              disabled={generating || analyzing}
              className="flex items-center gap-2 text-sm font-medium text-[#38A3F1] hover:text-[#0D5FA6] transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {generating ? "Generando..." : analyzing ? "Analizando..." : "Generar descripción"}
            </button>
          </div>

          {/* Fields */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-[#5B8DB8] mb-1.5 block">Nombre del proyecto</label>
              <input
                {...register("projectName")}
                placeholder="Tienda de comercio electrónico para mi panadería"
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-[#BAD8F7] text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] transition-colors"
              />
              {errors.projectName && <p className="text-xs text-red-400 mt-1">{errors.projectName.message}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-[#5B8DB8] mb-1.5 block">Descripción</label>
              <textarea
                {...register("description")}
                placeholder="Describe lo que necesitas..."
                rows={3}
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-[#BAD8F7] text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] resize-none transition-colors"
              />
              {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-[#5B8DB8] mb-1.5 block">Habilidades necesarias</label>
              <input
                {...register("skills")}
                placeholder="React, Diseño UX, Django, Marketing..."
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-[#BAD8F7] text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] transition-colors"
              />
              {errors.skills && <p className="text-xs text-red-400 mt-1">{errors.skills.message}</p>}
            </div>
          </div>

          {/* Analyze button (manual, for when user types their own description) */}
          {description?.trim().length >= 10 && !analysis && !analyzing && !generating && (
            <button
              type="button"
              onClick={analyzeProject}
              className="w-full flex items-center justify-center gap-2 text-sm font-medium text-[#0D5FA6] bg-[#F0F7FF] border border-[#BAD8F7] py-2.5 rounded-xl hover:bg-[#E8F3FD] transition"
            >
              <Brain className="w-4 h-4" />
              Analizar proyecto con IA
            </button>
          )}

          {/* Analyzing state */}
          {analyzing && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-[#5B8DB8]">
              <Loader2 className="w-4 h-4 animate-spin" />
              Analizando proyecto...
            </div>
          )}

          {/* Analysis result */}
          {analysis && (
            <div className="space-y-3">
              <ProjectAnalysis analysis={analysis} />

              {!analysis.es_apto_para_estudiantes && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200">
                  <span className="text-red-600 text-xs">
                    Este proyecto es muy grande o complejo para estudiantes. Debes dividirlo en subproyectos más pequeños antes de publicar.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || (analysis !== null && !analysis.es_apto_para_estudiantes)}
            className="w-full bg-[#38A3F1] cursor-pointer text-white text-sm font-medium py-2.5 rounded-xl hover:bg-[#0D5FA6] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#38A3F1]/70 disabled:hover:bg-[#38A3F1]/70"
          >
            {submitting
              ? "Creando..."
              : analysis !== null && !analysis.es_apto_para_estudiantes
                ? "Proyecto no apto para estudiantes"
                : "Publicar proyecto"}
          </button>
        </form>
      </div>
    </div>
  );
}
