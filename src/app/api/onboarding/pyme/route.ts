import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();

  await prisma.pyme.upsert({
    where: { userId },
    update: body,
    create: { ...body, userId },
  });

  return new Response("OK", { status: 200 });
}