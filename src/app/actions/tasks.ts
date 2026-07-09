"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type TaskStatus = {
  id: string;
  project_id: string;
  name: string;
  color: string;
  position: number;
};

export type Task = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status_id: string;
  priority: "low" | "medium" | "high" | "urgent";
  assigned_to: string | null;
  created_by: string;
  due_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  assignee?: { id: string; full_name: string; avatar_url?: string | null } | null;
  creator?: { id: string; full_name: string } | null;
};

export type TaskComment = {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: { full_name: string; avatar_url?: string | null } | null;
};

type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

function isProjectParticipant(
  role: "STUDENT" | "PYME",
  projectId: string,
  supabase: Awaited<ReturnType<typeof createServerClient>>
): Promise<boolean> {
  return role === "PYME"
    ? checkPymeProjectOwner(projectId, supabase)
    : checkStudentAccepted(projectId, supabase);
}

async function checkPymeProjectOwner(
  projectId: string,
  supabase: Awaited<ReturnType<typeof createServerClient>>
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("pyme_id", (await supabase.from("pymes").select("id").eq("user_id", user.id).maybeSingle()).data?.id)
    .maybeSingle();

  return !!data;
}

async function checkStudentAccepted(
  projectId: string,
  supabase: Awaited<ReturnType<typeof createServerClient>>
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!student) return false;

  const { data } = await supabase
    .from("applications")
    .select("id")
    .eq("project_id", projectId)
    .eq("student_id", student.id)
    .in("status", ["ACCEPTED", "COMPLETED"])
    .maybeSingle();

  return !!data;
}

export async function getProjectTaskStatuses(projectId: string): Promise<ActionResult<TaskStatus[]>> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autorizado" };

  const { data, error } = await supabase
    .from("task_statuses")
    .select("*")
    .eq("project_id", projectId)
    .order("position", { ascending: true });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as TaskStatus[] };
}

export async function getProjectTasks(projectId: string): Promise<ActionResult<Task[]>> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autorizado" };

  const { data, error } = await supabase
    .from("project_tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("position", { ascending: true });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as unknown as Task[] };
}

export async function getProjectParticipants(projectId: string): Promise<ActionResult<{ id: string; full_name: string; avatar_url?: string | null; role: string }[]>> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autorizado" };

  const { data: project } = await supabase
    .from("projects")
    .select("pyme_id")
    .eq("id", projectId)
    .single();

  if (!project) return { success: false, error: "Proyecto no encontrado" };

  const participants: { id: string; full_name: string; avatar_url?: string | null; role: string }[] = [];

  const { data: pyme } = await supabase
    .from("pymes")
    .select("user_id, company_name")
    .eq("id", project.pyme_id)
    .single();

  if (pyme) {
    const { data: pymeProfile } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .eq("id", pyme.user_id)
      .maybeSingle();

    if (pymeProfile) {
      participants.push({ ...pymeProfile, role: "PYME" });
    }
  }

  const { data: applications } = await supabase
    .from("applications")
    .select("student:students(user_id, full_name, avatar_url)")
    .eq("project_id", projectId)
    .in("status", ["ACCEPTED", "COMPLETED"]);

  for (const app of applications ?? []) {
    const student = Array.isArray(app.student) ? app.student[0] : app.student;
    if (student) {
      participants.push({ id: student.user_id, full_name: student.full_name, avatar_url: student.avatar_url, role: "STUDENT" });
    }
  }

  return { success: true, data: participants };
}

type CreateTaskInput = {
  title: string;
  description?: string;
  status_id: string;
  priority?: "low" | "medium" | "high" | "urgent";
  assigned_to?: string;
  due_date?: string;
};

