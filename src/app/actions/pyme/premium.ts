"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function hasTalentAccess() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: purchases } = await getSupabaseAdmin()
    .from("purchases")
    .select("plan")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return purchases?.some(p =>
    p.plan === "TALENT_ACCESS" || p.plan === "GROWTH" || p.plan === "PRO"
  ) ?? false;
}

// Nuevo: espera hasta que el acceso esté disponible (útil post-pago)
export async function pollTalentAccess(maxAttempts = 8, intervalMs = 2000): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    const access = await hasTalentAccess();
    if (access) return true;
    if (i < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }
  return false;
}

export async function getPymePlan() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: purchase } = await getSupabaseAdmin()
    .from("purchases")
    .select("plan")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return purchase?.plan || null;
}

import { isPremiumPlan } from "@/lib/premium";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const PLAN_CREDITS: Record<string, number> = {
  starter: 1,
  growth: 10,
  pro: 25,
};

const PLAN_AMOUNTS: Record<string, number> = {
  starter: 3.99,
  growth: 27.49,
  pro: 54.99,
};

const PLAN_NAMES: Record<string, string> = {
  starter: "Dexpert Starter",
  growth: "Dexpert Growth",
  pro: "Dexpert Pro",
};

export async function recordPurchase(transactionId: string, plan: string) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { data: pyme } = await supabase
    .from("pymes")
    .select("id, company_name")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!pyme) return { error: "PYME no encontrada" };

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  if (plan === "talent") {
    await supabaseAdmin.from("purchases").insert({
      user_id: user.id,
      pyme_id: pyme.id,
      plan: "TALENT_ACCESS",
    });
    return { success: true, plan: "TALENT_ACCESS" };
  }

  const creditsToAdd = PLAN_CREDITS[plan];
  const planUpper = plan.toUpperCase();

  const { data: creditsData } = await supabaseAdmin
    .from("pyme_credits")
    .select("credits_available")
    .eq("pyme_id", pyme.id)
    .maybeSingle();

  if (creditsData) {
    await supabaseAdmin
      .from("pyme_credits")
      .update({
        credits_available: creditsData.credits_available + creditsToAdd,
        updated_at: new Date().toISOString(),
      })
      .eq("pyme_id", pyme.id);
  } else {
    await supabaseAdmin
      .from("pyme_credits")
      .insert({ pyme_id: pyme.id, credits_available: creditsToAdd, credits_used: 0 });
  }

  await supabaseAdmin.from("credit_purchases").insert({
    user_id: user.id,
    pyme_id: pyme.id,
    plan: planUpper,
    stripe_id: transactionId,
    credits_granted: creditsToAdd,
  });

  await supabaseAdmin.from("purchases").insert({
    user_id: user.id,
    pyme_id: pyme.id,
    plan: planUpper,
  });

  try {
    const year = new Date().getFullYear();
    const { count } = await supabaseAdmin
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .gte("created_at", `${year}-01-01`)
      .lte("created_at", `${year}-12-31`);

    const invoiceNumber = `FACT-${year}-${String((count || 0) + 1).padStart(6, "0")}`;

    await supabaseAdmin.from("invoices").insert({
      pyme_id: pyme.id,
      user_id: user.id,
      invoice_number: invoiceNumber,
      plan: planUpper,
      plan_name: PLAN_NAMES[plan] || plan,
      amount: PLAN_AMOUNTS[plan] || 0,
      transaction_id: transactionId,
      company_name: pyme.company_name || null,
    });
  } catch (e) {
    console.error("Error generando factura (no crítico):", e);
  }

  return { success: true, plan: planUpper };
}

export async function toggleFeaturedProject(projectId: string, featured: boolean) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

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

export async function getSavedStudents() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const admin = getSupabaseAdmin();
  const pymeId = await getPymeId(admin, user.id);
  if (!pymeId) return [];

  const { data } = await admin
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

export async function trackProjectView(projectId: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  await supabaseAdmin.rpc("increment_project_views", { p_project_id: projectId });
}

export async function getStudents() {
  const { data } = await getSupabaseAdmin()
    .from("students")
    .select("*")
    .order("full_name", { ascending: true });
  return data || [];
}

export async function getStudentAcceptanceCounts(studentIds: string[]): Promise<Record<string, { total: number; accepted: number }>> {
  if (!studentIds.length) return {};

  const admin = getSupabaseAdmin();
  const { data: applications } = await admin
    .from("applications")
    .select("student_id, status")
    .in("student_id", studentIds);

  if (!applications) return {};

  const counts: Record<string, { total: number; accepted: number }> = {};
  for (const id of studentIds) {
    const apps = applications.filter(a => a.student_id === id);
    counts[id] = {
      total: apps.length,
      accepted: apps.filter(a => a.status === "ACCEPTED" || a.status === "COMPLETED").length,
    };
  }
  return counts;
}

async function getPymeId(supabase: any, userId: string) {
  const { data } = await supabase
    .from("pymes")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.id;
}