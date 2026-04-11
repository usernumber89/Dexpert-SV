import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StudentDashboard } from "@/features/student/components/StudentDashboard";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  try {
    const user = await currentUser();
    if (!user) redirect("/auth/sign-in");

    const [student, applications, projects] = await Promise.all([
      prisma.student.findUnique({ where: { userId: user.id } }),
      prisma.application.findMany({
        where: { student: { userId: user.id } },
        include: { project: { include: { pyme: true } }, certificate: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.project.findMany({
        where: { isPublished: true, status: "active" },
        include: { pyme: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

    return (
      <StudentDashboard
        user={{ 
          name: user.firstName ?? "Student", 
          imageUrl: user.imageUrl 
        }}
        student={student}
        applications={applications}
        projects={projects}
      />
    );
  } catch (error) {
    console.error("Error en StudentDashboardPage:", error);
    return <div>Error al cargar el dashboard</div>;
  }
}