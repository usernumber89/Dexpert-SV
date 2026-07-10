import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getWompiToken } from "@/lib/wompi";
import { checkRateLimit, getRateLimitKey, rateLimitResponse } from "@/lib/rate-limit";
import { CERTIFICATE_AMOUNT } from "@/lib/plans";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    if (!checkRateLimit(getRateLimitKey(user.id, "cert-checkout"), 10, 60_000)) {
      return rateLimitResponse();
    }

    const { certificateId } = await req.json();
    if (!certificateId) return NextResponse.json({ error: "certificateId requerido" }, { status: 400 });

    const { data: student } = await supabase
      .from("students")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!student) return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 });

    const accessToken = await getWompiToken();
    const comercioId = `DEXPERT_CERT_${certificateId}_${student.id}_${Date.now()}`;

    const payload = {
      identificadorEnlaceComercio: comercioId,
      monto: CERTIFICATE_AMOUNT,
      nombreProducto: "Certificado Dexpert",
      configuracion: {
        urlRedirect: `${process.env.NEXT_PUBLIC_APP_URL}/student/certificates?success=true`,
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

    if (!response.ok) {
      console.error("Error Wompi API:", response.status, response.statusText);
      return NextResponse.json({ error: "Error en el procesador de pagos" }, { status: response.status });
    }

    const paymentUrl = data.urlEnlace || data.url || data.link;

    if (!paymentUrl) {
      console.error("Wompi no devolvió URL de pago:", response.status);
      return NextResponse.json({ error: "No se pudo obtener la URL de pago" }, { status: 500 });
    }

    return NextResponse.json({ url: paymentUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno";
    console.error("Error en certificate checkout:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
