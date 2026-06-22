// app/api/wompi/checkout/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getWompiToken } from "@/lib/wompi";

const PLANS = {
  starter: {
    amount: 9.99,
    credits: 3,
    name: "Dexpert Starter",
  },
  growth: {
    amount: 24.99,
    credits: 10,
    name: "Dexpert Growth",
  },
  pro: {
    amount: 49.99,
    credits: 25,
    name: "Dexpert Pro",
  },
} as const;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { plan } = await req.json();

    const selectedPlan =
      PLANS[plan as keyof typeof PLANS];

    if (!selectedPlan) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    const { data: pyme } = await supabase
      .from("pymes")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!pyme) {
      return NextResponse.json(
        { error: "Pyme not found" },
        { status: 404 }
      );
    }

    const accessToken =
      await getWompiToken();

    const comercioId =
      `DEXPERT_${plan}_${pyme.id}_${Date.now()}`;

    const payload = {
      identificadorEnlaceComercio:
        comercioId,

      monto: selectedPlan.amount,

      nombreProducto:
        selectedPlan.name,

      configuracion: {
        urlRedirect:
          `${process.env.NEXT_PUBLIC_APP_URL}/pyme/dashboard?success=true`,

        urlWebhook:
          `${process.env.NEXT_PUBLIC_APP_URL}/api/wompi/webhook`,

        notificarTransaccionCliente: true,
      },
    };

    const response = await fetch(
      "https://api.wompi.sv/EnlacePago",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Authorization:
            `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      console.error(data);

      return NextResponse.json(
        data,
        { status: response.status }
      );
    }

    return NextResponse.json({
      url: data.urlEnlace,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}