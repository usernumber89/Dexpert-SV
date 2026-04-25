import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ProjectDetail } from "@/features/student/components/ProjectDetail";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: project } = await supabase
    .from("projects")
    .select("*, pyme:pymes(company_name, description, logo_url)")
    .eq("id", id)
    .single();

  if (!project) notFound();

  const { data: student } = await supabase
    .from("students")
    .select("id, skills")
    .eq("user_id", user.id)
    .maybeSingle();

  let hasApplied = false;
  if (student) {
    const { data: existing } = await supabase
      .from("applications")
      .select("id")
      .eq("student_id", student.id)
      .eq("project_id", id)
      .maybeSingle();
    hasApplied = !!existing;
  }

  return (
    <ProjectDetail
      project={project}
      hasApplied={hasApplied}
      studentId={student?.id ?? null}
      studentSkills={student?.skills ?? []}
    />
  );
}