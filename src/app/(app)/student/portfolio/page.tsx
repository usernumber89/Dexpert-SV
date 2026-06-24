import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PortfolioView } from "@/features/portfolio/components/PortfolioView";

export default async function PortfolioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  return <PortfolioView />;
}
