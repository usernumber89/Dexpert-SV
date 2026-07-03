import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StudentProjects } from "@/features/student/components/StudentProjects";

export default async function StudentProjectsPage(props: { searchParams?: Promise<{ pyme?: string }> }) {
  const searchParams = await props.searchParams;
  const pymeFilter = searchParams?.pyme;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: student } = await supabase
    .from("students")
    .select("id,skills")
    .eq("user_id", user.id)
    .single();

  let query = supabase
    .from("projects")
    .select("*, pyme:pymes(id, company_name, logo_url)")
    .eq("is_published", true)
    .eq("status", "active");

  if (pymeFilter) {
    query = query.eq("pyme_id", pymeFilter);
  }

  const { data: projects } = await query
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  let pymeName = "";
  if (pymeFilter && projects && projects.length > 0) {
    pymeName = projects[0].pyme?.company_name || "";
  }

  const appliedProjectIds: Record<string, string> = {};

  if (student) {
    const { data: applications } = await supabase
      .from("applications")
      .select("project_id, status")
      .eq("student_id", student.id);

    applications?.forEach(a => { appliedProjectIds[a.project_id] = a.status; });
  }

  return (
    <StudentProjects
      projects={projects ?? []}
      appliedProjectIds={appliedProjectIds}
      studentSkills={student?.skills??[]}
      pymeFilter={pymeFilter}
      pymeName={pymeName}
    />
  );
}