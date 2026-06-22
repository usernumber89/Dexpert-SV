import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PLAN_CREDITS: Record<string, number> = {
  starter: 3,
  growth: 10,
  pro: 25,
};

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await req.json();
    
    // 1. Extraemos los datos según la estructura real de Wompi
    const { 
      ResultadoTransaccion, 
      IdTransaccion, 
      EnlacePago 
    } = body;

    const identificador = EnlacePago?.IdentificadorEnlaceComercio;
    const esAprobada = ResultadoTransaccion === "ExitosaAprobada";

    console.log("Procesando webhook...", { esAprobada, identificador, IdTransaccion });

    if (!esAprobada) {
      return NextResponse.json({ success: true, message: "Transacción no aprobada" });
    }

    if (!identificador) {
      return NextResponse.json({ error: "Identificador no encontrado" }, { status: 400 });
    }

    // 2. Parsear el identificador: DEXPERT_plan_pymeId_timestamp
    const parts = identificador.split("_");
    const plan = parts[1];     // "pro"
    const pymeId = parts[2];   // "aacaff..."

    const credits = PLAN_CREDITS[plan];

    if (!credits || !pymeId) {
      return NextResponse.json({ error: "Formato de ID inválido" }, { status: 400 });
    }

    // 3. Evitar duplicados
    const { data: existingPurchase } = await supabase
      .from("credit_purchases")
      .select("id")
      .eq("stripe_id", IdTransaccion)
      .maybeSingle();

    if (existingPurchase) {
      return NextResponse.json({ success: true, message: "Ya procesado" });
    }

    // 4. Obtener pyme
    const { data: pyme, error: pymeError } = await supabase
      .from("pymes")
      .select("credits, user_id")
      .eq("id", pymeId)
      .single();

    if (pymeError || !pyme) {
      console.error("Error buscando pyme:", pymeError);
      return NextResponse.json({ error: "Pyme not found" }, { status: 404 });
    }

    // 5. Actualizar Créditos
    await supabase
      .from("pymes")
      .update({ credits: (pyme.credits ?? 0) + credits })
      .eq("id", pymeId);

    // 6. Registrar Compra
    await supabase.from("credit_purchases").insert({
      user_id: pyme.user_id,
      pyme_id: pymeId,
      plan: plan.toUpperCase(),
      stripe_id: IdTransaccion,
      credits_granted: credits,
    });

    console.log(`Éxito total: ${credits} créditos agregados a ${pymeId}`);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Error fatal:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}