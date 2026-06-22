"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type MilestoneRow = {
  id: string;
  project_id: string;
  student_id: string;
  title: string;
  description: string | null;
  status: "PENDING" | "IN_PROGRESS" | "IN_REVIEW" | "APPROVED";
  due_date: string | null;
  deliverable_url: string | null;
  feedback: string | null;
  created_at: string | null;
};

export async function getMilestones(projectId: string, studentId?: string) {
  const supabase = await createServerClient();

  let query = supabase
    .from("milestones")
    .select("*")
    .eq("project_id", projectId);

  if (studentId) {
    query = query.eq("student_id", studentId);
  }

  const { data: milestones, error } = await query.order("due_date", { ascending: true });

  if (error) {
    console.error("Error al obtener hitos:", error);
    return { success: false, error: error.message };
  }

  return { success: true, milestones: milestones as MilestoneRow[] };
}

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

export async function createMilestone(
  projectId: string,
  studentId: string,
  title: string,
  description: string,
  dueDate: string
) {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autorizado" };

  if (!title.trim()) {
    return { success: false, error: "El título del hito es obligatorio." };
  }

  if (!studentId) {
    return { success: false, error: "Debes seleccionar un estudiante." };
  }

  const { data, error } = await supabase
    .from("milestones")
    .insert({
      project_id: projectId,
      student_id: studentId,
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
