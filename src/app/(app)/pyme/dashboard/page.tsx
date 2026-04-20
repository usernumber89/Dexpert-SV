import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PymeDashboard } from "@/features/pyme/components/PymeDashboard";

export default async function PymeDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: pyme } = await supabase
    .from("pymes")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!pyme) redirect("/onboarding/pyme");

  const { data: projects } = await supabase
    .from("projects")
    .select(`*, applications(*, student:students(*))`)
    .eq("pyme_id", pyme.id)
    .order("created_at", { ascending: false });

  return (
    <PymeDashboard
      user={{ name: user.email?.split("@")[0] ?? "Business", avatarUrl: null }}
      pyme={pyme}
      projects={projects ?? []}
    />
  );
}