import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getWompiToken } from "@/lib/wompi";
import { checkRateLimit, getRateLimitKey, rateLimitResponse } from "@/lib/rate-limit";
import { PLANS } from "@/lib/plans";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!checkRateLimit(getRateLimitKey(user.id, "checkout"), 10, 60_000)) {
      return rateLimitResponse();
    }

    const { plan } = await req.json();
    const selectedPlan = PLANS[plan];

    if (!selectedPlan) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

    const { data: pyme } = await supabase
      .from("pymes")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!pyme) return NextResponse.json({ error: "Pyme not found" }, { status: 404 });

    if (plan === "talent") {
      const { data: existing } = await getSupabaseAdmin()
        .from("purchases")
        .select("plan")
        .eq("user_id", user.id)
        .in("plan", ["TALENT_ACCESS", "GROWTH", "PRO"]);
      if (existing && existing.length > 0) {
        return NextResponse.json({ error: "Ya tienes acceso a Talento", url: `${process.env.NEXT_PUBLIC_APP_URL}/pyme/talent` }, { status: 409 });
      }
    }

    const accessToken = await getWompiToken();
    const comercioId = `DEXPERT_${plan}_${pyme.id}_${Date.now()}`;

    const isTalent = plan === "talent";
    const redirectBase = isTalent
      ? `${process.env.NEXT_PUBLIC_APP_URL}/pyme/talent`
      : `${process.env.NEXT_PUBLIC_APP_URL}/pyme/pricing`;

    const payload = {
      identificadorEnlaceComercio: comercioId,
      monto: selectedPlan.amount,
      nombreProducto: selectedPlan.name,
      configuracion: {
        urlRedirect: `${redirectBase}?success=true&plan=${plan}`,
        urlWebhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/wompi/webhook`,
        notificarTransaccionCliente: true,
      },
    };

    const response = await fetch("https://api.wompi.sv/EnlacePago", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // Debug robusto: Si algo falla, lo veremos claramente en los logs de Vercel
    if (!response.ok) {
      console.error("Error Wompi API:", response.status, response.statusText);
      return NextResponse.json(data, { status: response.status });
    }

    const paymentUrl = data.urlEnlace || data.url || data.link;

    if (!paymentUrl) {
      console.error("Wompi no devolvió URL de pago", { status: response.status });
      return NextResponse.json({ error: "No se pudo obtener la URL de pago" }, { status: 500 });
    }

    return NextResponse.json({ url: paymentUrl });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno";
    console.error("Error en checkout:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}