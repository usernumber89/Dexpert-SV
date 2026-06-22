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
    const { ResultadoTransaccion, IdTransaccion, EnlacePago } = body;
    const identificador = EnlacePago?.IdentificadorEnlaceComercio;
    const esAprobada = ResultadoTransaccion === "ExitosaAprobada";

    // Si no es aprobada, respondemos 200 para que Wompi no reintente
    if (!esAprobada) return NextResponse.json({ success: true });

    // Extraer datos del identificador (DEXPERT_plan_pymeId_timestamp)
    const parts = identificador.split("_");
    const plan = parts[1];
    const pymeId = parts[2].trim();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Obtener el user_id de la pyme (ya no pedimos 'credits' aquí)
    const { data: pyme, error: pymeErr } = await supabase
      .from("pymes")
      .select("user_id")
      .eq("id", pymeId)
      .single();

    if (pymeErr || !pyme) {
      console.error("PYME no encontrada:", pymeErr);
      return NextResponse.json({ error: "Pyme not found" }, { status: 404 });
    }

    const creditsToAdd = PLAN_CREDITS[plan];

    // 2. Obtener los créditos actuales de pyme_credits
    const { data: creditsData } = await supabase
      .from("pyme_credits")
      .select("credits_available")
      .eq("pyme_id", pymeId)
      .maybeSingle();

    if (creditsData) {
      // Si ya tiene un registro de créditos, lo actualizamos sumando los nuevos
      await supabase
        .from("pyme_credits")
        .update({ 
          credits_available: creditsData.credits_available + creditsToAdd,
          updated_at: new Date().toISOString()
        })
        .eq("pyme_id", pymeId);
    } else {
      // Si es su primera compra y no existe en pyme_credits, lo creamos
      await supabase
        .from("pyme_credits")
        .insert({
          pyme_id: pymeId,
          credits_available: creditsToAdd,
          credits_used: 0
        });
    }

    // 3. Registrar el historial en credit_purchases
    await supabase.from("credit_purchases").insert({
      user_id: pyme.user_id,
      pyme_id: pymeId,
      plan: plan.toUpperCase(),
      stripe_id: IdTransaccion,
      credits_granted: creditsToAdd,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error crítico en webhook:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}