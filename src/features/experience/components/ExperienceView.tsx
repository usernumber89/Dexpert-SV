"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Trophy, Star, Lock, Unlock, Zap, TrendingUp,
  CheckCircle2, Award, Briefcase, Target, RefreshCw,
} from "lucide-react";
import { getStudentExperience, getExperienceLevels } from "@/app/actions/simulation";

type ExperienceData = {
  level: number;
  total_xp: number;
  simulations_completed: number;
  real_projects_completed: number;
  avg_score: number;
  next_level_xp: number | null;
  level_info: { title: string; benefits: string[]; unlocks_real_projects: boolean } | null;
};

type LevelInfo = {
  level: number;
  xp_required: number;
  title: string;
  benefits: string[];
  unlocks_real_projects: boolean;
};

export function ExperienceView() {
  const [experience, setExperience] = useState<ExperienceData | null>(null);
  const [levels, setLevels] = useState<LevelInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [exp, lvls] = await Promise.all([
        getStudentExperience(),
        getExperienceLevels(),
      ]);
      setExperience(exp as any);
      setLevels(lvls as LevelInfo[]);
    } catch (err) {
      console.error("Error fetching experience data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const refresh = () => fetchData();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") refresh();
    });
    return () => {
      window.removeEventListener("focus", refresh);
    };
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4F9FF] via-white to-[#EEF6FF] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#BAD8F7] border-t-[#38A3F1] rounded-full animate-spin" />
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4F9FF] via-white to-[#EEF6FF] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Trophy className="w-12 h-12 text-[#BAD8F7] mx-auto" />
          <p className="text-sm text-[#5B8DB8]">Completa simulaciones para ganar experiencia</p>
        </div>
      </div>
    );
  }

  const currentLevelData = levels[experience.level - 1] || levels[0];
  const nextLevelData = levels[experience.level];
  const progressPercent = nextLevelData
    ? Math.min(100, Math.round(((experience.total_xp - currentLevelData.xp_required) / (nextLevelData.xp_required - currentLevelData.xp_required)) * 100))
    : 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F9FF] via-white to-[#EEF6FF]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-brand-mid mb-1 sm:mb-2">
              Nivel 4 · Sistema de Experiencia
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-ink-primary md:text-3xl">
              Tu Progreso Profesional
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary mt-1 sm:mt-2">
              Gana experiencia con simulaciones y desbloquea proyectos reales
            </p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#38A3F1] bg-white border border-[#BAD8F7] px-3 py-2 rounded-xl hover:bg-[#F0F7FF] transition shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Actualizar
          </button>
        </div>

        {/* Current Level Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#0D3A6E] to-[#1D5A9E] rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center flex-shrink-0">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-[#F59E0B]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#F59E0B] mb-1">
                Nivel {experience.level}
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                {currentLevelData?.title || "Profesional"}
              </h2>
              <p className="text-sm text-[#BAD8F7]">
                {experience.total_xp} XP total · {experience.simulations_completed} simulaciones completadas
              </p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              {currentLevelData?.unlocks_real_projects && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1D9E75]/20 backdrop-blur rounded-full border border-[#1D9E75]/30">
                  <Unlock className="w-3.5 h-3.5 text-[#1D9E75]" />
                  <span className="text-xs font-semibold text-[#1D9E75]">Proyectos reales</span>
                </div>
              )}
              {!currentLevelData?.unlocks_real_projects && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur rounded-full border border-white/20">
                  <Lock className="w-3.5 h-3.5 text-[#93B8D4]" />
                  <span className="text-xs font-semibold text-[#93B8D4]">Bloqueado</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Nivel", value: experience.level, icon: Trophy, color: "#F59E0B", bg: "#FFFBEB" },
            { label: "XP Total", value: experience.total_xp, icon: Zap, color: "#38A3F1", bg: "#F0F7FF" },
            { label: "Simulaciones", value: experience.simulations_completed, icon: Target, color: "#1D9E75", bg: "#E1F5EE" },
            { label: "Proyectos reales", value: experience.real_projects_completed, icon: Briefcase, color: "#8B5CF6", bg: "#F5F3FF" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-[#E8F3FD] p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: stat.bg }}>
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-xl font-bold text-[#0D3A6E]">{stat.value}</p>
              <p className="text-[10px] text-[#93B8D4]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* XP Progress */}
        {nextLevelData && (
          <div className="bg-white rounded-2xl border border-[#E8F3FD] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[#0D3A6E]">Progreso al Nivel {experience.level + 1}</p>
              <p className="text-[11px] text-[#5B8DB8]">
                {experience.total_xp - currentLevelData.xp_required} / {nextLevelData.xp_required - currentLevelData.xp_required} XP
              </p>
            </div>
            <div className="w-full h-2 bg-[#F0F7FF] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-[#38A3F1] to-[#0D3A6E]"
              />
            </div>
            <p className="text-[11px] text-[#93B8D4]">
              Siguiente nivel: <span className="font-semibold text-[#0D3A6E]">{nextLevelData.title}</span>
              {nextLevelData.unlocks_real_projects && " · ¡Desbloquea proyectos reales!"}
            </p>
          </div>
        )}

        {/* All Levels */}
        <div className="bg-white rounded-2xl border border-[#E8F3FD] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E8F3FD]">
            <h3 className="text-sm font-bold text-[#0D3A6E]">Todos los Niveles</h3>
          </div>
          <div className="divide-y divide-[#E8F3FD]">
            {levels.map((level) => {
              const isUnlocked = level.level <= experience.level;
              const isCurrent = level.level === experience.level;
              return (
                <div
                  key={level.level}
                  className={`flex items-center gap-4 px-5 py-4 transition-colors ${
                    isCurrent ? "bg-[#F0F7FF]" : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isUnlocked ? "bg-[#F0F7FF]" : "bg-[#F9FAFB]"
                    }`}
                  >
                    {isUnlocked ? (
                      <Trophy className="w-5 h-5" style={{ color: isCurrent ? "#F59E0B" : "#93B8D4" }} />
                    ) : (
                      <Lock className="w-4 h-4 text-[#D1D5DB]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-bold ${isUnlocked ? "text-[#0D3A6E]" : "text-[#93B8D4]"}`}>
                        Nivel {level.level}
                      </p>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold text-[#F59E0B] bg-[#FFFBEB] px-2 py-0.5 rounded-full">
                          Actual
                        </span>
                      )}
                    </div>
                    <p className={`text-xs ${isUnlocked ? "text-[#5B8DB8]" : "text-[#D1D5DB]"}`}>
                      {level.title} · {level.xp_required} XP requeridos
                    </p>
                    {isUnlocked && level.benefits.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {level.benefits.map((benefit, i) => (
                          <span key={i} className="text-[10px] text-[#1D9E75] bg-[#E1F5EE] px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            {benefit}
                          </span>
                        ))}
                      </div>
                    )}
                    {level.unlocks_real_projects && isUnlocked && (
                      <div className="flex items-center gap-1 mt-1.5 text-[10px] text-[#38A3F1] font-semibold">
                        <Unlock className="w-3 h-3" />
                        Proyectos reales disponibles
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold" style={{ color: isUnlocked ? "#1D9E75" : "#D1D5DB" }}>
                      {isUnlocked ? "Desbloqueado" : `${level.xp_required} XP`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
