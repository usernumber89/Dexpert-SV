import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();

  const userProfile = await prisma.userProfile.findUnique({ where: { userId } });
  if (!userProfile) return new Response("Profile not found", { status: 404 });

  await prisma.student.upsert({
    where: { userId: userProfile.id },
    update: body,
    create: { ...body, userId: userProfile.id },
  });

  return new Response("OK", { status: 200 });
}