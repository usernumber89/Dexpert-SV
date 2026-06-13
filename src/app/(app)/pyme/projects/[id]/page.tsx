import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { PymeProjectDetail } from "@/features/pyme/components/PymeProjectDetail";

export default async function PymeProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: project } = await supabase
    .from("projects")
    .select(
      `
      *,
      pyme:pymes(*),
      applications(
        *,
        students(
          id,
          full_name,
          email,
          education,
          skills,
          phone,
          location,
          bio,
          university,
          major,
          graduation_year,
          linkedin,
          github,
          portfolio,
          resume_url,
          avatar_url,
          verified,
          all_apps:applications ( status )
        )
      )
    `
    )
    .eq("id", id)
    .single();

  if (!project) notFound();

  // Transformar los datos del proyecto individual
  if (project.applications) {
    project.applications = project.applications.map((app: any) => {
      const studentData = app.students;
      
      if (studentData) {
        const studentApps = studentData.all_apps || [];
        studentData.total_applications = studentApps.length;
        studentData.accepted_applications = studentApps.filter(
          (a: any) => a.status === 'ACCEPTED'
        ).length;
        
        // Limpiamos la propiedad temporal
        delete studentData.all_apps;
      }
      return app;
    });
  }

  return <PymeProjectDetail project={project} />;
}