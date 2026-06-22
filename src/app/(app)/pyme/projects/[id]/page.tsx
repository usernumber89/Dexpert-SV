import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { PymeProjectDetail } from "@/features/pyme/components/PymeProjectDetail";
// 🛠️ IMPORTS DEL TRACKER
import { getMilestones } from "@/app/actions/milestones";
import MilestoneTracker from "@/components/shared/MilestoneTracker";

export default async function PymeProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // 2. Traer detalles del proyecto, aplicaciones y perfiles de alumnos
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

  // 3. Transformar los datos del proyecto individual (Métricas del estudiante)
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

  // 4. 🛠️ LÓGICA DE CONTROL: Verificar si el proyecto ya tiene un estudiante asignado
  const hasAcceptedStudent = project.applications?.some(
    (app: any) => app.status === "ACCEPTED" || app.status === "COMPLETED"
  );

  // 5. 🛠️ Obtener todos los estudiantes aceptados
  const acceptedApps = hasAcceptedStudent
    ? project.applications?.filter(
        (app: any) => app.status === "ACCEPTED" || app.status === "COMPLETED"
      ) || []
    : [];
  const acceptedStudents = acceptedApps.map((app: any) => {
    const s = app.students || app.student || null;
    return s ? { id: s.id, full_name: s.full_name ?? "", avatar_url: s.avatar_url } : null;
  }).filter(Boolean);
  const firstStudent = acceptedStudents[0] || null;

  // 6. 🛠️ Traer los hitos solo si hay un desarrollo activo
  let milestonesData: any[] = [];
  if (hasAcceptedStudent) {
    const { milestones } = await getMilestones(id);
    milestonesData = milestones || [];
  }

  return (
    <>
      <PymeProjectDetail project={project} />
      
      {/* 🛠️ Renderizado condicional del Tracker para la PYME */}
      {hasAcceptedStudent && (
        <div className="bg-surface-raised px-4 pb-12">
          <div className="max-w-3xl mx-auto pt-8">
            <MilestoneTracker
              projectId={id}
              initialMilestones={milestonesData}
              role="PYME"
              studentAvatarUrl={firstStudent?.avatar_url}
              studentName={firstStudent?.full_name}
              students={acceptedStudents}
            />
          </div>
        </div>
      )}
    </>
  );
}