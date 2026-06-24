import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { data: student } = await supabase
      .from("students")
      .select("id, full_name, skills")
      .eq("user_id", user.id)
      .single();
    if (!student) return NextResponse.json({ error: "Perfil de estudiante no encontrado" }, { status: 404 });

    const { scenarioId } = await req.json();
    if (!scenarioId) return NextResponse.json({ error: "Se requiere scenarioId" }, { status: 400 });

    const { data: scenario } = await supabase
      .from("simulation_scenarios")
      .select("*")
      .eq("id", scenarioId)
      .single();
    if (!scenario) return NextResponse.json({ error: "Escenario no encontrado" }, { status: 404 });

    const { text: welcomeMessage } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      maxOutputTokens: 200,
      temperature: 0.7,
      system: `Eres ${scenario.client_name}, ${scenario.client_personality}.
Tu negocio: ${scenario.brief}.
Tu objetivo en esta conversación: ${scenario.client_goal}.
Hablas de forma natural, como una persona real. NO rompas el personaje. Responde en español.`,
      prompt: `Eres el cliente. El estudiante ${student.full_name} acaba de llegar para hablar sobre tu proyecto. Preséntate brevemente, explica tu situación y lo que necesitas. Pregúntale si está listo para empezar. Máximo 4 oraciones.`,
    });

    const { data: session, error } = await supabase
      .from("simulation_sessions")
      .insert({
        student_id: student.id,
        scenario_id: scenarioId,
        brief: scenario.brief,
        objectives: scenario.objectives,
        constraints: scenario.constraints,
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from("simulation_messages").insert([
      { session_id: session.id, role: "assistant", content: welcomeMessage },
    ]);

    return NextResponse.json({
      session,
      scenario: {
        clientName: scenario.client_name,
        title: scenario.title,
        brief: scenario.brief,
        objectives: scenario.objectives,
        constraints: scenario.constraints,
        skillsRequired: scenario.skills_required,
        estimatedDays: scenario.estimated_days,
      },
      welcomeMessage,
    });
  } catch (error) {
    console.error("Error starting simulation:", error);
    return NextResponse.json({ error: "Error al iniciar simulación" }, { status: 500 });
  }
}
