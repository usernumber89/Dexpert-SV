import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

const supabaseAdmin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

  // Verificar créditos disponibles
  const { data: credits } = await supabase
    .from("pyme_credits")
    .select("credits_available, credits_used")
    .eq("pyme_id", pyme.id)
    .maybeSingle();

  if (!credits || credits.credits_available <= 0) {
    return Response.json(
      { error: "No credits available. Please purchase a plan.", noCredits: true },
      { status: 402 }
    );
  }

  // Crear el proyecto
  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      pyme_id: pyme.id,
      title: projectName,
      description,
      skills,
      category,
      level,
      is_published: true, // Se publica directamente al gastar el crédito
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Descontar el crédito
  await supabaseAdmin
    .from("pyme_credits")
    .update({
      credits_available: credits.credits_available - 1,
      credits_used: credits.credits_used + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("pyme_id", pyme.id);

  return Response.json(project);
}