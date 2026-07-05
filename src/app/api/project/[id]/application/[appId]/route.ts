import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/app/actions/notifications";
import { revalidatePath } from "next/cache";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; appId: string }> }
) {
  const { id: projectId, appId } = await params;
  const supabase = await createClient();
  const { status } = await req.json();

  const { data, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", appId)
    .select("id, student_id, project_id")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  if (data && (status === "ACCEPTED" || status === "REJECTED")) {
    const [studentResult, projectResult] = await Promise.all([
      supabase.from("students").select("user_id").eq("id", data.student_id).single(),
      supabase.from("projects").select("title").eq("id", projectId).single(),
    ]);

    const studentUserId = studentResult.data?.user_id;
    const projectTitle = projectResult.data?.title || "un proyecto";

    if (studentUserId) {
      createNotification({
        userId: studentUserId,
        title: status === "ACCEPTED" ? "Solicitud aceptada" : "Solicitud rechazada",
        message: status === "ACCEPTED"
          ? `Tu solicitud para "${projectTitle}" ha sido aceptada`
          : `Tu solicitud para "${projectTitle}" no fue seleccionada`,
        type: status === "ACCEPTED" ? "success" : "error",
        link: "/student/profile",
      }).catch((err) => console.error("Error creating notification:", err));
    }
  }

  revalidatePath('/student/dashboard');
  revalidatePath('/student/profile');
  revalidatePath('/pyme/applications');
  revalidatePath('/pyme/dashboard');
  revalidatePath(`/pyme/projects/${projectId}`);
  revalidatePath(`/pyme/projects/${projectId}/applications`);

  return Response.json(data);
}