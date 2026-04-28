import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PymeDashboard } from "@/features/pyme/components/PymeDashboard";
import { Suspense } from "react";
import { PaymentFeedback } from "@/components/shared/PaymentFeedback";

export default async function PymeDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: pyme } = await supabase
    .from("pymes")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!pyme) redirect("/onboarding/pyme");

  const [{ data: projects, error: projectsError }, { data: credits }] = await Promise.all([
    supabase
      .from("projects")
      .select("*, applications(*, student:students(*))")
      .eq("pyme_id", pyme.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("pyme_credits")
      .select("credits_available, credits_used")
      .eq("pyme_id", pyme.id)
      .maybeSingle(),
  ]);
  console.log("Projects:", projects);
  console.log("ProjectsError:", projectsError);

  return (
    <>
      <Suspense fallback={null}>
        <PaymentFeedback />
      </Suspense>
      
      <PymeDashboard
        
        user={{ name: user.email?.split("@")[0] ?? "Business", avatarUrl: null }}
        pyme={pyme}
        projects={projects ?? []}
        credits={{
          available: credits?.credits_available ?? 0,
          used: credits?.credits_used ?? 0,
        }}
      />
    </>
  );
}