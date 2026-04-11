import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PymeDashboard } from "@/features/pyme/components/PymeDashboard";
import { Suspense } from "react";
import { PaymentFeedback } from "@/components/shared/PaymentFeedback";

export default async function PymeDashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // 1. Buscamos primero la Pyme usando el ID de Clerk (userId)
  const pyme = await prisma.pyme.findUnique({ 
    where: { userId: user.id } 
  });

  // 2. Si no existe la pyme, podrías redirigir al onboarding
  if (!pyme) redirect("/sign-in");

  // 3. Ahora buscamos los proyectos usando el ID interno de la pyme
  const projects = await prisma.project.findMany({
    where: { pymeId: pyme.id }, // <--- Cambio clave: pymeId en lugar de userId
    include: {
      applications: {
        include: { student: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Suspense fallback={null}>
        <PaymentFeedback />
      </Suspense>
      <PymeDashboard
        user={{ name: user.firstName ?? "Business", imageUrl: user.imageUrl }}
        pyme={pyme}
        projects={projects}
      />
    </>
  );
}