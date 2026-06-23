import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ContactSupport } from "@/components/shared/ContactSupport";

export default async function PymeSupportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  return <ContactSupport role="pyme" />;
}
