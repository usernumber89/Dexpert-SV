import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getWompiToken } from "@/lib/wompi";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

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
      monto: 1.99,
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
      console.error("Error Wompi API:", data);
      return NextResponse.json(data, { status: response.status });
    }

    const paymentUrl = data.urlEnlace || data.url || data.link;

    if (!paymentUrl) {
      console.error("Wompi no devolvió URL:", JSON.stringify(data));
      return NextResponse.json({ error: "No se pudo obtener la URL de pago" }, { status: 500 });
    }

    return NextResponse.json({ url: paymentUrl });
  } catch (error: any) {
    console.error("Error en certificate checkout:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
