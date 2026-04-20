import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();

  try {
    // 1. Verificar que el UserProfile existe primero
    // Si no existe, el upsert de Pyme fallará por la llave foránea
    const profile = await prisma.userProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return new Response("User profile not found. Please complete basic registration first.", { status: 404 });
    }

    // 2. Ahora sí, el upsert
    const result = await prisma.pyme.upsert({
      where: { userId },
      update: body,
      create: { 
        ...body, 
        userId // Este userId debe coincidir con el userId de UserProfile
      },
    });

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Internal Error", { status: 500 });
  }
}