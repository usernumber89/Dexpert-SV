"use client";

import { ChevronRight, CheckCircle, MapPin, Calendar, Zap } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

type Project = {
  id: string;
  title: string;
  description: string | null;
  skills: string;
  image_url: string | null;
  is_published: boolean;
  level: string | null;
  category: string | null;
  status: string;
  created_at: string;
  pyme: {
    id: string;
    company_name: string;
    logo_url: string | null;
  } | null;
};

type Props = {
  project: Project;
  hasApplied: boolean;
  studentSkills: string[];
};

function calcMatch(projectSkills: string, studentSkills: string[]): number {
  if (!studentSkills.length) return 0;
  const required = projectSkills.split(",").map(s => s.trim().toLowerCase());
  const student = studentSkills.map(s => s.toLowerCase());
  const matches = required.filter(r => student.some(s => s.includes(r) || r.includes(s)));
  return Math.round((matches.length / required.length) * 100);
}

function MatchBadge({ score }: { score: number }) {
  if (score === 0) return null;
  const color =
    score >= 70
      ? {
          bg: "bg-emerald-50",
          text: "text-emerald-600",
          border: "border-emerald-100",
          dot: "bg-emerald-400",
        }
      : score >= 40
      ? {
          bg: "bg-amber-50",
          text: "text-amber-600",
          border: "border-amber-100",
          dot: "bg-amber-400",
        }
      : {
          bg: "bg-[#F0F7FF]",
          text: "text-[#38A3F1]",
          border: "border-[#BAD8F7]",
          dot: "bg-[#38A3F1]",
        };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold ${color.bg} ${color.border} ${color.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
      {score}% match
    </span>
  );
}

export function ProjectCard({ project, hasApplied, studentSkills }: Props) {
  const skillsList = project.skills?.split(",").filter(Boolean) ?? [];
  const matchScore = calcMatch(project.skills, studentSkills);
  const daysAgo = Math.floor(
    (Date.now() - new Date(project.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  const studentSkillsLower = studentSkills.map(s => s.toLowerCase());
  const isMatchedSkill = (skill: string) =>
    studentSkillsLower.some(
      s => s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s)
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      className="group relative flex flex-col gap-3 rounded-2xl border border-[#E8F3FD] bg-white p-5 shadow-sm transition-all duration-300 hover:border-[#38A3F1]/40 hover:shadow-xl hover:shadow-[#38A3F1]/5"
    >
      {/* Gradiente decorativo sutil */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#F4F9FF]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-3">
        {/* Empresa + estado / match */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F0F7FF] to-[#E8F3FD] border border-[#BAD8F7] flex items-center justify-center text-sm font-bold text-[#0D3A6E] shadow-sm flex-shrink-0">
              {project.pyme?.company_name?.[0]?.toUpperCase() ?? "D"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#0D3A6E] truncate">
                {project.pyme?.company_name ?? "Company"}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-[#93B8D4]" />
                <p className="text-[10px] text-[#93B8D4]">Remoto</p>
              </div>
            </div>
          </div>

          {hasApplied ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex-shrink-0">
              <CheckCircle className="w-3.5 h-3.5" /> Applied
            </span>
          ) : matchScore > 0 ? (
            <MatchBadge score={matchScore} />
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-[#93B8D4] flex-shrink-0">
              <Calendar className="w-3 h-3" />
              {daysAgo === 0 ? "Hoy" : `Hace ${daysAgo}d`}
            </span>
          )}
        </div>

        {/* Título y descripción */}
        <div>
          <h3 className="text-sm font-semibold text-[#0D3A6E] mb-1.5 line-clamp-2 group-hover:text-[#38A3F1] transition-colors leading-snug">
            {project.title}
          </h3>
          <p className="text-xs text-[#5B8DB8] line-clamp-2 leading-relaxed">
            {project.description ?? "Sin descripción"}
          </p>
        </div>

        {/* Habilidades */}
        {skillsList.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skillsList.slice(0, 4).map((skill, i) => {
              const matched = isMatchedSkill(skill.trim());
              return (
                <span
                  key={i}
                  className={`text-[10px] px-2.5 py-1 rounded-full border font-medium transition-colors ${
                    matched
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-[#F0F7FF] text-[#0D5FA6] border-[#BAD8F7]"
                  }`}
                >
                  {matched && "✓ "}
                  {skill.trim()}
                </span>
              );
            })}
            {skillsList.length > 4 && (
              <span className="text-[10px] text-[#93B8D4] self-center px-1">
                +{skillsList.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Etiquetas de nivel y categoría */}
        <div className="flex items-center gap-2 flex-wrap">
          {project.level && (
            <span className="text-[10px] text-[#5B8DB8] bg-[#F0F7FF] px-2 py-0.5 rounded-full">
              {project.level}
            </span>
          )}
          {project.category && (
            <span className="text-[10px] text-[#5B8DB8] bg-[#F0F7FF] px-2 py-0.5 rounded-full">
              {project.category}
            </span>
          )}
        </div>

        {/* Enlace */}
        <Link
          href={`/student/projects/${project.id}`}
          className="mt-1 flex items-center justify-between text-xs font-semibold text-[#38A3F1] group/link"
        >
          <span>Ver detalles</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}