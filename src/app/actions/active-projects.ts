"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";

export type MilestoneStats = {
  total: number;
  approved: number;
  inReview: number;
  inProgress: number;
  pending: number;
  progressPercent: number;
};

export type ActiveProject = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  pyme: { company_name: string; logo_url?: string | null } | null;
  student: { full_name: string; id: string } | null;
  milestones: {
    id: string;
    project_id: string;
    title: string;
    description: string | null;
    status: "PENDING" | "IN_PROGRESS" | "IN_REVIEW" | "APPROVED";
    due_date: string | null;
    deliverable_url: string | null;
    feedback: string | null;
  }[];
  stats: MilestoneStats;
};

function computeStats(milestones: ActiveProject["milestones"]): MilestoneStats {
  const total = milestones.length;
  const approved = milestones.filter((m) => m.status === "APPROVED").length;
  const inReview = milestones.filter((m) => m.status === "IN_REVIEW").length;
  const inProgress = milestones.filter((m) => m.status === "IN_PROGRESS").length;
  const pending = milestones.filter((m) => m.status === "PENDING").length;
  const progressPercent = total > 0 ? Math.round((approved / total) * 100) : 0;
  return { total, approved, inReview, inProgress, pending, progressPercent };
}

/**
 * Supabase puede devolver una relación anidada como objeto plano o como array
 * dependiendo de la dirección de la FK. Esta función normaliza ambos casos.
 */
function extractRelation<T>(rel: T | T[] | null | undefined): T | null {
  if (!rel) return null;
  if (Array.isArray(rel)) return rel[0] ?? null;
  return rel;
}

export async function getActiveProjectsWithMilestones(
  role: "STUDENT" | "PYME"
): Promise<ActiveProject[]> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // 📋 FLUJO ESTUDIANTE
  if (role === "STUDENT") {
    const { data: student } = await supabase
      .from("students")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!student) return [];

    const { data: applications } = await supabase
      .from("applications")
      .select("project_id, status")
      .eq("student_id", student.id)
      .in("status", ["ACCEPTED", "COMPLETED"]);

    if (!applications || applications.length === 0) return [];

    const projectIds = applications.map((a) => a.project_id);

    const { data: projects } = await supabase
      .from("projects")
      .select("id, title, description, status, pyme:pymes(company_name, logo_url)")
      .in("id", projectIds)
      .or("status.eq.ACTIVE,status.eq.active");

    if (!projects) return [];

    const result: ActiveProject[] = [];

    for (const project of projects) {
      const { data: milestones } = await supabase
        .from("milestones")
        .select("*")
        .eq("project_id", project.id)
        .order("due_date", { ascending: true });

      const pyme = extractRelation(project.pyme as any);

      result.push({
        id: project.id,
        title: project.title,
        description: project.description,
        status: project.status,
        pyme: pyme
          ? { company_name: pyme.company_name ?? "", logo_url: pyme.logo_url }
          : null,
        student: null,
        milestones: milestones ?? [],
        stats: computeStats(milestones ?? []),
      });
    }

    return result;
  }

  // 🏢 FLUJO PYME
  const { data: pyme } = await supabase
    .from("pymes")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!pyme) return [];

  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, description, status, pyme:pymes(company_name, logo_url)")
    .eq("pyme_id", pyme.id)
    .or("status.eq.ACTIVE,status.eq.active");

  if (!projects) return [];

  const result: ActiveProject[] = [];

  for (const project of projects) {
    const { data: milestones } = await supabase
      .from("milestones")
      .select("*")
      .eq("project_id", project.id)
      .order("due_date", { ascending: true });

    const { data: application } = await supabase
      .from("applications")
      .select("student:students(full_name, id)")
      .eq("project_id", project.id)
      .in("status", ["ACCEPTED", "COMPLETED"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const projectPyme = extractRelation(project.pyme as any);
    const studentRel = extractRelation(application?.student as any);

    const student = studentRel
      ? { full_name: studentRel.full_name ?? "", id: studentRel.id ?? "" }
      : null;

    result.push({
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
      pyme: projectPyme
        ? { company_name: projectPyme.company_name ?? "", logo_url: projectPyme.logo_url }
        : null,
      student,
      milestones: milestones ?? [],
      stats: computeStats(milestones ?? []),
    });
  }

  return result;
}