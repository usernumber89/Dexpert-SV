import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
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

  if (data && (status === "ACCEPTED" || status === "REJECTED") && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const [studentResult, projectResult] = await Promise.all([
      supabaseAdmin.from("students").select("user_id").eq("id", data.student_id).single(),
      supabaseAdmin.from("projects").select("title").eq("id", projectId).single(),
    ]);

    const studentUserId = studentResult.data?.user_id;
    const projectTitle = projectResult.data?.title || "un proyecto";

    if (studentUserId) {
      await supabaseAdmin.from("notifications").insert({
        user_id: studentUserId,
        title: status === "ACCEPTED" ? "Solicitud aceptada" : "Solicitud rechazada",
        message: status === "ACCEPTED"
          ? `Tu solicitud para "${projectTitle}" ha sido aceptada`
          : `Tu solicitud para "${projectTitle}" no fue seleccionada`,
        type: status === "ACCEPTED" ? "success" : "error",
        link: "/student/profile",
      });
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