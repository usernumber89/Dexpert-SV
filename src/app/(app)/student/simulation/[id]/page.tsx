import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { SimulationWorkspace } from "@/features/simulation/components/SimulationWorkspace";

export default async function SimulationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: session } = await supabase
    .from("simulation_sessions")
    .select("*, scenario:simulation_scenarios(*)")
    .eq("id", id)
    .single();

  if (!session) notFound();

  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!student || session.student_id !== student.id) redirect("/student/simulation");

  const scenario = session.scenario;

  const { data: firstMessage } = await supabase
    .from("simulation_messages")
    .select("content")
    .eq("session_id", id)
    .eq("role", "assistant")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return (
    <SimulationWorkspace
      session={session}
      scenario={{
        clientName: scenario.client_name,
        client_personality: scenario.client_personality,
        title: scenario.title,
        brief: session.brief,
        objectives: session.objectives || [],
        constraints: session.constraints || [],
        skillsRequired: scenario.skills_required || [],
        estimatedDays: scenario.estimated_days,
      }}
      welcomeMessage={firstMessage?.content || `¡Hola! Soy ${scenario.client_name}. Cuéntame, ¿estás listo para trabajar en mi proyecto?`}
    />
  );
}
