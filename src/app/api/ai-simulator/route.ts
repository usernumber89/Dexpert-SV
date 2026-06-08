import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Inicializamos el cliente de Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Este es el prompt maestro que le da vida al personaje
const getSystemPrompt = (scenarioId: string) => {
  const scenarios = {
    cliente_dificil: {
      role: "cliente",
      personality: "enojado e impaciente por la demora en la entrega de un pedido.",
      goal: "Quieres una explicación y una solución inmediata.",
    },
    negociacion_proveedor: {
      role: "proveedor",
      personality: "amigable pero inflexible con los precios.",
      goal: "Buscar un acuerdo que beneficie a ambas partes.",
    },
    // ... puedes agregar aquí todos los escenarios que necesites
  };

  const selectedScenario = scenarios[scenarioId as keyof typeof scenarios] || scenarios.cliente_dificil;

  return `Eres un simulado de entorno laboral para estudiantes.
    Tu rol actual es: ${selectedScenario.role}.
    Tu personalidad es: ${selectedScenario.personality}.
    Tu objetivo en la conversación: ${selectedScenario.goal}.
    Responde siempre de forma natural y concisa, como lo haría una persona real en ese contexto.
    Al final de tu respuesta, NO incluyas ningún tipo de puntuación o meta-análisis, solo el diálogo.`;
};

export async function POST(req: NextRequest) {
  try {
    const { messages, scenarioId } = await req.json();

    // Construimos el historial de la conversación para la IA
    const conversationHistory = [
      { role: "system", content: getSystemPrompt(scenarioId) },
      ...messages.map((msg: any) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      })),
    ];

    // Solicitamos la respuesta a Groq (usando el modelo recomendado para chat)
    const completion = await groq.chat.completions.create({
      messages: conversationHistory,
      model: "llama-3.3-70b-versatile", // Modelo potente y rápido
      temperature: 0.7,                 // Creatividad media
      max_tokens: 150,                  // Respuestas cortas y al punto
    });

    const aiResponse = completion.choices[0]?.message?.content || "Lo siento, no puedo responder a eso.";

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error("Error en el simulador:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}