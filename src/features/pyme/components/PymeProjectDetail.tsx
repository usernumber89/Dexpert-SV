"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft, Check, X, Eye, EyeOff,
  ChevronDown, ChevronUp, GraduationCap,
  Briefcase, MapPin, Phone, Mail, Globe, FileText, Star, User
} from "lucide-react";
import Link from "next/link";

type Student = {
  id: string;
  full_name?: string | null;
  education?: string | null;
  skills?: string[] | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  bio?: string | null;
  university?: string | null;
  major?: string | null;
  graduation_year?: string | null;
  linkedin?: string | null;
  github?: string | null;
  portfolio?: string | null;
  resume_url?: string | null;
  avatar_url?: string | null;
  verified?: boolean | null;
};

type Pyme = {
  id: string;
  company_name?: string;
  logo_url?: string | null;
};

type Project = {
  id: string;
  title: string;
  description?: string | null;
  skills: string;
  is_published: boolean;
  pyme?: Pyme | null;
};

type Application = {
  id: string;
  status: string;
  students?: Student | null;
  student?: Student | null;
};

type Props = {
  project: Project & {
    applications: Application[];
  };
};

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  PENDING:   { label: "Pending",   bg: "bg-amber-50",  text: "text-amber-600" },
  ACCEPTED:  { label: "Accepted",  bg: "bg-[#F0F7FF]", text: "text-[#0D5FA6]" },
  REJECTED:  { label: "Rejected",  bg: "bg-red-50",    text: "text-red-500" },
  COMPLETED: { label: "Completed", bg: "bg-green-50",  text: "text-green-600" },
};

