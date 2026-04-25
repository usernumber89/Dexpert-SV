import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StudentProjects } from "@/features/student/components/StudentProjects";

export default async function StudentProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: student } = await supabase
    .from("students")
    .select("id,skills")
    .eq("user_id", user.id)
    .single();

  const { data: projects } = await supabase
    .from("projects")
    .select("*, pyme:pymes(id, company_name, logo_url)")
    .eq("is_published", true)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const appliedProjectIds: string[] = [];

  if (student) {
    const { data: applications } = await supabase
      .from("applications")
      .select("project_id")
      .eq("student_id", student.id);

    applications?.forEach(a => appliedProjectIds.push(a.project_id));
  }

  return (
    <StudentProjects
      projects={projects ?? []}
      appliedProjectIds={appliedProjectIds}
      studentSkills={student?.skills??[]}
    />
  );
}