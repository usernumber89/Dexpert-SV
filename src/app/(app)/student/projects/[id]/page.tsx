import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ProjectDetail } from "@/features/student/components/ProjectDetail";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: project } = await supabase
    .from("projects")
    .select("*, pyme:pymes(*)")
    .eq("id", id)
    .single();

  if (!project) notFound();

  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("user_id", user.id)
    .single();

  let hasApplied = false;
  if (student) {
    const { data: existing } = await supabase
      .from("applications")
      .select("id")
      .eq("student_id", student.id)
      .eq("project_id", id)
      .single();

    hasApplied = !!existing;
  }

  return (
    <ProjectDetail
      project={project}
      hasApplied={hasApplied}
      studentId={student?.id ?? null}
    />
  );
}