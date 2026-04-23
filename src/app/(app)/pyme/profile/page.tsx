import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PymeProfilePage from "@/features/pyme/components/PymeProfilePage";

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  return <PymeProfilePage />;
}