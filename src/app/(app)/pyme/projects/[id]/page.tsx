import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { PymeProjectDetail } from "@/features/pyme/components/PymeProjectDetail";

export default async function PymeProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: project } = await supabase
    .from("projects")
    .select(`
      *,
      pyme:pymes(*),
      applications(
        *,
        student:students(*)
      )
    `)
    .eq("id", id)
    .single();

  if (!project) notFound();

  return <PymeProjectDetail project={project} />;
}