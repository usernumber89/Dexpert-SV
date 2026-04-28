import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// Usar service role para saltarse RLS en el webhook
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new NextResponse("Missing stripe-signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature error:", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, pymeId, plan, credits } = session.metadata!;
    const creditsNum = parseInt(credits);

    try {
      // 1. Guardar la compra
      const { error: purchaseError } = await supabaseAdmin
        .from("purchases")
        .insert({
          user_id: userId,
          pyme_id: pymeId,
          plan,
          stripe_id: session.id,
          credits_granted: creditsNum,
        });

      if (purchaseError) {
        console.error("Error saving purchase:", purchaseError);
        return new NextResponse("Error saving purchase", { status: 500 });
      }

      // 2. Actualizar o crear créditos de la PYME
      const { data: existing } = await supabaseAdmin
        .from("pyme_credits")
        .select("credits_available")
        .eq("pyme_id", pymeId)
        .maybeSingle();

      if (existing) {
        await supabaseAdmin
          .from("pyme_credits")
          .update({
            credits_available: existing.credits_available + creditsNum,
            updated_at: new Date().toISOString(),
          })
          .eq("pyme_id", pymeId);
      } else {
        await supabaseAdmin
          .from("pyme_credits")
          .insert({
            pyme_id: pymeId,
            credits_available: creditsNum,
            credits_used: 0,
          });
      }

      console.log(`✓ Payment processed: ${creditsNum} credits added to pyme ${pymeId}`);
    } catch (error) {
      console.error("Error processing payment:", error);
      return new NextResponse("Error processing payment", { status: 500 });
    }
  }

  return new NextResponse(null, { status: 200 });
}