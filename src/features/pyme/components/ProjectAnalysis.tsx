"use client";

import {
  CheckCircle, AlertTriangle, Clock, BarChart3,
  Lightbulb, GitFork, Brain, XCircle
} from "lucide-react";

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

const categoryIcons: Record<string, string> = {
  "Desarrollo Web": "🌐",
  "Desarrollo de Software": "💻",
  "Bases de Datos": "🗄️",
  "Diseño Gráfico": "🎨",
  "Marketing Digital": "📱",
  "Ciencia de Datos": "📊",
  "Automatización": "⚙️",
  "Aplicaciones Móviles": "📲",
};

export function ProjectAnalysis({ analysis }: { analysis: AnalysisResult }) {
  const complexityColor =
    analysis.puntuacion_complejidad < 30
      ? "text-green-600 bg-green-50 border-green-200"
      : analysis.puntuacion_complejidad < 60
        ? "text-amber-600 bg-amber-50 border-amber-200"
        : "text-red-600 bg-red-50 border-red-200";

  const levelColor =
    analysis.nivel === "Básico"
      ? "text-green-600 bg-green-50 border-green-200"
      : "text-amber-600 bg-amber-50 border-amber-200";

  const durationColor =
    analysis.duracion_estimada_semanas <= 3
      ? "text-green-600 bg-green-50 border-green-200"
      : analysis.duracion_estimada_semanas <= 6
        ? "text-amber-600 bg-amber-50 border-amber-200"
        : "text-red-600 bg-red-50 border-red-200";

  return (
    <div className="rounded-xl border border-[#E8F3FD] bg-white overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-[#F8FBFF] border-b border-[#E8F3FD] flex items-center gap-2">
        <Brain className="w-4 h-4 text-[#38A3F1]" />
        <span className="text-xs font-semibold text-[#0D3A6E] uppercase tracking-wider">
          Análisis de Proyecto
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Apto / No apto banner */}
        {analysis.es_apto_para_estudiantes ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-xs font-medium text-green-700">
              Proyecto apto para estudiantes universitarios
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
            <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-xs font-medium text-red-700">
              Proyecto demasiado complejo para estudiantes
            </span>
          </div>
        )}

        {/* Badges row */}
        <div className="flex flex-wrap gap-2">
          {/* Category */}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#F0F7FF] text-[#0D5FA6] border border-[#BAD8F7]">
            {categoryIcons[analysis.categoria] || "📋"} {analysis.categoria}
          </span>

          {/* Level */}
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${levelColor}`}>
            <BarChart3 className="w-3 h-3" />
            {analysis.nivel}
          </span>

          {/* Duration */}
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${durationColor}`}>
            <Clock className="w-3 h-3" />
            {analysis.duracion_estimada_semanas} sem.
          </span>

          {/* Complexity */}
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${complexityColor}`}>
            <Brain className="w-3 h-3" />
            {analysis.puntuacion_complejidad}/100
          </span>
        </div>

        {/* Skills */}
        {analysis.habilidades.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-[#93B8D4] uppercase tracking-wider mb-2">
              Habilidades detectadas
            </p>
            <div className="flex flex-wrap gap-1.5">
              {analysis.habilidades.map((skill, i) => (
                <span
                  key={i}
                  className="text-[11px] font-medium text-[#0D5FA6] bg-[#F0F7FF] px-2.5 py-1 rounded-full border border-[#BAD8F7]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Risks */}
        {analysis.riesgos_detectados.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Riesgos detectados
            </p>
            <ul className="space-y-1">
              {analysis.riesgos_detectados.map((risk, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-red-600">
                  <span className="w-1 h-1 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {analysis.recomendaciones.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-[#38A3F1] uppercase tracking-wider mb-2 flex items-center gap-1">
              <Lightbulb className="w-3 h-3" />
              Recomendaciones
            </p>
            <ul className="space-y-1">
              {analysis.recomendaciones.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-[#0D5FA6]">
                  <span className="w-1 h-1 rounded-full bg-[#38A3F1] mt-1.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sub-projects */}
        {analysis.subproyectos_sugeridos.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-[#0D3A6E] uppercase tracking-wider mb-2 flex items-center gap-1">
              <GitFork className="w-3 h-3" />
              Subproyectos sugeridos
            </p>
            <div className="space-y-1.5">
              {analysis.subproyectos_sugeridos.map((sub, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F8FBFF] border border-[#E8F3FD] text-xs text-[#0D3A6E] font-medium"
                >
                  <span className="w-5 h-5 rounded-full bg-[#0D3A6E] text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  {sub}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