function StudentProfile({ student }: { student: Student }) {
  return (
    <div className="mt-4 pt-4 border-t border-[#E8F3FD] space-y-4">

      {/* Bio */}
      {student.bio && (
        <p className="text-sm text-[#5B8DB8] leading-relaxed">{student.bio}</p>
      )}

      {/* Academic info */}
      {(student.university || student.major || student.graduation_year) && (
        <div className="flex flex-wrap gap-3">
          {student.university && (
            <div className="flex items-center gap-1.5 text-xs text-[#5B8DB8]">
              <GraduationCap className="w-3.5 h-3.5 text-[#38A3F1]" />
              {student.university}
            </div>
          )}
          {student.major && (
            <div className="flex items-center gap-1.5 text-xs text-[#5B8DB8]">
              <Briefcase className="w-3.5 h-3.5 text-[#38A3F1]" />
              {student.major}
            </div>
          )}
          {student.graduation_year && (
            <div className="flex items-center gap-1.5 text-xs text-[#5B8DB8]">
              <Star className="w-3.5 h-3.5 text-[#38A3F1]" />
              Class of {student.graduation_year}
            </div>
          )}
        </div>
      )}

      {/* Contact info */}
      <div className="flex flex-wrap gap-3">
        {student.location && (
          <div className="flex items-center gap-1.5 text-xs text-[#5B8DB8]">
            <MapPin className="w-3.5 h-3.5 text-[#93B8D4]" />
            {student.location}
          </div>
        )}
        {student.email && (
          <a href={`mailto:${student.email}`} className="flex items-center gap-1.5 text-xs text-[#38A3F1] hover:text-[#0D5FA6] transition">
            <Mail className="w-3.5 h-3.5" />
            {student.email}
          </a>
        )}
        {student.phone && (
          <a href={`tel:${student.phone}`} className="flex items-center gap-1.5 text-xs text-[#5B8DB8] hover:text-[#0D3A6E] transition">
            <Phone className="w-3.5 h-3.5" />
            {student.phone}
          </a>
        )}
      </div>

      {/* Skills */}
      {student.skills && student.skills.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#93B8D4] mb-2">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {student.skills.map((skill, i) => (
              <span
                key={i}
                className="text-xs bg-gradient-to-r from-[#F0F7FF] to-[#E8F3FD] text-[#0D5FA6] px-2.5 py-1 rounded-full border border-[#BAD8F7] font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      {(student.linkedin || student.github || student.portfolio || student.resume_url) && (
        <div className="flex flex-wrap gap-2 pt-1">
          {student.linkedin && (
            <a
              href={student.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[#F0F7FF] text-[#0D5FA6] hover:bg-[#BAD8F7] transition"
          >
              <Globe className="w-3.5 h-3.5" />
              LinkedIn
            </a>
          )}
          {student.github && (
            <a
              href={student.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[#F0F7FF] text-[#0D3A6E] hover:bg-[#BAD8F7] transition"
            >
              <Globe className="w-3.5 h-3.5" />
              GitHub
            </a>
          )}
          {student.portfolio && (
            <a
              href={student.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[#F0F7FF] text-[#5B8DB8] hover:bg-[#BAD8F7] transition"
            >
              <Globe className="w-3.5 h-3.5" />
              Portfolio
            </a>
          )}
          {student.resume_url && (
            <a
              href={student.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[#0D3A6E] text-white hover:bg-[#0D5FA6] transition"
            >
              <FileText className="w-3.5 h-3.5" />
              Resume
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function ApplicationCard({
  app,
  onUpdateStatus,
  updating,
}: {
  app: Application;
  onUpdateStatus: (id: string, status: "ACCEPTED" | "REJECTED") => void;
  updating: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const status = statusConfig[app.status] || statusConfig.PENDING;
  const student = app.students ?? app.student ?? null;
  const studentName = student?.full_name ?? "Unknown";
  const studentInitial = studentName.charAt(0).toUpperCase();
  const education = student?.education ?? null;

  return (
    <div className="border-b border-[#E8F3FD] last:border-0">
      <div className="flex items-center gap-4 px-6 py-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {student?.avatar_url ? (
            <img
              src={student.avatar_url}
              alt={studentName}
              className="w-10 h-10 rounded-full object-cover border-2 border-[#BAD8F7]"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#38A3F1] to-[#0D5FA6] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {studentInitial}
            </div>
          )}
          {student?.verified && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <Check className="w-2 h-2 text-white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[#0D3A6E] truncate">{studentName}</p>
            {student?.verified && (
              <span className="text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                Verified
              </span>
            )}
          </div>
          {education && (
            <p className="text-xs text-[#93B8D4] truncate">{education}</p>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}>
            {status.label}
          </span>

          {app.status === "PENDING" && (
            <div className="flex gap-1.5">
              <button
                onClick={() => onUpdateStatus(app.id, "ACCEPTED")}
                disabled={updating === app.id}
                className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-100 transition disabled:opacity-50"
                title="Accept"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => onUpdateStatus(app.id, "REJECTED")}
                disabled={updating === app.id}
                className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition disabled:opacity-50"
                title="Reject"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="w-8 h-8 rounded-lg bg-[#F0F7FF] flex items-center justify-center text-[#5B8DB8] hover:bg-[#BAD8F7] transition"
            title={expanded ? "Hide profile" : "View profile"}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded profile */}
      {expanded && student && (
        <div className="px-6 pb-5">
          <div className="bg-[#F8FBFF] rounded-xl border border-[#E8F3FD] p-4">
            <StudentProfile student={student} />
          </div>
        </div>
      )}

      {expanded && !student && (
        <div className="px-6 pb-5">
          <div className="bg-[#F8FBFF] rounded-xl border border-[#E8F3FD] p-4 flex items-center gap-2 text-sm text-[#93B8D4]">
            <User className="w-4 h-4" />
            No profile information available
          </div>
        </div>
      )}
    </div>
  );
}

export function PymeProjectDetail({ project }: Props) {
  const [applications, setApplications] = useState(project.applications);
  const [isPublished, setIsPublished] = useState(project.is_published);
  const [updating, setUpdating] = useState<string | null>(null);

  const updateStatus = async (appId: string, status: "ACCEPTED" | "REJECTED") => {
    setUpdating(appId);
    try {
      await fetch(`/api/project/${project.id}/application/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setApplications(prev =>
        prev.map(a => (a.id === appId ? { ...a, status } : a))
      );
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

  const accepted = applications.filter(a => a.status === "ACCEPTED").length;
  const pending  = applications.filter(a => a.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-[#F0F7FF] p-6">
      <div className="max-w-3xl mx-auto space-y-4">

        {/* Back */}
        <Link
          href="/pyme/dashboard"
          className="inline-flex items-center gap-2 text-sm text-[#5B8DB8] hover:text-[#0D3A6E] transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>

        {/* Project info */}
        <div className="bg-white rounded-2xl border border-[#BAD8F7] p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-lg font-semibold text-[#0D3A6E] mb-1">{project.title}</h1>
              <p className="text-sm text-[#5B8DB8] leading-relaxed">{project.description}</p>
            </div>
            <button
              onClick={togglePublish}
              className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg transition ${
                isPublished
                  ? "bg-green-50 text-green-600 hover:bg-red-50 hover:text-red-500"
                  : "bg-[#F0F7FF] text-[#0D5FA6] hover:bg-green-50 hover:text-green-600"
              }`}
            >
              {isPublished
                ? <><EyeOff className="w-3.5 h-3.5" /> Unpublish</>
                : <><Eye className="w-3.5 h-3.5" /> Publish</>}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.skills.split(",").map((s, i) => (
              <span key={i} className="text-xs bg-[#F0F7FF] text-[#0D5FA6] px-2.5 py-1 rounded-full border border-[#BAD8F7] font-medium">
                {s.trim()}
              </span>
            ))}
          </div>

          {/* Mini stats */}
          <div className="flex gap-4 pt-4 border-t border-[#E8F3FD]">
            <div className="text-center">
              <p className="text-lg font-bold text-[#0D3A6E]">{applications.length}</p>
              <p className="text-[10px] text-[#93B8D4] uppercase tracking-wide">Total</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-amber-500">{pending}</p>
              <p className="text-[10px] text-[#93B8D4] uppercase tracking-wide">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-500">{accepted}</p>
              <p className="text-[10px] text-[#93B8D4] uppercase tracking-wide">Accepted</p>
            </div>
          </div>
        </div>

        {/* Applications */}
        <div className="bg-white rounded-2xl border border-[#BAD8F7] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E8F3FD] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#0D3A6E]">Applications</h2>
            <span className="text-xs text-[#93B8D4]">{applications.length} total</span>
          </div>

          {applications.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-[#F0F7FF] flex items-center justify-center mb-2">
                <User className="w-7 h-7 text-[#BAD8F7]" />
              </div>
              <p className="text-sm font-medium text-[#0D3A6E]">No applications yet</p>
              <p className="text-xs text-[#93B8D4]">Publish your project so students can find it</p>
            </div>
          ) : (
            <div>
              {applications.map((app: Application) => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  onUpdateStatus={updateStatus}
                  updating={updating}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}