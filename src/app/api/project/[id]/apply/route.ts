import { createClient } from "@/lib/supabase/server";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data: student } = await supabase
    .from("students")
    .select("id")
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

  const { data, error } = await supabase
    .from("applications")
    .insert({ student_id: student.id, project_id: projectId })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}