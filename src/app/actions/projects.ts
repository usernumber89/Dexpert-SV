"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function completeProject(projectId: string) {
  const supabase = await createServerClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "No autorizado. Por favor, inicia sesión." };
  }

  try {
    const { data: applications, error: appError } = await supabase
      .from("applications")
      .select("id, student_id")
      .eq("project_id", projectId)
      .eq("status", "ACCEPTED");

    if (appError) {
      throw new Error(`Error buscando la postulación: ${appError.message}`);
    }

    if (!applications || applications.length === 0) {
      throw new Error("No se encontró ningún estudiante con postulación 'aceptada' en este proyecto.");
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Faltan las variables de entorno administrativas de Supabase.");
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: project } = await supabase
      .from("projects")
      .select("title, description")
      .eq("id", projectId)
      .single();

    const { error: projectUpdateError } = await supabase
      .from("projects")
      .update({ status: "completed" })
      .eq("id", projectId);

    if (projectUpdateError) {
      throw new Error(`Error al completar el proyecto: ${projectUpdateError.message}`);
    }

    const studentIds = applications.map((a) => a.student_id);
    const appIds = applications.map((a) => a.id);

    const [{ data: existingExps }, { data: existingPortfolios }] = await Promise.all([
      supabaseAdmin.from("student_experience").select("*").in("student_id", studentIds),
      supabaseAdmin
        .from("portfolio_entries")
        .select("student_id")
        .eq("source_id", projectId)
        .eq("source_type", "real_project")
        .in("student_id", studentIds),
    ]);

    const existingExpByStudent = new Map((existingExps ?? []).map((e) => [e.student_id, e]));
    const portfolioStudentIds = new Set((existingPortfolios ?? []).map((p) => p.student_id));

    const appUpdateResults = await supabase
      .from("applications")
      .update({ status: "COMPLETED" })
      .in("id", appIds)
      .select("id");

    if (appUpdateResults.error) {
      throw new Error(`Error al actualizar postulaciones: ${appUpdateResults.error.message}`);
    }

    const portfolioInserts = applications
      .filter((a) => !portfolioStudentIds.has(a.student_id))
      .map((a) => ({
        student_id: a.student_id,
        source_type: "real_project",
        source_id: projectId,
        title: project?.title || "Proyecto real",
        description: project?.description || null,
        hours_invested: 0,
        score: 100,
        is_published: true,
        completed_at: new Date().toISOString(),
      }));

    if (portfolioInserts.length > 0) {
      const { error: portfolioErr } = await supabaseAdmin
        .from("portfolio_entries")
        .insert(portfolioInserts);

      if (portfolioErr) {
        console.error("Error al insertar entradas de portafolio:", portfolioErr);
      }
    }

    const certificateInserts = applications.map((a) => ({
      application_id: a.id,
      url: `/student/certificates/${a.id}`,
    }));

    const { data: certificates, error: certError } = await supabaseAdmin
      .from("certificates")
      .insert(certificateInserts)
      .select();

    if (certError) {
      throw new Error(`Error al guardar certificados: ${certError.message}`);
    }

    const realProjectXP = 150;
    const experienceOps = applications.map(async (a) => {
      const existing = existingExpByStudent.get(a.student_id);
      if (existing) {
        return supabaseAdmin
          .from("student_experience")
          .update({
            real_projects_completed: (existing.real_projects_completed || 0) + 1,
            total_xp: existing.total_xp + realProjectXP,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        return supabaseAdmin
          .from("student_experience")
          .insert({
            student_id: a.student_id,
            real_projects_completed: 1,
            total_xp: realProjectXP,
            simulations_completed: 0,
            avg_score: 0,
            level: 1,
          });
      }
    });

    await Promise.all(experienceOps);

    revalidatePath('/student/portfolio');
    revalidatePath('/student/dashboard');
    revalidatePath('/student/in-progress');
    revalidatePath('/pyme/in-progress');
    revalidatePath('/pyme/dashboard');

    return { success: true, certificates };

  } catch (error: any) {
    console.error("Error en completeProject:", error);
    return { 
      success: false, 
      error: error.message || "Ocurrió un error inesperado al procesar la acción." 
    };
  }
}

export async function deleteProject(projectId: string) {
  const supabase = await createServerClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "No autorizado. Por favor, inicia sesión." };
  }

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/pyme/dashboard');
  revalidatePath('/pyme/in-progress');

  return { success: true };
}
