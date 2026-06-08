// app/pyme/layout.tsx
import type { Metadata } from "next";

import { redirect } from "next/navigation";


export const metadata: Metadata = {
  title: "Pyme | Dexpert",
  description: "Pyme dashboard for managing projects and skills",
};

export default async function PymeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;  
}