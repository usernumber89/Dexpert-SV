import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; appId: string }> }
) {
  const { appId } = await params;
  const supabase = await createClient();
  const { status } = await req.json();

  const { data, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", appId)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  revalidatePath('/student/dashboard');
  revalidatePath('/student/profile');
  revalidatePath('/pyme/applications');
  revalidatePath('/pyme/dashboard');

  return Response.json(data);
}