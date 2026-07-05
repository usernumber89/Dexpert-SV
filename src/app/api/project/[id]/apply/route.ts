import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createNotification } from "@/app/actions/notifications";
import { revalidatePath } from "next/cache";

function extractRelation<T>(rel: T | T[] | null | undefined): T | null {
  if (Array.isArray(rel)) return rel[0] ?? null;
  return rel ?? null;
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const [studentResult, existingResult] = await Promise.all([
    supabase.from("students").select("id, full_name").eq("user_id", user.id).maybeSingle(),
    supabase.from("applications").select("id").eq("student_id", user.id).eq("project_id", projectId).maybeSingle(),
  ]);

  if (!studentResult.data) return Response.json({ error: "Complete your profile first" }, { status: 404 });
  if (existingResult.data) return Response.json({ error: "Already applied" }, { status: 400 });

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabaseAdmin
    .from("applications")
    .insert({ student_id: studentResult.data.id, project_id: projectId })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const { data: project } = await supabaseAdmin
    .from("projects")
    .select("title, pyme_id, pyme:pymes(user_id)")
    .eq("id", projectId)
    .maybeSingle();

  if (project) {
    const pyme = extractRelation(project.pyme as any);
    const pymeUserId = pyme?.user_id;

    const { data: settings } = await supabaseAdmin
      .from("pyme_settings")
      .select("notify_new_applicants")
      .eq("pyme_id", project.pyme_id)
      .maybeSingle();

    const shouldNotify = settings ? settings.notify_new_applicants : true;

    if (pymeUserId && shouldNotify) {
      createNotification({
        userId: pymeUserId,
        title: "Nuevo solicitante",
        message: `${studentResult.data.full_name || "Un estudiante"} se ha postulado a "${project.title}"`,
        type: "info",
        link: "/pyme/applications",
      }).catch((err) => console.error("Error creating notification:", err));
    }
  }

  revalidatePath('/student/dashboard');
  revalidatePath('/pyme/applications');
  revalidatePath(`/pyme/projects/${projectId}/applications`);

  return Response.json(data);
}