import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PymeApplications } from "@/features/pyme/components/PymeApplications";

export default async function PymeApplicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: pyme } = await supabase
    .from("pymes")
    .select("id, company_name")
    .eq("user_id", user.id)
    .single();

  if (!pyme) redirect("/onboarding/pyme");

  const { data: projects } = await supabase
    .from("projects")
    .select(`
      id, title, skills, status, is_published, created_at,
      applications(
        id, status, created_at,
        students(
          id, full_name, email, phone, location, bio,
          university, major, graduation_year,
          skills, linkedin, github, portfolio, resume_url,
          avatar_url, verified, education
        )
      )
    `)
    .eq("pyme_id", pyme.id)
    .order("created_at", { ascending: false });

  return <PymeApplications projects={(projects ?? []) as any} />;
}