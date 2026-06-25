import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StudentPyMEs } from "@/features/student/components/StudentPyMEs";

export default async function StudentPyMEsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: pymes } = await supabase
    .from("pymes")
    .select("*")
    .order("company_name", { ascending: true });

  const { data: projectCounts } = await supabase
    .from("projects")
    .select("pyme_id, id")
    .eq("status", "active")
    .eq("is_published", true);

  const activeProjectCounts: Record<string, number> = {};
  projectCounts?.forEach(p => {
    activeProjectCounts[p.pyme_id] = (activeProjectCounts[p.pyme_id] || 0) + 1;
  });

  return (
    <StudentPyMEs
      pymes={pymes ?? []}
      activeProjectCounts={activeProjectCounts}
    />
  );
}
