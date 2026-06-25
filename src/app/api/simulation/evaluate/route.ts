import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";

const EvaluationSchema = z.object({
  overall_score: z.number().min(0).max(100),
  rubric: z.array(z.object({
    criterion: z.string(),
    score: z.number().min(0).max(100),
    comment: z.string(),
  })),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  summary: z.string(),
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { sessionId } = await req.json();
    if (!sessionId) return NextResponse.json({ error: "sessionId requerido" }, { status: 400 });

    const { data: session } = await supabase
      .from("simulation_sessions")
      .select("*, scenario:simulation_scenarios(*)")
      .eq("id", sessionId)
      .single();
    if (!session) return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });

    const { data: messages } = await supabase
      .from("simulation_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    const { data: changeRequests } = await supabase
      .from("change_requests")
      .select("*")
      .eq("session_id", sessionId);

    const scenario = session.scenario;
    const conversation = messages?.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join("\n") || "";
    const changes = changeRequests?.map(cr => `- ${cr.title}: ${cr.description} [${cr.status}]`).join("\n") || "Ninguna";

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      maxOutputTokens: 1000,
      temperature: 0.3,
      system: `Eres un evaluador profesional de competencias laborales.
Evalúa el desempeño del estudiante en esta simulación profesional.
Sé objetivo, constructivo y específico.
Responde ÚNICAMENTE con JSON:
{
  "overall_score": 0-100,
  "rubric": [
    {"criterion": "nombre del criterio", "score": 0-100, "comment": "comentario"}
  ],
  "strengths": ["fortaleza 1", "fortaleza 2", ...],
  "improvements": ["mejora 1", "mejora 2", ...],
  "summary": "resumen general de máximo 3 oraciones"
}

Criterios de evaluación:
1. Comprensión del brief y requisitos
2. Comunicación profesional con el cliente
3. Capacidad de negociación y manejo de objeciones
4. Creatividad y propuesta de soluciones
5. Manejo de solicitudes de cambio`,
      prompt: `Área profesional: ${scenario.area}.
Proyecto: ${scenario.title}.
Cliente: ${scenario.client_name} (${scenario.client_personality}).
Brief: ${session.brief}.
Objetivos: ${JSON.stringify(session.objectives)}.
Restricciones: ${JSON.stringify(session.constraints)}.

Conversación completa:
${conversation}

Solicitudes de cambio:
${changes}

Evalúa el desempeño del estudiante.`,
    });

    let parsed;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON block found");
      const cleaned = jsonMatch[0]
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();
      parsed = EvaluationSchema.parse(JSON.parse(cleaned));
    } catch (parseErr) {
      console.error("AI JSON parse error, using fallback evaluation:", parseErr);
      parsed = {
        overall_score: 70,
        rubric: [
          { criterion: "Comprensión del brief", score: 70, comment: "Evaluación automática" },
          { criterion: "Comunicación profesional", score: 70, comment: "Evaluación automática" },
          { criterion: "Capacidad de negociación", score: 70, comment: "Evaluación automática" },
          { criterion: "Creatividad y soluciones", score: 70, comment: "Evaluación automática" },
          { criterion: "Manejo de cambios", score: 70, comment: "Evaluación automática" },
        ],
        strengths: ["Completaste la simulación", "Interactuaste con el cliente"],
        improvements: ["Intenta ser más específico en tus respuestas", "Revisa los requisitos del brief"],
        summary: "Simulación completada. Sigue practicando para mejorar tus habilidades.",
      };
    }

    const { data: evaluation, error } = await supabaseAdmin
      .from("evaluations")
      .insert({
        session_id: sessionId,
        overall_score: parsed.overall_score,
        rubric: parsed.rubric,
        strengths: parsed.strengths,
        improvements: parsed.improvements,
        summary: parsed.summary,
      })
      .select()
      .single();

    if (error) throw error;

    await supabaseAdmin
      .from("simulation_sessions")
      .update({ status: "evaluated", completed_at: new Date().toISOString() })
      .eq("id", sessionId);

    await generatePortfolioEntry(supabaseAdmin, session, parsed, user.id);

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error("Error evaluating simulation:", error);
    return NextResponse.json({ error: "Error al evaluar simulación" }, { status: 500 });
  }
}

async function generatePortfolioEntry(supabase: any, session: any, evaluation: any, userId: string) {
  const { data: student, error: studentErr } = await supabase
    .from("students")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (studentErr || !student) {
    console.error("Error fetching student for portfolio:", studentErr);
    return;
  }

  const { data: scenario } = await supabase
    .from("simulation_scenarios")
    .select("title, skills_required")
    .eq("id", session.scenario_id)
    .single();

  const hoursPerMessage = 0.25;
  const { count } = await supabase
    .from("simulation_messages")
    .select("*", { count: "exact", head: true })
    .eq("session_id", session.id)
    .eq("role", "user");

  const hoursInvested = Math.round((count || 0) * hoursPerMessage);

  const { error: portfolioErr } = await supabase.from("portfolio_entries").insert({
    student_id: student.id,
    source_type: "simulation",
    source_id: session.id,
    title: `Simulación: ${scenario?.title || "Proyecto profesional"}`,
    description: evaluation.summary,
    skills_demonstrated: scenario?.skills_required || [],
    hours_invested: hoursInvested,
    results: `Completado con puntuación de ${evaluation.overall_score}/100. Fortalezas: ${evaluation.strengths.slice(0, 2).join(", ")}`,
    score: evaluation.overall_score,
    is_published: true,
    completed_at: new Date().toISOString(),
  });

  if (portfolioErr) {
    console.error("Error inserting portfolio entry:", portfolioErr);
  }

  await updateExperience(supabase, student.id, evaluation.overall_score, count || 0);
}

async function updateExperience(supabase: any, studentId: string, score: number, messagesCount: number) {
  const xpGained = Math.round((score * 0.7) + (messagesCount * 5));

  const { data: current } = await supabase
    .from("student_experience")
    .select("*")
    .eq("student_id", studentId)
    .maybeSingle();

  if (current) {
    const newTotalXp = current.total_xp + xpGained;
    const newSimsCompleted = current.simulations_completed + 1;
    const newAvgScore = ((current.avg_score * current.simulations_completed) + score) / newSimsCompleted;

    const { data: levelData } = await supabase
      .from("experience_levels")
      .select("level")
      .lte("xp_required", newTotalXp)
      .order("level", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { error } = await supabase
      .from("student_experience")
      .update({
        total_xp: newTotalXp,
        simulations_completed: newSimsCompleted,
        avg_score: Math.round(newAvgScore * 100) / 100,
        level: levelData?.level || current.level,
        updated_at: new Date().toISOString(),
      })
      .eq("id", current.id);

    if (error) console.error("Error updating experience:", error);
  } else {
    const { data: levelData } = await supabase
      .from("experience_levels")
      .select("level")
      .lte("xp_required", xpGained)
      .order("level", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { error } = await supabase.from("student_experience").insert({
      student_id: studentId,
      total_xp: xpGained,
      simulations_completed: 1,
      avg_score: score,
      level: levelData?.level || 1,
    });

    if (error) console.error("Error inserting experience:", error);
  }
}
