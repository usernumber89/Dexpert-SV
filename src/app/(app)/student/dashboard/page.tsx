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
    .single();

  if (!student) redirect("/onboarding/student");

  const { data: applications } = await supabase
    .from("applications")
    .select(`*, project:projects(*, pyme:pymes(*))`)
    .eq("student_id", student.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: projects } = await supabase
    .from("projects")
    .select(`*, pyme:pymes(*)`)
    .eq("is_published", true)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <StudentDashboard
      user={{ name: student.full_name ?? user.email ?? "Student", imageUrl: "" }}
      student={student}
      applications={applications ?? []}
      projects={projects ?? []}
    />
  );
}