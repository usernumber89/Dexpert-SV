"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export type Scenario = {
  id: string;
  area: string;
  title: string;
  client_name: string;
  client_personality: string;
  client_goal: string;
  brief: string;
  objectives: string[];
  constraints: string[];
  skills_required: string[];
  estimated_days: number;
  difficulty: string;
};

export type SimulationSession = {
  id: string;
  student_id: string;
  scenario_id: string;
  status: "in_progress" | "completed" | "evaluated";
  brief: string;
  objectives: string[];
  constraints: string[];
  deliverable_url: string | null;
  started_at: string;
  completed_at: string | null;
  scenario?: Scenario;
};

export type SimulationMessage = {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
};

export type ChangeRequest = {
  id: string;
  session_id: string;
  title: string;
  description: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  created_at: string;
};

export type Evaluation = {
  id: string;
  session_id: string;
  overall_score: number;
  rubric: { criterion: string; score: number; comment: string }[];
  strengths: string[];
  improvements: string[];
  summary: string;
};

export async function getScenariosByArea(area?: string): Promise<Scenario[]> {
  const supabase = await createServerClient();
  let query = supabase.from("simulation_scenarios").select("*").eq("is_active", true);
  if (area) query = query.eq("area", area);
  const { data } = await query;
  return (data as Scenario[]) || [];
}

export async function getAreas(): Promise<string[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("simulation_scenarios")
    .select("area")
    .eq("is_active", true);
  if (!data) return [];
  return [...new Set(data.map((d: any) => d.area))] as string[];
}

export async function getStudentSessions(): Promise<(SimulationSession & { scenario?: Scenario })[]> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!student) return [];

  const { data } = await supabase
    .from("simulation_sessions")
    .select("*, scenario:simulation_scenarios(*)")
    .eq("student_id", student.id)
    .order("started_at", { ascending: false });

  return (data as any[]) || [];
}

export async function getSessionMessages(sessionId: string): Promise<SimulationMessage[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("simulation_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  return (data as SimulationMessage[]) || [];
}

export async function getChangeRequests(sessionId: string): Promise<ChangeRequest[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("change_requests")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  return (data as ChangeRequest[]) || [];
}

export async function updateChangeRequestStatus(id: string, status: string): Promise<void> {
  const supabase = await createServerClient();
  await supabase.from("change_requests").update({ status }).eq("id", id);
}

export async function getEvaluation(sessionId: string): Promise<Evaluation | null> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("evaluations")
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle();
  return data as Evaluation | null;
}

export async function getPortfolioEntries(): Promise<any[]> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!student) return [];

  const { data } = await supabase
    .from("portfolio_entries")
    .select("*")
    .eq("student_id", student.id)
    .order("completed_at", { ascending: false });
  return data || [];
}

export async function getStudentExperience() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!student) return null;

  const { data: exp } = await supabase
    .from("student_experience")
    .select("*, level_info:experience_levels(*)")
    .eq("student_id", student.id)
    .maybeSingle();

  if (!exp) {
    return {
      level: 1,
      total_xp: 0,
      simulations_completed: 0,
      real_projects_completed: 0,
      avg_score: 0,
      next_level_xp: 100,
      level_info: null,
    };
  }

  const { data: nextLevel } = await supabase
    .from("experience_levels")
    .select("xp_required")
    .eq("level", (exp as any).level + 1)
    .maybeSingle();

  return {
    ...exp,
    next_level_xp: (nextLevel as any)?.xp_required || null,
  };
}

export async function getExperienceLevels() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("experience_levels")
    .select("*")
    .order("level", { ascending: true });
  return data || [];
}

export async function backfillExperience() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { success: false, error: "Faltan variables de entorno admin" };
  }
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: sessions } = await admin
    .from("simulation_sessions")
    .select("id, student_id, scenario_id, status, started_at")
    .in("status", ["evaluated", "completed"]);

  if (!sessions || sessions.length === 0) {
    return { success: false, error: "No hay sesiones evaluadas" };
  }

  let created = 0;
  let errors = 0;

  for (const session of sessions) {
    const { data: evaluation } = await admin
      .from("evaluations")
      .select("*")
      .eq("session_id", session.id)
      .maybeSingle();

    if (!evaluation) continue;

    const { data: scenario } = await admin
      .from("simulation_scenarios")
      .select("title, skills_required")
      .eq("id", session.scenario_id)
      .single();

    const { count } = await admin
      .from("simulation_messages")
      .select("*", { count: "exact", head: true })
      .eq("session_id", session.id)
      .eq("role", "user");

    const hoursInvested = Math.round((count || 0) * 0.25);

    const { error: peErr } = await admin.from("portfolio_entries").upsert({
      student_id: session.student_id,
      source_type: "simulation",
      source_id: session.id,
      title: `Simulación: ${scenario?.title || "Proyecto profesional"}`,
      description: evaluation.summary,
      skills_demonstrated: scenario?.skills_required || [],
      hours_invested: hoursInvested,
      results: `Completado con puntuación de ${evaluation.overall_score}/100. Fortalezas: ${(evaluation.strengths || []).slice(0, 2).join(", ")}`,
      score: evaluation.overall_score,
      is_published: true,
      completed_at: session.started_at,
    }, { onConflict: "source_id,source_type", ignoreDuplicates: false });

    if (peErr) {
      console.error("Error creating portfolio entry:", peErr);
      errors++;
      continue;
    }

    const xpGained = Math.round((evaluation.overall_score * 0.7) + (count || 0) * 5);

    const { data: existing } = await admin
      .from("student_experience")
      .select("*")
      .eq("student_id", session.student_id)
      .maybeSingle();

    if (existing) {
      const newTotalXp = existing.total_xp + xpGained;
      const newSimsCompleted = existing.simulations_completed + 1;
      const newAvgScore = ((existing.avg_score * existing.simulations_completed) + evaluation.overall_score) / newSimsCompleted;

      const { data: levelData } = await admin
        .from("experience_levels")
        .select("level")
        .lte("xp_required", newTotalXp)
        .order("level", { ascending: false })
        .limit(1)
        .maybeSingle();

      await admin.from("student_experience").update({
        total_xp: newTotalXp,
        simulations_completed: newSimsCompleted,
        avg_score: Math.round(newAvgScore * 100) / 100,
        level: levelData?.level || existing.level,
        updated_at: new Date().toISOString(),
      }).eq("id", existing.id);
    } else {
      const { data: levelData } = await admin
        .from("experience_levels")
        .select("level")
        .lte("xp_required", xpGained)
        .order("level", { ascending: false })
        .limit(1)
        .maybeSingle();

      await admin.from("student_experience").insert({
        student_id: session.student_id,
        total_xp: xpGained,
        simulations_completed: 1,
        avg_score: evaluation.overall_score,
        level: levelData?.level || 1,
      });
    }

    created++;
  }

  return { success: true, created, errors };
}
