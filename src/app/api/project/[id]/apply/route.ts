import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data: student } = await supabase
    .from("students")
    .select("id, full_name")
    .eq("user_id", user.id)
    .single();

  if (!student) return Response.json({ error: "Complete your profile first" }, { status: 404 });

  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("student_id", student.id)
    .eq("project_id", projectId)
    .single();

  if (existing) return Response.json({ error: "Already applied" }, { status: 400 });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: "Server config error" }, { status: 500 });
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabaseAdmin
    .from("applications")
    .insert({ student_id: student.id, project_id: projectId })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Get project info for notification
  const { data: project } = await supabaseAdmin
    .from("projects")
    .select("title, pyme_id, pyme:pymes(user_id)")
    .eq("id", projectId)
    .single();

  if (project) {
    const pymeUserId = (project.pyme as any)?.user_id;
    // Check if pyme wants notifications
    const { data: settings } = await supabaseAdmin
      .from("pyme_settings")
      .select("notify_new_applicants")
      .eq("pyme_id", project.pyme_id)
      .single();

    const shouldNotify = settings ? settings.notify_new_applicants : true;

    if (pymeUserId && shouldNotify) {
      await supabaseAdmin.from("notifications").insert({
        user_id: pymeUserId,
        title: "Nuevo solicitante",
        message: `${student.full_name || "Un estudiante"} se ha postulado a "${project.title}"`,
        type: "info",
        link: "/pyme/applications",
      });
    }
  }

  revalidatePath('/student/dashboard');
  revalidatePath('/pyme/applications');
  revalidatePath(`/pyme/projects/${projectId}/applications`);

  return Response.json(data);
}