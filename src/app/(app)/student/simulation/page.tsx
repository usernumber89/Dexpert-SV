import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SimulationHub } from "@/features/simulation/components/SimulationHub";
import { getScenariosByArea, getStudentSessions } from "@/app/actions/simulation";

export default async function SimulationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const scenarios = await getScenariosByArea();
  const sessions = await getStudentSessions();

  return <SimulationHub initialScenarios={scenarios} />;
}
