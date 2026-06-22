// app/api/wompi/webhook/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PLAN_CREDITS = {
  starter: 3,
  growth: 10,
  pro: 25,
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log(
      "Webhook Wompi:",
      JSON.stringify(body, null, 2)
    );

    const {
      esAprobada,
      idTransaccion,
      identificadorEnlaceComercio,
    } = body;

    if (!esAprobada) {
      return NextResponse.json({
        success: true,
      });
    }

    if (
      !identificadorEnlaceComercio
    ) {
      return NextResponse.json(
        {
          error:
            "identificadorEnlaceComercio missing",
        },
        {
          status: 400,
        }
      );
    }

    const parts =
      identificadorEnlaceComercio.split(
        "_"
      );

    const plan = parts[1];
    const pymeId = parts[2];

    const credits =
      PLAN_CREDITS[
        plan as keyof typeof PLAN_CREDITS
      ];

    if (!credits) {
      return NextResponse.json(
        {
          error:
            "Credits not found",
        },
        {
          status: 400,
        }
      );
    }

    const supabase =
      await createClient();

    // Evita duplicados
    const {
      data: existingPurchase,
    } = await supabase
      .from("credit_purchases")
      .select("id")
      .eq("stripe_id", idTransaccion)
      .maybeSingle();

    if (existingPurchase) {
      return NextResponse.json({
        success: true,
      });
    }

    const { data: pyme } =
      await supabase
        .from("pymes")
        .select(
          "credits,user_id"
        )
        .eq("id", pymeId)
        .single();

    if (!pyme) {
      return NextResponse.json(
        {
          error:
            "Pyme not found",
        },
        {
          status: 404,
        }
      );
    }

    await supabase
      .from("pymes")
      .update({
        credits:
          (pyme.credits ?? 0) +
          credits,
      })
      .eq("id", pymeId);

    await supabase
      .from("credit_purchases")
      .insert({
        user_id: pyme.user_id,
        pyme_id: pymeId,
        plan: plan.toUpperCase(),
        stripe_id: idTransaccion,
        project_id: null,
        credits_granted: credits,
      });

    console.log(
      `${credits} créditos agregados a ${pymeId}`
    );

    return NextResponse.json({
      success: true,
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