"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

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

    // Obtener datos del proyecto para el portafolio
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

    const certificates: any[] = [];

    for (const application of applications) {
      const { error: appUpdateError } = await supabase
        .from("applications")
        .update({ status: "COMPLETED" })
        .eq("id", application.id);

      if (appUpdateError) {
        throw new Error(`Error al actualizar la postulación ${application.id}: ${appUpdateError.message}`);
      }

      // Insertar entrada en el portafolio del estudiante
      const { error: portfolioErr } = await supabaseAdmin
        .from("portfolio_entries")
        .upsert({
          student_id: application.student_id,
          source_type: "real_project",
          source_id: projectId,
          title: project?.title || "Proyecto real",
          description: project?.description || null,
          hours_invested: 0,
          score: 100,
          is_published: true,
          completed_at: new Date().toISOString(),
        }, { onConflict: "source_id,source_type", ignoreDuplicates: false });

      if (portfolioErr) {
        console.error("Error al insertar entrada en portafolio:", portfolioErr);
      }

      const certificateUrl = `/student/certificates/${application.id}`;

      const { data: certificate, error: certError } = await supabaseAdmin
        .from("certificates")
        .insert({
          application_id: application.id,
          url: certificateUrl,
        })
        .select()
        .single();

      if (certError) {
        throw new Error(`Error al guardar el certificado para la postulación ${application.id}: ${certError.message}`);
      }

      certificates.push(certificate);

      // Actualizar experiencia del estudiante
      const { data: existingExp } = await supabaseAdmin
        .from("student_experience")
        .select("*")
        .eq("student_id", application.student_id)
        .maybeSingle();

      const realProjectXP = 150;

      if (existingExp) {
        await supabaseAdmin
          .from("student_experience")
          .update({
            real_projects_completed: (existingExp.real_projects_completed || 0) + 1,
            total_xp: existingExp.total_xp + realProjectXP,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingExp.id);
      } else {
        await supabaseAdmin
          .from("student_experience")
          .insert({
            student_id: application.student_id,
            real_projects_completed: 1,
            total_xp: realProjectXP,
            simulations_completed: 0,
            avg_score: 0,
            level: 1,
          });
      }
    }

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

  return { success: true };
}