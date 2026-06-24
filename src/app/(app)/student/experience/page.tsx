import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ExperienceView } from "@/features/experience/components/ExperienceView";

export default async function ExperiencePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  return <ExperienceView />;
}
