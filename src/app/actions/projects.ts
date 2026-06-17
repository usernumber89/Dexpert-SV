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
    // 2. Buscar la postulación aceptada para este proyecto
    // (Ajusta 'accepted' si en tu base de datos usas otro nombre como 'aprobado' o 'seleccionado')
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("id")
      .eq("project_id", projectId)
      .eq("status", "ACCEPTED") 
      .maybeSingle();

    if (appError) {
      throw new Error(`Error buscando la postulación: ${appError.message}`);
    }

    if (!application) {
      throw new Error("No se encontró ningún estudiante con postulación 'aceptada' en este proyecto para poder certificarlo.");
    }

    // 3. Actualizar el estado del proyecto a cerrado ('closed')
    const { error: projectUpdateError } = await supabase
      .from("projects")
      .update({ status: "closed" })
      .eq("id", projectId);

    if (projectUpdateError) {
      throw new Error(`Error al cerrar el proyecto: ${projectUpdateError.message}`);
    }

    // 4. Actualizar la postulación del alumno a completada ('completed')
    const { error: appUpdateError } = await supabase
      .from("applications")
      .update({ status: "COMPLETED" })
      .eq("id", application.id);

    if (appUpdateError) {
      throw new Error(`Error al actualizar la postulación: ${appUpdateError.message}`);
    }

    // 5. Inicializar cliente administrador para la inserción del certificado (Bypass RLS)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Faltan las variables de entorno administrativas de Supabase.");
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const certificateUrl = `/student/certificates/${application.id}`;

    // 6. Insertar el certificado vinculándolo al ID de la postulación real
    const { data: certificate, error: certError } = await supabaseAdmin
      .from("certificates")
      .insert({
        application_id: application.id,
        url: certificateUrl,
      })
      .select()
      .single();

    if (certError) {
      throw new Error(`Error al guardar el certificado en la base de datos: ${certError.message}`);
    }

    return { success: true, certificate };

  } catch (error: any) {
    console.error("Error en closeProjectAndGenerateCertificates:", error);
    return { 
      success: false, 
      error: error.message || "Ocurrió un error inesperado al procesar el cierre." 
    };
  }
}