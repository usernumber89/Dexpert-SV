import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { NextResponse } from "next/server";

const BriefSchema = z.object({
  title: z.string(),
  description: z.string(),
  skills: z.string(),
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "El campo 'prompt' es requerido y debe ser texto" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are helping a small business owner in El Salvador create a project brief for Dexpert, a talent marketplace connecting businesses with young students.

Generate a clear, professional project brief with:
- title: short and descriptive (max 8 words)
- description: 2-3 sentences explaining the project clearly
- skills: comma-separated list of 3-5 required skills

Respond ONLY with a valid JSON object in this exact format:
{"title": "...", "description": "...", "skills": "..."}

Respond in the same language the user used.`;

    const userPrompt = `The business owner described their need as: "${prompt}"`;

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