import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

const PLANS = {
  STARTER: {
    priceId: process.env.STRIPE_PRICE_STARTER!,
    credits: 3,
    amount: 999,
    name: "Dexpert Starter — 3 credits",
  },
  GROWTH: {
    priceId: process.env.STRIPE_PRICE_GROWTH!,
    credits: 10,
    amount: 2499,
    name: "Dexpert Growth — 10 credits",
  },
  PRO: {
    priceId: process.env.STRIPE_PRICE_PRO!,
    credits: 25,
    amount: 4999,
    name: "Dexpert Pro — 25 credits",
  },
} as const;

type PlanKey = keyof typeof PLANS;

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = await req.json() as { plan: PlanKey };

  if (!PLANS[plan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  // Obtener pyme del usuario
  const { data: pyme } = await supabase
    .from("pymes")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!pyme) {
    return NextResponse.json({ error: "Pyme profile not found" }, { status: 404 });
  }

  const planData = PLANS[plan];

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: planData.amount,
          product_data: {
            name: planData.name,
            description: `${planData.credits} project credits for Dexpert — credits never expire`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pyme/dashboard?success=true&plan=${plan}&credits=${planData.credits}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pyme/dashboard?canceled=true`,
    metadata: {
      userId: user.id,
      pymeId: pyme.id,
      plan,
      credits: String(planData.credits),
    },
    customer_email: user.email,
  });

  return NextResponse.json({ url: session.url });
}