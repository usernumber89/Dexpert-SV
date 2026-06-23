import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PLAN_CREDITS: Record<string, number> = {
  starter: 3,
  growth: 10,
  pro: 25,
};

const PLAN_AMOUNTS: Record<string, number> = {
  starter: 9.99,
  growth: 24.99,
  pro: 49.99,
};

const PLAN_NAMES: Record<string, string> = {
  starter: "Dexpert Starter",
  growth: "Dexpert Growth",
  pro: "Dexpert Pro",
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

    // 1. Obtener pyme con company_name para la factura
    const { data: pyme, error: pymeErr } = await supabase
      .from("pymes")
      .select("user_id, company_name")
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
      await supabase
        .from("pyme_credits")
        .update({ 
          credits_available: creditsData.credits_available + creditsToAdd,
          updated_at: new Date().toISOString()
        })
        .eq("pyme_id", pymeId);
    } else {
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

    // 4. Generar factura
    try {
      const year = new Date().getFullYear();
      const { count } = await supabase
        .from("invoices")
        .select("*", { count: "exact", head: true })
        .gte("created_at", `${year}-01-01`)
        .lte("created_at", `${year}-12-31`);

      const invoiceNumber = `FACT-${year}-${String((count || 0) + 1).padStart(6, "0")}`;

      await supabase.from("invoices").insert({
        pyme_id: pymeId,
        user_id: pyme.user_id,
        invoice_number: invoiceNumber,
        plan: plan.toUpperCase(),
        plan_name: PLAN_NAMES[plan] || plan,
        amount: PLAN_AMOUNTS[plan] || 0,
        transaction_id: IdTransaccion,
        company_name: pyme.company_name || null,
      });

      console.log(`Factura generada: ${invoiceNumber} para PYME ${pymeId}`);
    } catch (invoiceErr) {
      console.error("Error generando factura (no crítico):", invoiceErr);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error crítico en webhook:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
