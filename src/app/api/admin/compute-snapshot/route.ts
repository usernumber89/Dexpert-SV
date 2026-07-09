import { NextResponse } from "next/server";
import { getAdminClientWithAudit } from "@/lib/admin-auth";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST() {
  const { client: supabase, error, user } = await getAdminClientWithAudit("admin_compute_snapshot");
  if (error) return error;

  try {
    const today = new Date().toISOString().split("T")[0];
    const now = new Date();

    const [{ count: totalStudents }, { count: totalPymes }, { count: totalProjects }, { data: allProjects }, { data: allInvoices }, { data: todayProfiles }] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "STUDENT"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "PYME"),
      supabase.from("projects").select("*", { count: "exact", head: true }),
      supabase.from("projects").select("status, created_at, updated_at"),
      supabase.from("invoices").select("amount, created_at, status"),
      supabase.from("profiles").select("created_at").gte("created_at", `${today}T00:00:00Z`),
    ]);

    const projectList = (allProjects || []) as { status: string; created_at: string; updated_at?: string }[];
    const activeProjects = projectList.filter(p => ["active", "open", "in_progress"].includes(p.status)).length;
    const completedProjects = projectList.filter(p => p.status === "completed");

    const paidInvoices = ((allInvoices || []) as { amount: number; created_at: string; status: string }[])
      .filter(i => i.status === "paid");
    const totalRevenue = paidInvoices.reduce((s, i) => s + Number(i.amount), 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const mrr = paidInvoices
      .filter(i => i.created_at >= monthStart)
      .reduce((s, i) => s + Number(i.amount), 0);

    const newSignups = ((todayProfiles || []) as { created_at: string }[]).length;
    const transactionsToday = paidInvoices.filter(i => i.created_at.startsWith(today)).length;

    const conversionRate = (totalPymes ?? 0) > 0
      ? Math.round(((totalProjects ?? 0) / (totalPymes ?? 1)) * 100 * 100) / 100
      : 0;

    const pymesWithMultipleProjects = new Set(
      projectList.filter(p => p.status === "completed").map(p => (p as any).pyme_id)
    ).size;
    const retentionRate = totalPymes && totalPymes > 0
      ? Math.round((pymesWithMultipleProjects / totalPymes) * 100 * 100) / 100
      : 0;

    const avgCompletionDays = completedProjects.length > 0
      ? Math.round(
          completedProjects.reduce((s, p) => {
            const start = new Date(p.created_at);
            const end = p.updated_at ? new Date(p.updated_at) : new Date();
            return s + (end.getTime() - start.getTime()) / 86400000;
          }, 0) / completedProjects.length * 10
        ) / 10
      : null;

    const snapshot = {
      snapshot_date: today,
      total_students: totalStudents || 0,
      total_pymes: totalPymes || 0,
      total_projects: totalProjects || 0,
      active_projects: activeProjects,
      total_revenue: totalRevenue,
      mrr,
      new_signups: newSignups,
      transactions_count: transactionsToday,
      conversion_rate: conversionRate,
      retention_rate: retentionRate,
      avg_project_completion_days: avgCompletionDays,
      platform_uptime: 99.9,
    };

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: existing } = await admin
      .from("daily_snapshots")
      .select("id")
      .eq("snapshot_date", today)
      .maybeSingle();

    if (existing) {
      await admin.from("daily_snapshots").update(snapshot).eq("snapshot_date", today);
    } else {
      await admin.from("daily_snapshots").insert(snapshot);
    }

    return NextResponse.json({ success: true, snapshot, user: user.id });
  } catch (err) {
    console.error("Error computing snapshot:", err);
    return NextResponse.json({ error: "Error al computar snapshot" }, { status: 500 });
  }
}
