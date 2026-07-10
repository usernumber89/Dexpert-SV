"use client";

import { ChevronRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

type Pyme = { id: string; company_name?: string; logo_url?: string | null };
type Project = {
  id: string; title: string; description?: string | null;
  skills: string | string[]; level?: string | null; pyme?: Pyme | null;
};

export function DashboardProjectCard({ project }: { project: Project }) {
  const skillsList = Array.isArray(project.skills)
    ? project.skills
    : project.skills?.split(",").filter(Boolean) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group bg-white rounded-2xl border border-[#E8F3FD] p-5 shadow-sm hover:shadow-xl hover:border-[#38A3F1]/40 transition-all duration-300 flex flex-col gap-3"
    >
      {/* Empresa + nivel */}
      <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
          {project.pyme?.logo_url ? (
            <Image
              src={project.pyme.logo_url}
              alt={project.pyme.company_name || "Logo"}
              width={40}
              height={40}
              className="w-10 h-10 rounded-xl object-cover border border-[#BAD8F7] flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F0F7FF] to-[#E8F3FD] border border-[#BAD8F7] flex items-center justify-center text-sm font-bold text-[#0D3A6E] shadow-sm">
              {project.pyme?.company_name?.[0]?.toUpperCase() ?? "D"}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#0D3A6E] truncate">
              {project.pyme?.company_name ?? "Empresa"}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-[#93B8D4]" />
              <p className="text-[10px] text-[#93B8D4]">Remoto</p>
            </div>
          </div>
        </div>
        <span className="text-[10px] text-[#5B8DB8] bg-[#F0F7FF] px-2 py-1 rounded-full">
          {project.level ?? "Cualquier nivel"}
        </span>
      </div>

      {/* Título + descripción */}
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-[#0D3A6E] mb-1.5 line-clamp-2 group-hover:text-[#38A3F1] transition-colors leading-snug">
          {project.title}
        </h3>
        <p className="text-xs text-[#5B8DB8] line-clamp-2 leading-relaxed">
          {project.description ?? "Sin descripción"}
        </p>
      </div>

      {/* Skills */}
      {skillsList.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skillsList.slice(0, 4).map((skill, i) => (
            <span
              key={i}
              className="text-[10px] bg-[#F0F7FF] text-[#0D5FA6] font-medium px-2.5 py-1 rounded-full border border-[#BAD8F7]"
            >
              {skill.trim()}
            </span>
          ))}
          {skillsList.length > 4 && (
            <span className="text-[10px] text-[#93B8D4] self-center">
              +{skillsList.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Enlace */}
      <Link
        href={`/student/projects/${project.id}`}
        className="mt-1 flex items-center justify-between text-xs font-semibold text-[#38A3F1] group/link"
      >
        <span>Ver detalles</span>
        <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
      </Link>
    </motion.div>
  );
}
