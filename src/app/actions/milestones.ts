"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Obtiene todos los hitos de un proyecto ordenados por fecha de entrega.
 */
export async function getMilestones(projectId: string) {
  const supabase = await createServerClient();

  const { data: milestones, error } = await supabase
    .from("milestones")
    .select("*")
    .eq("project_id", projectId)
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Error al obtener hitos:", error);
    return { success: false, error: error.message };
  }

  return { success: true, milestones };
}

/**
 * El ESTUDIANTE envía la evidencia de un hito para revisión de la PYME.
 */
export async function submitMilestoneDeliverable(milestoneId: string, deliverableUrl: string) {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autorizado" };

  if (!deliverableUrl.trim().startsWith("http")) {
    return { success: false, error: "Por favor, ingresa una URL válida (ej: https://...)" };
  }

  const { data, error } = await supabase
    .from("milestones")
    .update({
      deliverable_url: deliverableUrl,
      status: "IN_REVIEW",
      feedback: null,
    })
    .eq("id", milestoneId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/student/dashboard");
  revalidatePath("/pyme/dashboard");

  return { success: true, milestone: data };
}

/**
 * La PYME crea un nuevo hito en el proyecto.
 */
export async function createMilestone(projectId: string, title: string, description: string, dueDate: string) {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autorizado" };

  if (!title.trim()) {
    return { success: false, error: "El título del hito es obligatorio." };
  }

  const { data, error } = await supabase
    .from("milestones")
    .insert({
      project_id: projectId,
      title: title.trim(),
      description: description.trim() || null,
      due_date: dueDate || null,
      status: "PENDING",
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/student/dashboard");
  revalidatePath("/pyme/dashboard");

  return { success: true, milestone: data };
}

/**
 * La PYME aprueba el hito o solicita cambios.
 */
export async function reviewMilestone(
  milestoneId: string,
  action: "APPROVE" | "REJECT",
  feedback?: string
) {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autorizado" };

  const nextStatus = action === "APPROVE" ? "APPROVED" : "IN_PROGRESS";

  const { data, error } = await supabase
    .from("milestones")
    .update({
      status: nextStatus,
      feedback: action === "REJECT" ? feedback : null,
    })
    .eq("id", milestoneId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/student/dashboard");
  revalidatePath("/pyme/dashboard");

  return { success: true, milestone: data };
}