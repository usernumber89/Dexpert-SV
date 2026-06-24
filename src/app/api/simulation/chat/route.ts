import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { sessionId, message } = await req.json();
    if (!sessionId || !message) {
      return NextResponse.json({ error: "sessionId y message son requeridos" }, { status: 400 });
    }

    const { data: session } = await supabase
      .from("simulation_sessions")
      .select("*, scenario:simulation_scenarios(*)")
      .eq("id", sessionId)
      .single();
    if (!session) return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });

    const scenario = session.scenario;

    const { data: messages } = await supabase
      .from("simulation_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    await supabase.from("simulation_messages").insert({
      session_id: sessionId,
      role: "user",
      content: message,
    });

    const { data: student } = await supabase
      .from("students")
      .select("full_name")
      .eq("user_id", user.id)
      .single();

    const conversationHistory = [
      {
        role: "system",
        content: `Eres ${scenario.client_name}, ${scenario.client_personality}.
Contexto de tu negocio: ${scenario.brief}.
Tus objetivos para este proyecto: ${JSON.stringify(scenario.objectives)}.
Restricciones: ${JSON.stringify(scenario.constraints)}.
Tu objetivo en la conversación: ${scenario.client_goal}.
Eres un cliente real. Responde de forma natural, a veces con preguntas, a veces con dudas, a veces aprobando ideas.
NO rompas el personaje. Responde en español salvadoreño coloquial pero profesional.`,
      },
      ...(messages || []).map((m: any) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    const { text: response } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      maxOutputTokens: 200,
      temperature: 0.7,
      system: conversationHistory[0].content,
      prompt: message,
    });

    await supabase.from("simulation_messages").insert({
      session_id: sessionId,
      role: "assistant",
      content: response,
    });

    const { count } = await supabase
      .from("simulation_messages")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId)
      .eq("role", "user");

    return NextResponse.json({ response, messageCount: count });
  } catch (error) {
    console.error("Error in simulation chat:", error);
    return NextResponse.json({ error: "Error al procesar mensaje" }, { status: 500 });
  }
}
