import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { PymeApplications } from "@/features/pyme/components/PymeApplications";

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
          avatar_url, verified, education,
          all_apps:applications ( status )
        )
      )
    `)
    .eq("id", id)
    .eq("pyme_id", pyme.id)
    .single();

  if (!project) notFound();

  const projectWithMetrics = {
    ...project,
    applications: (project.applications || []).map((app: any) => {
      const studentData = app.students as any;
      if (studentData) {
        const studentApps = studentData.all_apps || [];
        studentData.total_applications = studentApps.length;
        studentData.accepted_applications = studentApps.filter(
          (a: any) => a.status === "ACCEPTED"
        ).length;
        delete studentData.all_apps;
      }
      return app;
    }),
  };

  return <PymeApplications projects={[projectWithMetrics] as any} />;
}
