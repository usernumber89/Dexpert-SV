"use client";

import { ChevronRight, CheckCircle, MapPin, Calendar } from "lucide-react";
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
    name: string;
    logo_url: string | null;
  } | null;
};

type Props = {
  project: Project;
  hasApplied: boolean;
};

export function ProjectCard({ project, hasApplied }: Props) {
  const skillsList = project.skills?.split(",").filter(Boolean) ?? [];
  const daysAgo = Math.floor(
    (Date.now() - new Date(project.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      className="group bg-white rounded-xl border border-[#BAD8F7] p-5 flex flex-col gap-3 hover:border-[#38A3F1] hover:shadow-lg transition-all duration-300"
    >
      {/* Company */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#F0F7FF] flex items-center justify-center text-xs font-semibold text-[#0D5FA6]">
            {project.pyme?.name?.[0]?.toUpperCase() ?? "D"}
          </div>
          <div>
            <p className="text-xs font-medium text-[#0D3A6E] line-clamp-1">
              {project.pyme?.name ?? "Company"}
            </p>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#93B8D4]" />
              <p className="text-[10px] text-[#93B8D4]">Remote</p>
            </div>
          </div>
        </div>

        {hasApplied ? (
          <span className="flex items-center gap-1 text-xs font-medium text-[#1D9E75] bg-[#E1F5EE] px-2 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3" /> Applied
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] text-[#93B8D4]">
            <Calendar className="w-3 h-3" />
            {daysAgo === 0 ? "Today" : `${daysAgo}d ago`}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <p className="text-sm font-semibold text-[#0D3A6E] mb-1 line-clamp-2 group-hover:text-[#38A3F1] transition-colors">
          {project.title}
        </p>
        <p className="text-xs text-[#5B8DB8] line-clamp-2 leading-relaxed">
          {project.description ?? "No description provided"}
        </p>
      </div>

      {/* Skills */}
      {skillsList.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {skillsList.slice(0, 3).map((skill, i) => (
            <span key={i} className="text-[10px] bg-[#F0F7FF] text-[#0D5FA6] px-2 py-0.5 rounded-full border border-[#BAD8F7]">
              {skill.trim()}
            </span>
          ))}
          {skillsList.length > 3 && (
            <span className="text-[10px] text-[#93B8D4] px-1">+{skillsList.length - 3}</span>
          )}
        </div>
      )}

      {/* Badges */}
      <div className="flex items-center gap-2">
        {project.level && (
          <span className="text-[10px] text-[#93B8D4] px-2 py-0.5 bg-[#F0F7FF] rounded-full">
            {project.level}
          </span>
        )}
        {project.category && (
          <span className="text-[10px] text-[#93B8D4] px-2 py-0.5 bg-[#F0F7FF] rounded-full">
            {project.category}
          </span>
        )}
      </div>

      {/* CTA */}
      <Link
        href={`/student/projects/${project.id}`}
        className="mt-2 flex items-center justify-between text-xs font-medium text-[#38A3F1] group/link"
      >
        <span>View details</span>
        <ChevronRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
      </Link>
    </motion.div>
  );
}