export async function createTask(
  projectId: string,
  input: CreateTaskInput
): Promise<ActionResult<Task>> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autorizado" };

  if (!input.title?.trim()) {
    return { success: false, error: "El título de la tarea es obligatorio" };
  }

  const { data: maxPos } = await supabase
    .from("project_tasks")
    .select("position")
    .eq("project_id", projectId)
    .eq("status_id", input.status_id)
    .order("position", { ascending: false })
    .limit(1);

  const nextPosition = (maxPos && maxPos.length > 0 ? maxPos[0].position : -1) + 1;

  const { data, error } = await supabase
    .from("project_tasks")
    .insert({
      project_id: projectId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      status_id: input.status_id,
      priority: input.priority ?? "medium",
      assigned_to: input.assigned_to || null,
      created_by: user.id,
      due_date: input.due_date || null,
      position: nextPosition,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  if (!data) return { success: false, error: "No se pudo crear la tarea" };

  revalidatePath("/student/in-progress");
  revalidatePath("/pyme/in-progress");

  return { success: true, data: data as unknown as Task };
}

type UpdateTaskInput = Partial<{
  title: string;
  description: string | null;
  status_id: string;
  priority: "low" | "medium" | "high" | "urgent";
  assigned_to: string | null;
  due_date: string | null;
  position: number;
}>;

export async function updateTask(
  taskId: string,
  input: UpdateTaskInput
): Promise<ActionResult<Task>> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autorizado" };

  if (input.title !== undefined && !input.title?.trim()) {
    return { success: false, error: "El título de la tarea no puede estar vacío" };
  }

  const updates: Record<string, unknown> = {};
  if (input.title !== undefined) updates.title = input.title.trim();
  if (input.description !== undefined) updates.description = input.description?.trim() || null;
  if (input.status_id !== undefined) updates.status_id = input.status_id;
  if (input.priority !== undefined) updates.priority = input.priority;
  if (input.assigned_to !== undefined) updates.assigned_to = input.assigned_to;
  if (input.due_date !== undefined) updates.due_date = input.due_date;
  if (input.position !== undefined) updates.position = input.position;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("project_tasks")
    .update(updates)
    .eq("id", taskId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/student/in-progress");
  revalidatePath("/pyme/in-progress");

  return { success: true, data: data as unknown as Task };
}

export async function reorderTask(
  taskId: string,
  newStatusId: string,
  newPosition: number
): Promise<ActionResult<void>> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autorizado" };

  const { error } = await supabase
    .from("project_tasks")
    .update({
      status_id: newStatusId,
      position: newPosition,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId);

  if (error) return { success: false, error: error.message };

  return { success: true };
}

export async function deleteTask(taskId: string): Promise<ActionResult<void>> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autorizado" };

  const { data: task } = await supabase
    .from("project_tasks")
    .select("created_by, project_id")
    .eq("id", taskId)
    .single();

  if (!task) return { success: false, error: "Tarea no encontrada" };

  const isOwner = task.created_by === user.id;
  const isPymeOwner = await checkPymeProjectOwner(task.project_id, supabase);

  if (!isOwner && !isPymeOwner) {
    return { success: false, error: "No tienes permiso para eliminar esta tarea" };
  }

  const { error } = await supabase
    .from("project_tasks")
    .delete()
    .eq("id", taskId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/student/in-progress");
  revalidatePath("/pyme/in-progress");

  return { success: true };
}

// ---- Comments ----

export async function getTaskComments(taskId: string): Promise<ActionResult<TaskComment[]>> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autorizado" };

  const { data, error } = await supabase
    .from("task_comments")
    .select(`
      *,
      user:profiles (full_name, avatar_url)
    `)
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as unknown as TaskComment[] };
}

export async function addComment(
  taskId: string,
  content: string
): Promise<ActionResult<TaskComment>> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autorizado" };

  if (!content?.trim()) {
    return { success: false, error: "El comentario no puede estar vacío" };
  }

  const { data, error } = await supabase
    .from("task_comments")
    .insert({
      task_id: taskId,
      user_id: user.id,
      content: content.trim(),
    })
    .select(`
      *,
      user:profiles (full_name, avatar_url)
    `)
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as unknown as TaskComment };
}

export async function deleteComment(commentId: string): Promise<ActionResult<void>> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autorizado" };

  const { data: comment } = await supabase
    .from("task_comments")
    .select("user_id")
    .eq("id", commentId)
    .single();

  if (!comment) return { success: false, error: "Comentario no encontrado" };
  if (comment.user_id !== user.id) return { success: false, error: "No puedes eliminar comentarios de otros usuarios" };

  const { error } = await supabase
    .from("task_comments")
    .delete()
    .eq("id", commentId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
