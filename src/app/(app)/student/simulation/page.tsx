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

  const { data: evaluations } = await supabase
    .from("evaluations")
    .select("session_id, overall_score")
    .in("session_id", sessions.map(s => s.id));

  const evaluationMap: Record<string, number> = {};
  evaluations?.forEach(e => {
    evaluationMap[e.session_id] = e.overall_score;
  });

  return (
    <SimulationHub
      initialScenarios={scenarios}
      initialSessions={sessions}
      evaluationScores={evaluationMap}
    />
  );
}
