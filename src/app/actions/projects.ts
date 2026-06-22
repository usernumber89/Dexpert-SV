"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Cierra un proyecto por su ID, marca la postulación del alumno como completada
 * y genera su certificado digital de forma administrativa.
 */
export async function closeProjectAndGenerateCertificates(projectId: string) {
  const supabase = await createServerClient();

  // 1. Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "No autorizado. Por favor, inicia sesión." };
  }

  try {
    // 2. Buscar las postulaciones aceptadas para este proyecto
    // 🛠️ CORRECCIÓN: Recibimos 'applications' (en plural)
    const { data: applications, error: appError } = await supabase
      .from("applications")
      .select("id")
      .eq("project_id", projectId)
      .eq("status", "ACCEPTED");

    if (appError) {
      throw new Error(`Error buscando la postulación: ${appError.message}`);
    }

    if (!applications || applications.length === 0) {
      throw new Error("No se encontró ningún estudiante con postulación 'aceptada' en este proyecto para poder certificarlo.");
    }

    // 3. Inicializar cliente administrador para la inserción del certificado (Bypass RLS)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Faltan las variables de entorno administrativas de Supabase.");
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 4. Cerrar el proyecto
    const { error: projectUpdateError } = await supabase
      .from("projects")
      .update({ status: "closed" })
      .eq("id", projectId);

    if (projectUpdateError) {
      throw new Error(`Error al cerrar el proyecto: ${projectUpdateError.message}`);
    }

    // 5. Procesar cada estudiante aceptado: actualizar postulación y generar certificado
    const certificates: any[] = [];

    for (const application of applications) {
      const { error: appUpdateError } = await supabase
        .from("applications")
        .update({ status: "COMPLETED" })
        .eq("id", application.id);

      if (appUpdateError) {
        throw new Error(`Error al actualizar la postulación ${application.id}: ${appUpdateError.message}`);
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
    }

    return { success: true, certificates };

  } catch (error: any) {
    console.error("Error en closeProjectAndGenerateCertificates:", error);
    return { 
      success: false, 
      error: error.message || "Ocurrió un error inesperado al procesar el cierre." 
    };
  }
}