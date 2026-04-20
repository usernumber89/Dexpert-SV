"use client";

import { Project, Pyme } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, MapPin, Tag, BarChart } from "lucide-react";
import Link from "next/link";

type Props = {
  project: Project & { pyme: Pyme | null };
  hasApplied: boolean;
  studentId: string | null;
};

export function ProjectDetail({ project, hasApplied: initialApplied, studentId }: Props) {
  const router = useRouter();
  const [hasApplied, setHasApplied] = useState(initialApplied);
  const [loading, setLoading] = useState(false);

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

        {/* Back */}
        <Link href="/student/projects" className="flex items-center gap-2 text-sm text-[#5B8DB8] hover:text-[#0D3A6E] mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Back to projects
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#BAD8F7] overflow-hidden">

          {/* Header */}
          <div className="p-6 border-b border-[#E8F3FD]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#F0F7FF] flex items-center justify-center text-sm font-semibold text-[#0D5FA6]">
                {project.pyme?.name?.[0] ?? "D"}
              </div>
              <div>
                <p className="text-sm font-medium text-[#0D3A6E]">{project.pyme?.name ?? "Company"}</p>
                <p className="text-xs text-[#93B8D4]">Remote</p>
              </div>
            </div>
            <h1 className="text-xl font-semibold text-[#0D3A6E] mb-2">{project.title}</h1>
            <div className="flex flex-wrap gap-3">
              {project.level && (
                <span className="flex items-center gap-1 text-xs text-[#5B8DB8]">
                  <BarChart className="w-3 h-3" /> {project.level}
                </span>
              )}
              {project.category && (
                <span className="flex items-center gap-1 text-xs text-[#5B8DB8]">
                  <Tag className="w-3 h-3" /> {project.category}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-[#5B8DB8]">
                <MapPin className="w-3 h-3" /> Remote
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-[#93B8D4] mb-2">Description</p>
              <p className="text-sm text-[#5B8DB8] leading-relaxed">{project.description}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-[#93B8D4] mb-2">Required skills</p>
              <div className="flex flex-wrap gap-2">
                {project.skills.split(",").map((s, i) => (
                  <span key={i} className="text-xs bg-[#F0F7FF] text-[#0D5FA6] px-3 py-1 rounded-full border border-[#BAD8F7]">
                    {s.trim()}
                  </span>
                ))}
              </div>
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