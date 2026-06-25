import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getWompiToken } from "@/lib/wompi";

const PLANS: Record<string, { amount: number; name: string }> = {
  starter: { amount: 3.99, name: "Dexpert Starter" },
  growth: { amount: 27.49, name: "Dexpert Growth" },
  pro: { amount: 54.99, name: "Dexpert Pro" },
  talent: { amount: 6.99, name: "Acceso a Talento" },
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