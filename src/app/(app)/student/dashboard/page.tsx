import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StudentDashboard } from "@/features/student/components/StudentDashboard";

export default async function StudentDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!student) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role === 'PYME') redirect("/onboarding/pyme");
    redirect("/onboarding/student");
  }

  const [{ data: allApplications }, { data: projects }] = await Promise.all([
    supabase
      .from("applications")
      .select("id, status, created_at")
      .eq("student_id", student.id),
    supabase
      .from("projects")
      .select(`*, pyme:pymes(*)`)
      .eq("is_published", true)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const apps = allApplications ?? [];
  const totalApps = apps.length;
  const totalAccepted = apps.filter(a => a.status === "ACCEPTED" || a.status === "COMPLETED").length;
  const totalCompleted = apps.filter(a => a.status === "COMPLETED").length;

  let totalCerts = 0;
  if (apps.length > 0) {
    const { count } = await supabase
      .from("certificates")
      .select("*", { count: "exact", head: true })
      .in("application_id", apps.map(a => a.id));
    totalCerts = count ?? 0;
  }

  const recentAppIds = apps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5).map(a => a.id);

  const { data: recentApplications } = recentAppIds.length > 0
    ? await supabase
        .from("applications")
        .select(`
          *,
          project:projects(
            *,
            pyme:pymes(*)
          ),
          certificates(*)
        `)
        .in("id", recentAppIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <StudentDashboard
      user={{ name: student.full_name ?? user.email ?? "Student", avatarUrl: "" }}
      student={student}
      applications={(recentApplications as any) ?? []}
      projects={projects ?? []}
      serverStats={{
        totalApps,
        totalAccepted,
        totalCompleted,
        totalCerts,
      }}
    />
  );
}
