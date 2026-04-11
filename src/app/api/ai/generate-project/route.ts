import { generateObject } from "ai";
import { model } from "@/lib/ai";
import { z } from "zod";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const { object } = await generateObject({
    model,
    schema: z.object({
      title: z.string(),
      description: z.string(),
      skills: z.string(),
    }),
    prompt: `You are helping a small business owner in El Salvador create a project brief for Dexpert, a talent marketplace connecting businesses with young students.

The business owner described their need as: "${prompt}"

Generate a clear, professional project brief with:
- title: short and descriptive (max 8 words)
- description: 2-3 sentences explaining the project clearly
- skills: comma-separated list of 3-5 required skills

Respond in the same language the user used.`,
  });

  return Response.json(object);
}