"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2, Palette, Megaphone, Building2, Compass, Wrench, Sparkles,
  Clock, Target, AlertTriangle, User, ArrowRight, CheckCircle2,
  BotMessageSquare, FileText, Loader2, Brain, BookOpen, Star,
} from "lucide-react";
import { Scenario } from "@/app/actions/simulation";

const AREA_ICONS: Record<string, { icon: typeof Code2; color: string; bg: string }> = {
  "Desarrollo de Software": { icon: Code2, color: "#38A3F1", bg: "#F0F7FF" },
  "Diseño Gráfico": { icon: Palette, color: "#EC4899", bg: "#FDF2F8" },
  "Marketing": { icon: Megaphone, color: "#F59E0B", bg: "#FFFBEB" },
  "Administración": { icon: Building2, color: "#1D9E75", bg: "#E1F5EE" },
  "Arquitectura": { icon: Compass, color: "#8B5CF6", bg: "#F5F3FF" },
  "Ingeniería": { icon: Wrench, color: "#EF4444", bg: "#FEF2F2" },
  "Otras áreas": { icon: Sparkles, color: "#6B7280", bg: "#F9FAFB" },
};

const DIFFICULTY_CONFIG = {
  beginner: { label: "Principiante", color: "#1D9E75", bg: "#E1F5EE" },
  intermediate: { label: "Intermedio", color: "#F59E0B", bg: "#FFFBEB" },
  advanced: { label: "Avanzado", color: "#EF4444", bg: "#FEF2F2" },
};

function ScenarioCard({ scenario, onStart, loading }: {
  scenario: Scenario;
  onStart: () => void;
  loading: boolean;
}) {
  const areaConfig = AREA_ICONS[scenario.area] || AREA_ICONS["Otras áreas"];
  const Icon = areaConfig.icon;
  const diff = DIFFICULTY_CONFIG[scenario.difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG.beginner;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white rounded-2xl border border-[#E8F3FD] overflow-hidden hover:shadow-xl hover:border-[#38A3F1]/30 transition-all duration-300"
    >
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: areaConfig.bg }}
            >
              <Icon className="w-5 h-5" style={{ color: areaConfig.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: areaConfig.color }}>
                {scenario.area}
              </p>
              <h3 className="text-sm font-bold text-[#0D3A6E] truncate mt-0.5">{scenario.title}</h3>
            </div>
          </div>
          <span
            className="text-[10px] font-semibold px-2 py-1 rounded-full border flex-shrink-0"
            style={{ background: diff.bg, color: diff.color, borderColor: diff.color + "30" }}
          >
            {diff.label}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-[#5B8DB8]">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {scenario.client_name}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {scenario.estimated_days} días
          </span>
        </div>

        <p className="text-xs text-[#5B8DB8] line-clamp-2 leading-relaxed">{scenario.client_personality}</p>

        {scenario.skills_required.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {scenario.skills_required.slice(0, 3).map((skill, i) => (
              <span key={i} className="text-[10px] bg-[#F0F7FF] text-[#0D5FA6] px-2 py-0.5 rounded-full font-medium">
                {skill}
              </span>
            ))}
            {scenario.skills_required.length > 3 && (
              <span className="text-[10px] text-[#93B8D4]">+{scenario.skills_required.length - 3}</span>
            )}
          </div>
        )}

        <button
          onClick={onStart}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl transition-all"
          style={{
            background: loading ? "#E8F3FD" : "#0D3A6E",
            color: loading ? "#93B8D4" : "white",
          }}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <BotMessageSquare className="w-4 h-4" />
          )}
          {loading ? "Iniciando..." : "Iniciar simulación"}
        </button>
      </div>
    </motion.div>
  );
}

export function SimulationHub({ initialScenarios }: { initialScenarios: Scenario[] }) {
  const router = useRouter();
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);

  const areas = [...new Set(initialScenarios.map((s) => s.area))];

  const filteredScenarios = selectedArea
    ? initialScenarios.filter((s) => s.area === selectedArea)
    : initialScenarios;

  const startSimulation = async (scenarioId: string) => {
    setStartingId(scenarioId);
    try {
      const res = await fetch("/api/simulation/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId }),
      });
      const data = await res.json();
      if (data.session) {
        router.push(`/student/simulation/${data.session.id}`);
      } else {
        alert(data.error || "Error al iniciar simulación");
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setStartingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F9FF] via-white to-[#EEF6FF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
        <div>
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-brand-mid mb-1 sm:mb-2">
            Nivel 1 · Simulación Profesional
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-ink-primary md:text-3xl">
            Practica con clientes reales simulados
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1 sm:mt-2">
            Selecciona un área profesional y enfréntate a casos prácticos generados por IA
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedArea(null)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all"
            style={{
              background: !selectedArea ? "#0D3A6E" : "white",
              color: !selectedArea ? "white" : "#5B8DB8",
              borderColor: !selectedArea ? "#0D3A6E" : "#E8F3FD",
            }}
          >
            Todas las áreas
          </button>
          {areas.map((area) => {
            const config = AREA_ICONS[area] || AREA_ICONS["Otras áreas"];
            const isActive = selectedArea === area;
            return (
              <button
                key={area}
                onClick={() => setSelectedArea(isActive ? null : area)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all"
                style={{
                  background: isActive ? config.bg : "white",
                  color: isActive ? config.color : "#5B8DB8",
                  borderColor: isActive ? config.color + "40" : "#E8F3FD",
                }}
              >
                <config.icon className="w-3.5 h-3.5" />
                {area}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {filteredScenarios.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 py-16"
            >
              <div className="w-16 h-16 bg-[#F0F7FF] rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-[#BAD8F7]" />
              </div>
              <p className="text-sm text-[#5B8DB8]">No hay escenarios disponibles para esta área</p>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              {filteredScenarios.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  onStart={() => startSimulation(scenario.id)}
                  loading={startingId === scenario.id}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
