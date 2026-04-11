import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { role } = await req.json();
  if (!["STUDENT", "PYME"].includes(role)) {
    return new Response("Invalid role", { status: 400 });
  }

  try {
    // 1. Guardar en Prisma
    await prisma.userProfile.upsert({
      where: { userId },
      update: {},
      create: { userId, role },
    });

    // 2. Escribir rol en Clerk JWT
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: { role },
    });

    return new Response("OK", { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response("Error", { status: 500 });
  }
}