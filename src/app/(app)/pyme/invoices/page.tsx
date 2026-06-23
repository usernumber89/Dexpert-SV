import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PymeInvoices } from "@/features/pyme/components/PymeInvoices";

export default async function PymeInvoicesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: pyme } = await supabase
    .from("pymes")
    .select("id, company_name, location")
    .eq("user_id", user.id)
    .single();

  if (!pyme) redirect("/onboarding/pyme");

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("pyme_id", pyme.id)
    .order("created_at", { ascending: false });

  return <PymeInvoices invoices={invoices || []} pyme={pyme} />;
}
