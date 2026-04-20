import { createClient } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select(`*, pyme:pymes(*), applications(*, student:students(*))`)
    .eq("id", id)
    .single();

  if (error) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(data);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await req.json();

  const { data, error } = await supabase
    .from("projects")
    .update({
      title: body.title,
      description: body.description,
      skills: body.skills,
      category: body.category,
      level: body.level,
      is_published: body.isPublished,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}