"use client";

import { Application, Certificate, Project, Pyme, Student } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Check, X, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

type ApplicationWithStudent = Application & {
  student: Student;
  certificate: Certificate | null;
};

type Props = {
  project: Project & {
    pyme: Pyme | null;
    applications: ApplicationWithStudent[];
  };
};

const statusConfig = {
  PENDING:   { label: "Pending",   bg: "bg-amber-50",   text: "text-amber-600" },
  ACCEPTED:  { label: "Accepted",  bg: "bg-[#F0F7FF]",  text: "text-[#0D5FA6]" },
  REJECTED:  { label: "Rejected",  bg: "bg-red-50",     text: "text-red-500" },
  COMPLETED: { label: "Completed", bg: "bg-green-50",   text: "text-green-600" },
};

export function PymeProjectDetail({ project }: Props) {
  const router = useRouter();
  const [applications, setApplications] = useState(project.applications);
  const [isPublished, setIsPublished] = useState(project.isPublished);
  const [updating, setUpdating] = useState<string | null>(null);

  const updateStatus = async (appId: string, status: "ACCEPTED" | "REJECTED") => {
    setUpdating(appId);
    try {
      await fetch(`/api/project/${project.id}/application/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
      toast.success(status === "ACCEPTED" ? "Applicant accepted!" : "Applicant rejected");
    } catch {
      toast.error("Error updating status");
    } finally {
      setUpdating(null);
    }
  };

  const togglePublish = async () => {
    try {
      await fetch(`/api/project/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !isPublished }),
      });
      setIsPublished(!isPublished);
      toast.success(isPublished ? "Project unpublished" : "Project published!");
    } catch {
      toast.error("Error updating project");
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] p-6">
      <div className="max-w-3xl mx-auto space-y-4">

        {/* Back */}
        <Link href="/pyme/dashboard" className="flex items-center gap-2 text-sm text-[#5B8DB8] hover:text-[#0D3A6E] transition">
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>

        {/* Project info */}
        <div className="bg-white rounded-2xl border border-[#BAD8F7] p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-lg font-semibold text-[#0D3A6E] mb-1">{project.title}</h1>
              <p className="text-sm text-[#5B8DB8]">{project.description}</p>
            </div>
            <button
              onClick={togglePublish}
              className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg transition ${
                isPublished
                  ? "bg-green-50 text-green-600 hover:bg-red-50 hover:text-red-500"
                  : "bg-[#F0F7FF] text-[#0D5FA6] hover:bg-green-50 hover:text-green-600"
              }`}
            >
              {isPublished ? <><EyeOff className="w-3.5 h-3.5" /> Unpublish</> : <><Eye className="w-3.5 h-3.5" /> Publish</>}
            </button>
          </div>

          <div className="flex flex-wrap gap-1">
            {project.skills.split(",").map((s, i) => (
              <span key={i} className="text-xs bg-[#F0F7FF] text-[#0D5FA6] px-2 py-0.5 rounded-full border border-[#BAD8F7]">
                {s.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* Applications */}
        <div className="bg-white rounded-2xl border border-[#BAD8F7] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E8F3FD] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#0D3A6E]">Applications</h2>
            <span className="text-xs text-[#93B8D4]">{applications.length} total</span>
          </div>

          {applications.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-2">
              <p className="text-sm text-[#5B8DB8]">No applications yet</p>
              <p className="text-xs text-[#93B8D4]">Publish your project so students can find it</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E8F3FD]">
              {applications.map((app) => {
                const status = statusConfig[app.status as keyof typeof statusConfig];
                return (
                  <div key={app.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-8 h-8 rounded-full bg-[#F0F7FF] flex items-center justify-center text-xs font-medium text-[#0D5FA6] flex-shrink-0">
                      {app.student.fullName?.[0] ?? "S"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0D3A6E]">{app.student.fullName}</p>
                      <p className="text-xs text-[#93B8D4]">{app.student.education ?? "No education listed"}</p>
                      {app.student.skills && (
                        <p className="text-xs text-[#5B8DB8] mt-0.5 truncate">{app.student.skills}</p>
                      )}
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                    {app.status === "PENDING" && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => updateStatus(app.id, "ACCEPTED")}
                          disabled={updating === app.id}
                          className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-100 transition disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateStatus(app.id, "REJECTED")}
                          disabled={updating === app.id}
                          className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}