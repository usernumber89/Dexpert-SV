import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function CallbackPage() {
  const { sessionClaims } = await auth();
  const role = (sessionClaims as any)?.role as string | undefined;

  if (!role) redirect("/onboarding/select-role");
  if (role === "STUDENT") redirect("/student/dashboard");
  if (role === "PYME") redirect("/pyme/dashboard");

  redirect("/onboarding/select-role");
}