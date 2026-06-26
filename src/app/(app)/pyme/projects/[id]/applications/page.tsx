import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { PymeApplications } from "@/features/pyme/components/PymeApplications";
import { getStudentAcceptanceCounts } from "@/app/actions/pyme/premium";

export default async function PymeProjectApplicationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: pyme } = await supabase
    .from("pymes")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!pyme) redirect("/onboarding/pyme");

  const { data: project } = await supabase
    .from("projects")
    .select(`
      id, title, skills, status, is_published, created_at,
      applications(
        id, status, created_at,
        students(
          id, full_name, email, phone, location, bio,
          university, major, graduation_year,
          skills, linkedin, github, portfolio, resume_url,
          avatar_url, verified, education
        )
      )
    `)
    .eq("id", id)
    .eq("pyme_id", pyme.id)
    .single();

  if (!project) notFound();

  const studentIds = (project.applications || [])
    .map((app: any) => app.students?.id)
    .filter(Boolean);
  const acceptanceCounts = await getStudentAcceptanceCounts(studentIds);

  const projectWithMetrics = {
    ...project,
    applications: (project.applications || []).map((app: any) => {
      const studentData = app.students as any;
      if (studentData) {
        const counts = acceptanceCounts[studentData.id];
        studentData.total_applications = counts?.total ?? 0;
        studentData.accepted_applications = counts?.accepted ?? 0;
      }
      return app;
    }),
  };

  return <PymeApplications projects={[projectWithMetrics] as any} />;
}
