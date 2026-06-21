import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getActiveProjectsWithMilestones } from "@/app/actions/active-projects";
import ActiveProjectsHub from "@/components/shared/ActiveProjectsHub";

export default async function PymeInProgressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: pyme } = await supabase
    .from("pymes")
    .select("id, company_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!pyme) redirect("/onboarding/pyme");

  const projects = await getActiveProjectsWithMilestones("PYME");

  return (
    <ActiveProjectsHub
      initialProjects={projects}
      role="PYME"
      userName={pyme.company_name ?? user.email ?? "PYME"}
    />
  );
}
