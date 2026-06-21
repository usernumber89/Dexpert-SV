import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getActiveProjectsWithMilestones } from "@/app/actions/active-projects";
import ActiveProjectsHub from "@/components/shared/ActiveProjectsHub";

export default async function StudentInProgressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: student } = await supabase
    .from("students")
    .select("id, full_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!student) redirect("/onboarding/student");

  const projects = await getActiveProjectsWithMilestones("STUDENT");

  return (
    <ActiveProjectsHub
      initialProjects={projects}
      role="STUDENT"
      userName={student.full_name ?? user.email ?? "Estudiante"}
    />
  );
}
