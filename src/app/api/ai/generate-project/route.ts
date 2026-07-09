import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { NextResponse } from "next/server";
import { sanitizePrompt } from "@/lib/prompt-sanitizer";

const BriefSchema = z.object({
  title: z.string(),
  description: z.string(),
  skills: z.string(),
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const sanitized = sanitizePrompt(prompt);
    if (!sanitized) {
      return NextResponse.json(
        { error: "El campo 'prompt' es requerido y debe ser texto válido" },
        { status: 400 }
      );
    }

    const systemPrompt = `Ayudarás al dueño de una pequeña empresa en El Salvador a crear una descripción de su proyecto para Dexpert, una plataforma que conecta empresas con jóvenes estudiantes.

Genera una descripción del proyecto claro y profesional con:
- Título: breve y descriptivo (máximo 8 palabras)
- Descripción: 2-3 frases que expliquen el proyecto con claridad
- Habilidades: lista de 3 a 5 habilidades requeridas, separadas por comas

Responde ÚNICAMENTE con un objeto JSON válido en este formato exacto:
{"title": "...", "description": "...", "skills": "..."}

Responde en el mismo idioma que utilizó el usuario.`;

    const userPrompt = `El dueño de la empresa describió su necesidad como: "${sanitized}"`;

    const { text } = await generateText({
  model: groq("llama-3.3-70b-versatile"),
  maxOutputTokens: 300,
  temperature: 0.3,
  system: systemPrompt,
  prompt: userPrompt,
});

    // Extraer JSON de la respuesta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("La IA no devolvió un JSON válido");
    }

    const parsed = BriefSchema.parse(JSON.parse(jsonMatch[0]));
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error generando brief:", error);
    return NextResponse.json(
      { error: "Error al generar el brief. Intenta de nuevo." },
      { status: 500 }
    );
  }
}