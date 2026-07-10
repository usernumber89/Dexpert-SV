import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac } from "crypto";

const PLAN_CREDITS: Record<string, number> = {
  growthlight: 4,
  growth: 8,
  pro: 20,
  enterprise: 50,
};

const PLAN_AMOUNTS: Record<string, number> = {
  growthlight: 14.99,
  growth: 24.99,
  pro: 49.99,
  enterprise: 99.99,
};

const PLAN_NAMES: Record<string, string> = {
  growthlight: "Dexpert Growth L",
  growth: "Dexpert Growth",
  pro: "Dexpert Pro",
  enterprise: "Dexpert Enterprise",
};

function validateSignature(body: string, signature: string | null): boolean {
  if (!signature || !process.env.WOMPI_API_SECRET) return false;
  const expected = createHmac("sha256", process.env.WOMPI_API_SECRET)
    .update(body)
    .digest("hex");
  try {
    const received = Buffer.from(signature, "hex").toString("hex");
    return expected === received || expected === signature;
  } catch {
    return expected === signature;
  }
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("wompi_hash");

    if (!validateSignature(rawBody, signature)) {
      console.error("Webhook Wompi: firma inválida");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const { ResultadoTransaccion, IdTransaccion, EnlacePago } = body;
    const identificador = EnlacePago?.IdentificadorEnlaceComercio;
    const esAprobada = ResultadoTransaccion === "ExitosaAprobada";

    if (!esAprobada) return NextResponse.json({ success: true });

    if (!identificador) {
      console.error("Webhook sin IdentificadorEnlaceComercio");
      return NextResponse.json({ error: "Identificador requerido" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const [creditCheck, purchaseCheck] = await Promise.all([
      supabase.from("credit_purchases").select("id").eq("stripe_id", IdTransaccion).maybeSingle(),
      supabase.from("purchases").select("id").eq("stripe_id", IdTransaccion).maybeSingle(),
    ]);
    if (creditCheck.data || purchaseCheck.data) {
      console.log(`Transacción ${IdTransaccion} ya procesada, skip`);
      return NextResponse.json({ success: true, duplicate: true });
    }

    if (identificador.startsWith("DEXPERT_CERT_")) {
      const parts = identificador.split("_");
      if (parts.length < 4) {
        console.error("Formato DEXPERT_CERT inválido:", identificador);
        return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
      }
      const certificateId = parts[2];
      const studentId = parts[3];

      const { error: certErr } = await supabase
        .from("certificates")
        .update({ paid: true, transaction_id: IdTransaccion })
        .eq("id", certificateId);

      if (certErr) {
        console.error("Error marcando certificado como pagado:", certErr);
        return NextResponse.json({ error: certErr.message }, { status: 500 });
      }

      console.log(`Certificado ${certificateId} pagado por estudiante ${studentId}`);
      return NextResponse.json({ success: true });
    }

    if (identificador.startsWith("DEXPERT_PORTFOLIO_")) {
      const parts = identificador.split("_");
      if (parts.length < 3) {
        console.error("Formato DEXPERT_PORTFOLIO inválido:", identificador);
        return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
      }
      const studentId = parts[2];

      const { error: portErr } = await supabase
        .from("students")
        .update({ portfolio_paid: true, portfolio_transaction_id: IdTransaccion })
        .eq("id", studentId);

      if (portErr) {
        console.error("Error marcando portafolio como pagado:", portErr);
        return NextResponse.json({ error: portErr.message }, { status: 500 });
      }

      console.log(`Portafolio pagado para estudiante ${studentId}`);
      return NextResponse.json({ success: true });
    }

    if (identificador.startsWith("DEXPERT_BOOST_")) {
      const parts = identificador.split("_");
      if (parts.length < 3) {
        console.error("Formato DEXPERT_BOOST inválido:", identificador);
        return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
      }
      const studentId = parts[2];
      const boostUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const { error: boostErr } = await supabase
        .from("students")
        .update({ profile_boost_until: boostUntil })
        .eq("id", studentId);

      if (boostErr) {
        console.error("Error actualizando boost:", boostErr);
        return NextResponse.json({ error: boostErr.message }, { status: 500 });
      }

      console.log(`Boost activado para estudiante ${studentId} hasta ${boostUntil}`);
      return NextResponse.json({ success: true });
    }

    const parts = identificador.split("_");
    if (parts.length < 3) {
      console.error("Identificador con formato inválido:", identificador);
      return NextResponse.json({ error: "Formato de identificador inválido" }, { status: 400 });
    }

    const plan = parts[1];
    const pymeId = parts[2].trim();

    if (plan !== "talent" && !(plan in PLAN_CREDITS)) {
      console.error("Plan desconocido:", plan);
      return NextResponse.json({ error: "Plan desconocido" }, { status: 400 });
    }

    const { data: pyme, error: pymeErr } = await supabase
      .from("pymes")
      .select("user_id, company_name")
      .eq("id", pymeId)
      .single();

    if (pymeErr || !pyme) {
      console.error("PYME no encontrada:", pymeErr);
      return NextResponse.json({ error: "Pyme not found" }, { status: 404 });
    }

    if (plan === "talent") {
      const { error: purchaseErr } = await supabase.from("purchases").insert({
        user_id: pyme.user_id,
        pyme_id: pymeId,
        plan: "TALENT_ACCESS",
        stripe_id: IdTransaccion,
      });

      if (purchaseErr) {
        console.error("Error insertando TALENT_ACCESS:", purchaseErr);
        return NextResponse.json({ error: purchaseErr.message }, { status: 500 });
      }

      console.log(`Talento desbloqueado para PYME ${pymeId}`);
      return NextResponse.json({ success: true });
    }

    const creditsToAdd = PLAN_CREDITS[plan];

    const { data: creditsData } = await supabase
      .from("pyme_credits")
      .select("credits_available")
      .eq("pyme_id", pymeId)
      .maybeSingle();

    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    if (creditsData) {
      const { error: updateErr } = await supabase
        .from("pyme_credits")
        .update({
          credits_available: creditsData.credits_available + creditsToAdd,
          updated_at: new Date().toISOString(),
          expires_at: expiresAt,
        })
        .eq("pyme_id", pymeId);

      if (updateErr) {
        console.error("Error actualizando créditos:", updateErr);
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }
    } else {
      const { error: insertErr } = await supabase
        .from("pyme_credits")
        .insert({
          pyme_id: pymeId,
          credits_available: creditsToAdd,
          credits_used: 0,
          expires_at: expiresAt,
        });

      if (insertErr) {
        console.error("Error insertando créditos iniciales:", insertErr);
        return NextResponse.json({ error: insertErr.message }, { status: 500 });
      }
    }

    const { error: creditPurchaseErr } = await supabase.from("credit_purchases").insert({
      user_id: pyme.user_id,
      pyme_id: pymeId,
      plan: plan.toUpperCase(),
      stripe_id: IdTransaccion,
      credits_granted: creditsToAdd,
    });

    if (creditPurchaseErr) {
      console.error("Error insertando credit_purchases:", creditPurchaseErr);
      return NextResponse.json({ error: creditPurchaseErr.message }, { status: 500 });
    }

    const { error: purchaseErr } = await supabase.from("purchases").insert({
      user_id: pyme.user_id,
      pyme_id: pymeId,
      plan: plan.toUpperCase(),
      stripe_id: IdTransaccion,
    });

    if (purchaseErr) {
      console.error("Error insertando purchases:", purchaseErr);
      return NextResponse.json({ error: purchaseErr.message }, { status: 500 });
    }

    try {
      const year = new Date().getFullYear();
      const { data: seqData } = await supabase.rpc("next_invoice_number", { p_year: year });
      const seq = seqData || 1;
      const invoiceNumber = `FACT-${year}-${String(seq).padStart(6, "0")}`;

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

    // Registrar en audit_logs para el dashboard de administración
    try {
      await supabase.from("audit_logs").insert({
        user_id: pyme.user_id,
        action: "wompi_transaction_success",
        entity_type: "purchase",
        entity_id: IdTransaccion,
        metadata: {
          plan: plan.toUpperCase(),
          amount: PLAN_AMOUNTS[plan] || 0,
          pyme_id: pymeId,
          company: pyme.company_name,
        },
      });
    } catch (auditErr) {
      console.error("Error registrando audit log (no crítico):", auditErr);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error crítico en webhook:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
