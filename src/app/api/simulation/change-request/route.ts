import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { sanitizePrompt } from "@/lib/prompt-sanitizer";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { sessionId: rawSessionId } = await req.json();
    const sessionId = sanitizePrompt(rawSessionId);
    if (!sessionId) return NextResponse.json({ error: "sessionId requerido" }, { status: 400 });

    const { data: session } = await supabase
      .from("simulation_sessions")
      .select("*, scenario:simulation_scenarios(*)")
      .eq("id", sessionId)
      .single();
    if (!session) return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });

    const scenario = session.scenario;

    const { data: messages } = await supabase
      .from("simulation_messages")
      .select("content")
      .eq("session_id", sessionId)
      .eq("role", "user")
      .order("created_at", { ascending: true });

    const lastMessages = messages?.slice(-5).map(m => m.content).join("\n") || "";

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      maxOutputTokens: 300,
      temperature: 0.8,
      system: `Eres ${scenario.client_name}, un cliente contratando un proyecto.
Genera UNA solicitud de cambio realista basada en el progreso del estudiante.
La solicitud debe ser algo que un cliente real pediría: ajuste de diseño, funcionalidad extra, cambio de requisitos, etc.
Debe sentirse natural y justificada dentro del contexto del proyecto.
Responde ÚNICAMENTE con JSON: {"title": "título corto", "description": "descripción detallada de 2-3 oraciones"}`,
      prompt: `El proyecto es: ${scenario.title}. Contexto: ${session.brief}.
Objetivos: ${JSON.stringify(scenario.objectives)}.
Últimos mensajes del estudiante: "${lastMessages}".
Genera un cambio de último minuto que el cliente está solicitando.`,
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid JSON response");

    const changeRequest = JSON.parse(jsonMatch[0]);

    const { data: cr, error } = await supabase
      .from("change_requests")
      .insert({
        session_id: sessionId,
        title: changeRequest.title,
        description: changeRequest.description,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(cr);
  } catch (error) {
    console.error("Error generating change request:", error);
    return NextResponse.json({ error: "Error al generar solicitud de cambio" }, { status: 500 });
  }
}
