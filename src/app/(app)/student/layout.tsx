// app/student/layout.tsx
import type { Metadata } from "next";



export const metadata: Metadata = {
  title: "Estudiante | Dexpert",
  description: "Dashboard del estudiante para gestionar proyectos y habilidades",
  icons: {
    icon: "/1.svg",
  },
};

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;  
}