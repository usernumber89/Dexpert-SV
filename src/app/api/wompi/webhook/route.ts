import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PLAN_CREDITS = {
  starter: 3,
  growth: 10,
  pro: 25,
};

export async function POST(req: Request) {
  try {
    // IMPORTANTE: Usa el Service Role para saltar el RLS (Row Level Security)
    // porque el webhook es un proceso de sistema, no de usuario.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    );

    const body = await req.json();
    console.log("Webhook Wompi Recibido:", JSON.stringify(body));

    const { 
      esAprobada, 
      idTransaccion, 
      identificadorEnlaceComercio 
    } = body;

    // 1. Si no es aprobada, respondemos 200 OK para que Wompi deje de enviar el webhook
    if (!esAprobada) {
      return NextResponse.json({ success: true });
    }

    // 2. Parsear el identificador: DEXPERT_plan_pymeId_timestamp
    if (!identificadorEnlaceComercio) {
      return NextResponse.json({ error: "Missing identifier" }, { status: 400 });
    }

    const parts = identificadorEnlaceComercio.split("_");
    const plan = parts[1];     // "starter"
    const pymeId = parts[2];   // "tu-uuid-aqui"

    const credits = PLAN_CREDITS[plan as keyof typeof PLAN_CREDITS];

    if (!credits || !pymeId) {
      console.error("Error parsing ID:", { identificadorEnlaceComercio });
      return NextResponse.json({ error: "Invalid identifier format" }, { status: 400 });
    }

    // 3. Verificar si ya procesamos este pago (Idempotencia)
    const { data: existingPurchase } = await supabase
      .from("credit_purchases")
      .select("id")
      .eq("stripe_id", idTransaccion) // Asegúrate que aquí guardes el ID de Wompi
      .maybeSingle();

    if (existingPurchase) {
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    // 4. Obtener pyme
    const { data: pyme, error: pymeError } = await supabase
      .from("pymes")
      .select("credits, user_id")
      .eq("id", pymeId)
      .single();

    if (pymeError || !pyme) {
      console.error("Pyme no encontrada:", pymeId);
      return NextResponse.json({ error: "Pyme not found" }, { status: 404 });
    }

    // 5. Actualizar Créditos
    const { error: updateError } = await supabase
      .from("pymes")
      .update({ credits: (pyme.credits ?? 0) + credits })
      .eq("id", pymeId);

    if (updateError) throw updateError;

    // 6. Registrar Compra
    await supabase.from("credit_purchases").insert({
      user_id: pyme.user_id,
      pyme_id: pymeId,
      plan: plan.toUpperCase(),
      stripe_id: idTransaccion, // ID de Wompi
      credits_granted: credits,
    });

    console.log(`Éxito: ${credits} créditos agregados a pyme ${pymeId}`);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Error en Webhook:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}