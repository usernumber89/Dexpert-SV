import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { NextResponse } from "next/server";

const AnalysisSchema = z.object({
  categoria: z.string(),
  nivel: z.string(),
  habilidades: z.array(z.string()),
  duracion_estimada_semanas: z.number(),
  es_apto_para_estudiantes: z.boolean(),
  puntuacion_complejidad: z.number(),
  riesgos_detectados: z.array(z.string()),
  recomendaciones: z.array(z.string()),
  subproyectos_sugeridos: z.array(z.string()),
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

    const systemPrompt = `Eres un Analista de Proyectos para DEXPERT, una plataforma que conecta estudiantes universitarios con PyMEs para realizar prácticas profesionales mediante proyectos reales.

Tu objetivo es evaluar si un proyecto es adecuado para estudiantes universitarios y estructurarlo correctamente.

Debes devolver SIEMPRE una respuesta JSON válida con la siguiente estructura:
{
  "categoria": "",
  "nivel": "",
  "habilidades": [],
  "duracion_estimada_semanas": 0,
  "es_apto_para_estudiantes": true,
  "puntuacion_complejidad": 0,
  "riesgos_detectados": [],
  "recomendaciones": [],
  "subproyectos_sugeridos": []
}

Reglas:
1. Categorías permitidas: Desarrollo Web, Desarrollo de Software, Bases de Datos, Diseño Gráfico, Marketing Digital, Ciencia de Datos, Automatización, Aplicaciones Móviles, Otro
2. Niveles permitidos: Básico, Intermedio
3. Básico: 1-3 semanas, pocos entregables, conocimientos fundamentales, primeros años
4. Intermedio: 3-8 semanas, integración de tecnologías, cierta complejidad, estudiantes avanzados
5. Si el proyecto es demasiado grande: es_apto_para_estudiantes = false, agregar riesgos, recomendaciones y dividir en subproyectos
6. Detecta tecnologías mencionadas, habilidades requeridas, alcance excesivo, requerimientos ambiguos
7. Considera NO APTO si incluye: ERP completo, Marketplace completo, Sistema tipo Uber, Sistema tipo Amazon, Aplicaciones empresariales complejas, Múltiples módulos críticos, Proyectos estimados mayores a 8 semanas
8. Si detectas un proyecto muy grande, divídelo en componentes más pequeños

Puntuacion de complejidad: 0-100, donde 0 es muy simple y 100 es extremadamente complejo.`;

    const userPrompt = `Analiza el siguiente proyecto: "${prompt}"`;

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      maxOutputTokens: 800,
      temperature: 0.2,
      system: systemPrompt,
      prompt: userPrompt,
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("La IA no devolvió un JSON válido");
    }

    const parsed = AnalysisSchema.parse(JSON.parse(jsonMatch[0]));
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error analizando proyecto:", error);
    return NextResponse.json(
      { error: "Error al analizar el proyecto. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
