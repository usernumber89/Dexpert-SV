import { supabaseAdmin } from "@/lib/supabase/admin";
import { ExportError, ERROR } from "./errors";
import type { PortfolioData } from "./types";

function parseSkills(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [raw];
  } catch {
    return [raw];
  }
}

export async function fetchPortfolioData(studentId: string): Promise<PortfolioData> {
  const [studentRes, entriesRes, appsRes] = await Promise.all([
    supabaseAdmin.from("students").select("*").eq("id", studentId).single(),
    supabaseAdmin
      .from("portfolio_entries")
      .select("*")
      .eq("student_id", studentId)
      .order("sort_order", { ascending: true })
      .order("completed_at", { ascending: false }),
    supabaseAdmin
      .from("applications")
      .select("id, project:projects(title, pyme:pymes(company_name))")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false }),
  ]);

  if (!studentRes.data) {
    throw new ExportError("Student not found", ERROR.NOT_FOUND, 404);
  }

  const entries = entriesRes.data ?? [];
  const appIds = (appsRes.data ?? []).map((a: { id: string }) => a.id);

  let certificates: unknown[] = [];
  if (appIds.length > 0) {
    const { data: certs } = await supabaseAdmin
      .from("certificates")
      .select("*, applications!inner(project:projects(title, pyme:pymes(company_name)))")
      .in("application_id", appIds);
    certificates = certs ?? [];
  }

  const [eduRes, expRes] = await Promise.all([
    supabaseAdmin.from("portfolio_education").select("*").eq("student_id", studentId).order("sort_order"),
    supabaseAdmin.from("portfolio_experience").select("*").eq("student_id", studentId).order("sort_order"),
  ]);

  return {
    student: studentRes.data,
    entries,
    education: eduRes.data ?? [],
    experience: expRes.data ?? [],
    certificates,
    skills: parseSkills(studentRes.data.skills),
    totalEntries: entries.length,
    totalCertificates: certificates.length,
  };
}
