"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function getPymePlan() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: purchase } = await supabase
    .from("purchases")
    .select("plan")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return purchase?.plan || null;
}

import { isPremiumPlan } from "@/lib/premium";

// ── Proyectos Destacados ──

export async function toggleFeaturedProject(projectId: string, featured: boolean) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const plan = await getPymePlan();
  if (!isPremiumPlan(plan)) return { error: "Se requiere plan premium" };

  const { error } = await supabase
    .from("projects")
    .update({ is_featured: featured })
    .eq("id", projectId)
    .eq("pyme_id", (await getPymeId(supabase, user.id)));

  if (error) return { error: error.message };
  return { success: true, featured };
}

export async function getFeaturedProjects() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("projects")
    .select("id, title, is_featured, pyme:pymes(company_name, logo_url)")
    .eq("is_featured", true)
    .eq("is_published", true)
    .eq("status", "active")
    .limit(20);
  return data || [];
}

// ── Talent Pool (Favoritos) ──

export async function getSavedStudents() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const pymeId = await getPymeId(supabase, user.id);
  if (!pymeId) return [];

  const { data } = await supabase
    .from("saved_students")
    .select("*, student:students(*)")
    .eq("pyme_id", pymeId)
    .order("created_at", { ascending: false });

  return data || [];
}

export async function saveStudent(studentId: string, notes?: string) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const plan = await getPymePlan();
  if (!isPremiumPlan(plan)) return { error: "Se requiere plan premium" };

  const pymeId = await getPymeId(supabase, user.id);
  if (!pymeId) return { error: "Perfil PYME no encontrado" };

  const { error } = await supabase
    .from("saved_students")
    .upsert({ pyme_id: pymeId, student_id: studentId, notes }, { onConflict: "pyme_id,student_id" });

  if (error) return { error: error.message };
  return { success: true };
}

export async function removeSavedStudent(studentId: string) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const pymeId = await getPymeId(supabase, user.id);
  if (!pymeId) return { error: "Perfil PYME no encontrado" };

  const { error } = await supabase
    .from("saved_students")
    .delete()
    .eq("pyme_id", pymeId)
    .eq("student_id", studentId);

  if (error) return { error: error.message };
  return { success: true };
}

// ── Analítica de proyecto ──

export async function getAllProjectsAnalytics() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const pymeId = await getPymeId(supabase, user.id);
  if (!pymeId) return [];

  const { data: projects } = await supabase
    .from("projects")
    .select(`
      id, title, description, status, is_published, is_featured, created_at,
      analytics:project_analytics(*),
      applications:applications(id, status, created_at,
        student:students(full_name, avatar_url, skills)
      )
    `)
    .eq("pyme_id", pymeId)
    .order("created_at", { ascending: false });

  return (projects || []).map((p: any) => ({
    ...p,
    total_applications: p.analytics?.total_applications || p.applications?.length || 0,
    total_views: p.analytics?.total_views || 0,
    avg_student_score: p.analytics?.avg_student_score || 0,
    accepted: p.applications?.filter((a: any) => a.status === "ACCEPTED").length || 0,
    pending: p.applications?.filter((a: any) => a.status === "PENDING").length || 0,
    rejected: p.applications?.filter((a: any) => a.status === "REJECTED").length || 0,
  }));
}

export async function getProjectAnalytics(projectId: string) {
  const supabase = await createServerClient();
  const { data: analytics } = await supabase
    .from("project_analytics")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();

  const { data: applications } = await supabase
    .from("applications")
    .select("*, student:students(full_name, avatar_url, skills)")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  return { analytics, applications: applications || [] };
}

// ── Vistas de proyectos ──

export async function trackProjectView(projectId: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  await supabaseAdmin.rpc("increment_project_views", {
    p_project_id: projectId,
  });
}

// ── Helpers ──

async function getPymeId(supabase: any, userId: string) {
  const { data } = await supabase
    .from("pymes")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.id;
}
