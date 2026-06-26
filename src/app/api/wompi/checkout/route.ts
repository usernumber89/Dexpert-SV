import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getWompiToken } from "@/lib/wompi";

const PLANS: Record<string, { amount: number; name: string }> = {
  starter: { amount: 3.99, name: "Dexpert Starter" },
  growth: { amount: 27.49, name: "Dexpert Growth" },
  pro: { amount: 54.99, name: "Dexpert Pro" },
  talent: { amount: 7.99, name: "Acceso a Talento" },
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
      const admin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const { data: existing } = await admin
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

    const payload = {
      identificadorEnlaceComercio: comercioId,
      monto: selectedPlan.amount,
      nombreProducto: selectedPlan.name,
      configuracion: {
        urlRedirect: `${process.env.NEXT_PUBLIC_APP_URL}/pyme/dashboard?success=true&plan=${plan}`,
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
      console.error("Error Wompi API:", data);
      return NextResponse.json(data, { status: response.status });
    }

    // Extracción segura de la URL (buscamos en varios campos comunes)
    const paymentUrl = data.urlEnlace || data.url || data.link;

    if (!paymentUrl) {
      console.error("CRÍTICO: Wompi no devolvió una URL válida. Respuesta completa:", JSON.stringify(data));
      return NextResponse.json({ error: "No se pudo obtener la URL de pago" }, { status: 500 });
    }

    return NextResponse.json({ url: paymentUrl });

  } catch (error: any) {
    console.error("Error en checkout:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}