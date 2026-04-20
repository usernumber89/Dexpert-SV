import { createClient } from "@/lib/supabase/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("applications")
    .select(`
      *,
      student:students(
        id,
        full_name,
        email,
        education,
        skills,
        linked_in,
        avatar_url
      )
    `)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data ?? []);
}