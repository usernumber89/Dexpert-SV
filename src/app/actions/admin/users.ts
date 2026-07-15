"use server";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function deleteUser(userId: string) {
  const admin = getSupabaseAdmin();

  // 1 — Try the DB function (only works if migration has been run)
  const { error: rpcError } = await admin.rpc("delete_user_cascade", {
    target_user_id: userId,
  });
  if (!rpcError) return { success: true as const };

  // 2 — Fallback: manual cascade via service_role (bypasses RLS)
  const { data: studentRows } = await admin
    .from("students")
    .select("id")
    .eq("user_id", userId);
  const studentId = studentRows?.[0]?.id;

  const { data: pymeRows } = await admin
    .from("pymes")
    .select("id")
    .eq("user_id", userId);
  const pymeId = pymeRows?.[0]?.id;

  try {
    // Delete student-related data
    if (studentId) {
      await admin.from("applications").delete().eq("student_id", studentId);
      await admin.from("saved_students").delete().eq("student_id", studentId);
      await admin.from("premium_features").delete().eq("student_id", studentId);
      await admin.from("professional_levels").delete().eq("student_id", studentId);
      await admin.from("simulation_sessions").delete().eq("student_id", studentId);
      await admin.from("portfolio_links").delete().eq("student_id", studentId);
      await admin.from("portfolio_education").delete().eq("student_id", studentId);
      await admin.from("portfolio_experience").delete().eq("student_id", studentId);
      await admin.from("portfolio_entries").delete().eq("student_id", studentId);
      await admin.from("portfolio_messages").delete().eq("student_id", studentId);
      await admin.from("student_experience").delete().eq("student_id", studentId);
      await admin.from("credit_purchases").delete().eq("student_id", studentId);
      await admin.from("certificates").delete().eq("student_id", studentId);
      await admin.from("evaluations").delete().eq("student_id", studentId);
      await admin.from("experience_levels").delete().eq("student_id", studentId);
      await admin.from("milestones").delete().eq("student_id", studentId);
      await admin.from("students").delete().eq("id", studentId);
    }

    // Delete pyme-related data
    if (pymeId) {
      const { data: projectIds } = await admin
        .from("projects")
        .select("id")
        .eq("pyme_id", pymeId);

      if (projectIds && projectIds.length > 0) {
        const ids = projectIds.map((p: { id: string }) => p.id);
        await admin.from("task_comments").delete().in("task_id", (
          await admin.from("project_tasks").select("id").in("project_id", ids)
        ).data?.map((t: { id: string }) => t.id) ?? []);
        await admin.from("project_tasks").delete().in("project_id", ids);
        await admin.from("task_statuses").delete().in("project_id", ids);
        await admin.from("project_analytics").delete().in("project_id", ids);
        await admin.from("applications").delete().in("project_id", ids);
        await admin.from("projects").delete().in("id", ids);
      }

      await admin.from("saved_students").delete().eq("pyme_id", pymeId);
      await admin.from("premium_features").delete().eq("pyme_id", pymeId);
      await admin.from("pyme_team_members").delete().eq("pyme_id", pymeId);
      await admin.from("pyme_settings").delete().eq("pyme_id", pymeId);
      await admin.from("invoices").delete().eq("pyme_id", pymeId);
      await admin.from("milestones").delete().eq("pyme_id", pymeId);
      await admin.from("pymes").delete().eq("id", pymeId);
    }

    // Delete shared data
    await admin.from("notifications").delete().eq("user_id", userId);
    await admin.from("audit_logs").delete().eq("user_id", userId);
    if (studentId) {
      await admin.from("change_requests").delete().eq("student_id", studentId);
    }

    // Delete profile
    await admin.from("profiles").delete().eq("id", userId);

    // Delete auth user
    const { error: authError } = await admin.auth.admin.deleteUser(userId);
    if (authError) {
      return { success: false as const, error: authError.message };
    }

    return { success: true as const };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Error desconocido al eliminar usuario",
    };
  }
}
