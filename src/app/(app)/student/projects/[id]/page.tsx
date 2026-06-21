import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ProjectDetail } from "@/features/student/components/ProjectDetail";
import { getMilestones } from "@/app/actions/milestones";
import MilestoneTracker from "@/components/shared/MilestoneTracker";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // 🔑 Extraemos el ID una sola vez aquí
  const supabase = await createClient();

  // 1. Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // 2. Traer detalles del proyecto y de la PYME
  const { data: project } = await supabase
    .from("projects")
    .select("*, pyme:pymes(company_name, description, logo_url)")
    .eq("id", id)
    .single();

  if (!project) notFound();

  // 3. Traer el perfil del estudiante actual
  const { data: student } = await supabase
    .from("students")
    .select("id, skills")
    .eq("user_id", user.id)
    .maybeSingle();

  let hasApplied = false;
  let isAcceptedStudent = false;

  // 4. Verificar si el alumno aplicó y cuál es su estado en este proyecto
  if (student) {
    const { data: application } = await supabase
      .from("applications")
      .select("id, status") // 🛠️ Traemos también el status
      .eq("student_id", student.id)
      .eq("project_id", id)
      .maybeSingle();
    
    hasApplied = !!application;
    
    // El estudiante está asignado activamente si está ACCEPTED o COMPLETED
    isAcceptedStudent = application?.status === "ACCEPTED" || application?.status === "COMPLETED";
  }

  // 5. Traer los hitos si el estudiante es el dueño del proyecto en desarrollo
  let milestonesData = [];
  if (isAcceptedStudent) {
    const { milestones } = await getMilestones(id);
    milestonesData = milestones || [];
  }

  return (
    <>
      <ProjectDetail
        project={project}
        hasApplied={hasApplied}
        studentId={student?.id ?? null}
        studentSkills={student?.skills ?? []}
      />
      
      {/* 🛠️ Solo mostramos el tracker si el alumno es quien realmente está desarrollando el proyecto */}
      {isAcceptedStudent && (
        <div className="bg-surface-raised px-4 pb-12">
          <div className="max-w-2xl mx-auto pt-8">
            <MilestoneTracker
              projectId={id}
              initialMilestones={milestonesData}
              role="STUDENT"
            />
          </div>
        </div>
      )}
    </>
  );
}