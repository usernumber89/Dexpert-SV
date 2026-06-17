// app/pyme/layout.tsx
import type { Metadata } from "next";

import { redirect } from "next/navigation";


export const metadata: Metadata = {
  title: "Pyme | Dexpert",
  description: "Dashboard de la empresa para gestionar proyectos y habilidades",
  icons: {
    icon: "/1.svg",
  },
};

export default async function PymeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;  
}