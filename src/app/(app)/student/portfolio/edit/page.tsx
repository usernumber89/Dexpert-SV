import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PortfolioEditorPage } from "@/features/portfolio/components/PortfolioEditorPage";

export default async function EditPortfolioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!student) redirect("/student/dashboard");

  return <PortfolioEditorPage studentId={student.id} />;
}