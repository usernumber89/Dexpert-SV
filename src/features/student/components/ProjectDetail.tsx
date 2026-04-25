"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, MapPin, Tag, BarChart, Zap } from "lucide-react";
import Link from "next/link";

type Project = {
  id: string;
  title: string;
  description: string | null;
  skills: string;
  level: string | null;
  category: string | null;
  pyme: {
    company_name: string;
    description: string | null;
    logo_url: string | null;
  } | null;
};

type Props = {
  project: Project;
  hasApplied: boolean;
  studentId: string | null;
  studentSkills?: string[];
};

function calcMatch(projectSkills: string, studentSkills: string[]): number {
  if (!studentSkills.length) return 0;
  const required = projectSkills.split(",").map(s => s.trim().toLowerCase());
  const student = studentSkills.map(s => s.toLowerCase());
  const matches = required.filter(r => student.some(s => s.includes(r) || r.includes(s)));
  return Math.round((matches.length / required.length) * 100);
}

export function ProjectDetail({ project, hasApplied: initialApplied, studentId, studentSkills = [] }: Props) {
  const router = useRouter();
  const [hasApplied, setHasApplied] = useState(initialApplied);
  const [loading, setLoading] = useState(false);

  const matchScore = calcMatch(project.skills, studentSkills);
  const studentSkillsLower = studentSkills.map(s => s.toLowerCase());
  const isMatchedSkill = (skill: string) =>
    studentSkillsLower.some(s => s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s));

  const matchColor = matchScore >= 70
    ? { bg: "bg-green-50", text: "text-green-600", border: "border-green-100", bar: "bg-green-500" }
    : matchScore >= 40
    ? { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", bar: "bg-amber-400" }
    : { bg: "bg-[#F0F7FF]", text: "text-[#38A3F1]", border: "border-[#BAD8F7]", bar: "bg-[#38A3F1]" };

  const handleApply = async () => {
    if (!studentId) {
      toast.error("Complete your profile first");
      router.push("/student/profile");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/project/${project.id}/apply`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Error applying");
        return;
      }
      setHasApplied(true);
      toast.success("Application sent successfully!");
    } catch {
      toast.error("Error applying");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] p-6">
      <div className="max-w-2xl mx-auto">

        <Link href="/student/projects" className="flex items-center gap-2 text-sm text-[#5B8DB8] hover:text-[#0D3A6E] mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Back to projects
        </Link>

        <div className="bg-white rounded-2xl border border-[#BAD8F7] overflow-hidden">

          {/* Header */}
          <div className="p-6 border-b border-[#E8F3FD]">
            <div className="flex items-start justify-between mb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0F7FF] flex items-center justify-center text-sm font-semibold text-[#0D5FA6] flex-shrink-0">
                  {project.pyme?.company_name?.[0] ?? "D"}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0D3A6E]">{project.pyme?.company_name ?? "Company"}</p>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#93B8D4]" />
                    <p className="text-xs text-[#93B8D4]">Remote</p>
                  </div>
                </div>
              </div>

              {/* Match score */}
              {matchScore > 0 && (
                <div className={`flex flex-col items-center px-4 py-2 rounded-xl border ${matchColor.bg} ${matchColor.border} flex-shrink-0`}>
                  <div className="flex items-center gap-1">
                    <Zap className={`w-4 h-4 ${matchColor.text}`} />
                    <span className={`text-lg font-bold ${matchColor.text}`}>{matchScore}%</span>
                  </div>
                  <span className={`text-[10px] ${matchColor.text}`}>match</span>
                  <div className="w-16 h-1 bg-gray-100 rounded-full mt-1">
                    <div
                      className={`h-1 rounded-full ${matchColor.bar} transition-all`}
                      style={{ width: `${matchScore}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <h1 className="text-xl font-semibold text-[#0D3A6E] mb-3">{project.title}</h1>

            <div className="flex flex-wrap gap-2">
              {project.level && (
                <span className="flex items-center gap-1 text-xs text-[#5B8DB8] bg-[#F0F7FF] px-2 py-1 rounded-full">
                  <BarChart className="w-3 h-3" /> {project.level}
                </span>
              )}
              {project.category && (
                <span className="flex items-center gap-1 text-xs text-[#5B8DB8] bg-[#F0F7FF] px-2 py-1 rounded-full">
                  <Tag className="w-3 h-3" /> {project.category}
                </span>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-[#93B8D4] mb-2">Description</p>
              <p className="text-sm text-[#5B8DB8] leading-relaxed">{project.description ?? "No description provided"}</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium uppercase tracking-widest text-[#93B8D4]">Required skills</p>
                {studentSkills.length > 0 && (
                  <span className="text-[10px] text-[#93B8D4]">
                    ✓ = you have this skill
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {project.skills.split(",").map((s, i) => {
                  const matched = isMatchedSkill(s.trim());
                  return (
                    <span key={i} className={`text-xs px-3 py-1 rounded-full border font-medium ${
                      matched
                        ? "bg-green-50 text-green-600 border-green-100"
                        : "bg-[#F0F7FF] text-[#0D5FA6] border-[#BAD8F7]"
                    }`}>
                      {matched && "✓ "}{s.trim()}
                    </span>
                  );
                })}
              </div>

              {/* Skills summary */}
              {studentSkills.length > 0 && (
                <p className="text-xs text-[#93B8D4] mt-2">
                  You match {project.skills.split(",").filter(s => isMatchedSkill(s.trim())).length} of {project.skills.split(",").length} required skills
                </p>
              )}
            </div>

            {project.pyme?.description && (
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-[#93B8D4] mb-2">About the company</p>
                <p className="text-sm text-[#5B8DB8] leading-relaxed">{project.pyme.description}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[#E8F3FD]">
            {hasApplied ? (
              <div className="flex items-center gap-2 text-sm font-medium text-[#1D9E75]">
                <CheckCircle className="w-4 h-4" />
                You have already applied to this project
              </div>
            ) : (
              <button
                onClick={handleApply}
                disabled={loading}
                className="w-full bg-[#38A3F1] text-white text-sm font-medium py-3 rounded-xl hover:bg-[#0D5FA6] transition disabled:opacity-50"
              >
                {loading ? "Sending application..." : "Apply to this project"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}