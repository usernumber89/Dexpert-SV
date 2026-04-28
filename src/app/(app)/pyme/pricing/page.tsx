import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PymePricing } from "@/features/pyme/components/PymePricing";
import { Suspense } from "react";
import { PaymentFeedback } from "@/components/shared/PaymentFeedback";

export default async function PymePricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: pyme } = await supabase
    .from("pymes")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!pyme) redirect("/onboarding/pyme");

  const { data: credits } = await supabase
    .from("pyme_credits")
    .select("credits_available, credits_used")
    .eq("pyme_id", pyme.id)
    .maybeSingle();

  return (
    <>
      <Suspense fallback={null}>
        <PaymentFeedback />
      </Suspense>
      <PymePricing
        creditsAvailable={credits?.credits_available ?? 0}
        creditsUsed={credits?.credits_used ?? 0}
      />
    </>
  );
}