"use client";

import { Application, Certificate, Project, Pyme, Student } from "@prisma/client";
import { FolderOpen, Award, Clock, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type ApplicationWithRelations = Application & {
  project: Project & { pyme: Pyme | null };
  certificate: Certificate | null;
};

type Props = {
  user: { name: string; imageUrl: string };
  student: Student | null;
  applications: ApplicationWithRelations[];
  projects: (Project & { pyme: Pyme | null })[];
};

const statusConfig = {
  PENDING:   { label: "Pending",   bg: "bg-amber-50",   text: "text-amber-600",  dot: "bg-amber-400" },
  ACCEPTED:  { label: "Accepted",  bg: "bg-surface-raised", text: "text-brand-title", dot: "bg-brand-mid" },
  REJECTED:  { label: "Rejected",  bg: "bg-red-50",     text: "text-red-500",    dot: "bg-red-400" },
  COMPLETED: { label: "Completed", bg: "bg-green-50",   text: "text-green-600",  dot: "bg-green-500" },
};

export function StudentDashboard({ user, student, applications, projects }: Props) {
  const stats = [
    { label: "Applications",   value: applications.length,                                          icon: FolderOpen },
    { label: "Accepted",       value: applications.filter(a => a.status === "ACCEPTED").length,     icon: Clock },
    { label: "Certificates",   value: applications.filter(a => a.certificate).length,               icon: Award },
  ];

  return (
    <div className="min-h-screen bg-surface-raised p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-ink-muted mb-1">
            Welcome back
          </p>
          <h1 className="text-xl font-semibold text-brand-navy">
            {user.name}
          </h1>
        </div>
        <Image
          src={user.imageUrl}
          alt={user.name}
          width={40}
          height={40}
          className="rounded-full border-2 border-brand-border"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-brand-border p-4">
            <s.icon className="w-4 h-4 text-brand-mid mb-2" />
            <p className="text-2xl font-semibold text-brand-navy">{s.value}</p>
            <p className="text-xs text-ink-secondary mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* AI Banner */}
      <div className="bg-brand-navy rounded-xl p-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-brand-mid" />
            <p className="text-xs font-medium text-brand-mid uppercase tracking-widest">
              AI Product Manager
            </p>
          </div>
          <p className="text-white text-sm font-medium">
            Get feedback on your current project
          </p>
          <p className="text-ink-muted text-xs mt-0.5">
            Our AI reviews your work and suggests next steps
          </p>
        </div>
        <Link
          href="/student/ai"
          className="flex-shrink-0 bg-brand-mid text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-brand-title transition"
        >
          Open AI
        </Link>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border">
          <h2 className="text-sm font-semibold text-brand-navy">Recent applications</h2>
          <Link href="/student/projects" className="text-xs text-brand-mid hover:text-brand-title flex items-center gap-1">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-2">
            <FolderOpen className="w-8 h-8 text-brand-border" />
            <p className="text-sm text-ink-secondary">No applications yet</p>
            <Link href="/student/projects" className="text-xs text-brand-mid hover:underline">
              Browse projects
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-brand-border">
            {applications.map((app) => {
              const status = statusConfig[app.status as keyof typeof statusConfig];
              return (
                <div key={app.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-navy truncate">
                      {app.project.title}
                    </p>
                    <p className="text-xs text-ink-secondary">
                      {app.project.pyme?.name ?? "Company"} · Remote
                    </p>
                  </div>
                  <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available Projects */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-brand-navy">Available projects</h2>
          <Link href="/student/projects" className="text-xs text-brand-mid hover:text-brand-title flex items-center gap-1">
            See all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl border border-brand-border p-4 hover:border-brand-mid transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-surface-raised flex items-center justify-center overflow-hidden flex-shrink-0">
                  {project.pyme?.logoUrl ? (
                    <Image src={project.pyme.logoUrl} alt="" width={32} height={32} className="object-cover" />
                  ) : (
                    <span className="text-xs font-semibold text-brand-title">
                      {project.pyme?.name?.[0] ?? "D"}
                    </span>
                  )}
                </div>
                <span className="text-xs text-ink-muted">{project.level ?? "Any level"}</span>
              </div>
              <p className="text-sm font-medium text-brand-navy mb-1 line-clamp-2">{project.title}</p>
              <p className="text-xs text-ink-secondary mb-3 line-clamp-2">{project.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {project.skills.split(",").slice(0, 3).map((s, i) => (
                  <span key={i} className="text-xs bg-brand-light text-brand-title px-2 py-0.5 rounded-full">
                    {s.trim()}
                  </span>
                ))}
              </div>
              <Link
                href={`/student/projects/${project.id}`}
                className="flex items-center gap-1 text-xs font-medium text-brand-mid hover:text-brand-title transition"
              >
                See details <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}