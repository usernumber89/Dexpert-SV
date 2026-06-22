import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PLAN_CREDITS: Record<string, number> = {
  starter: 3,
  growth: 10,
  pro: 25,
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("--- WEBHOOK RECIBIDO ---", JSON.stringify(body));

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Acceso a datos basado en el JSON que enviaste
    const { ResultadoTransaccion, IdTransaccion, EnlacePago } = body;
    const identificador = EnlacePago?.IdentificadorEnlaceComercio;
    const esAprobada = ResultadoTransaccion === "ExitosaAprobada";

    if (!esAprobada) {
      return NextResponse.json({ success: true, message: "Transacción no exitosa" });
    }

    if (!identificador) {
      return NextResponse.json({ error: "Identificador no encontrado" }, { status: 400 });
    }

    // Parsear ID: DEXPERT_plan_pymeId_timestamp
    const parts = identificador.split("_");
    const plan = parts[1]; // "starter", "growth" o "pro"
    const pymeId = parts[2];

    const credits = PLAN_CREDITS[plan];

    // Verificar si ya procesamos este pago
    const { data: existing } = await supabase
      .from("credit_purchases")
      .select("id")
      .eq("stripe_id", IdTransaccion) // Usamos stripe_id como nombre de columna genérico
      .maybeSingle();

    if (existing) return NextResponse.json({ success: true, message: "Ya procesado" });

    // Actualizar Pyme
    const { data: pyme, error: pymeErr } = await supabase
      .from("pymes")
      .select("credits, user_id")
      .eq("id", pymeId)
      .single();

    if (pymeErr || !pyme) {
      return NextResponse.json({ error: "Pyme no encontrada" }, { status: 404 });
    }

    // Sumar créditos
    await supabase
      .from("pymes")
      .update({ credits: (pyme.credits || 0) + credits })
      .eq("id", pymeId);

    // Registrar historial
    await supabase.from("credit_purchases").insert({
      user_id: pyme.user_id,
      pyme_id: pymeId,
      plan: plan.toUpperCase(),
      stripe_id: IdTransaccion,
      credits_granted: credits,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error en Webhook:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}