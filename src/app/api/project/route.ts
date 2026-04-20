import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectName, description, skills, category, level } = await req.json();

  const { data: pyme } = await supabase
    .from("pymes")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!pyme) return Response.json({ error: "Pyme not found" }, { status: 404 });

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      pyme_id: pyme.id,
      title: projectName,
      description,
      skills,
      category,
      level,
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(project);
}

export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const level = searchParams.get("level");

  let query = supabase
    .from("projects")
    .select(`*, pyme:pymes(*)`)
    .eq("is_published", true)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (category) query = query.eq("category", category);
  if (level) query = query.eq("level", level);

  const { data } = await query;
  return Response.json(data ?? []);
}