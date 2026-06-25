import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getWompiToken } from "@/lib/wompi";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { data: student } = await supabase
      .from("students")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!student) return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 });

    const accessToken = await getWompiToken();
    const comercioId = `DEXPERT_PORTFOLIO_${student.id}_${Date.now()}`;

    const payload = {
      identificadorEnlaceComercio: comercioId,
      monto: 4.99,
      nombreProducto: "Descarga de Portafolio Dexpert",
      configuracion: {
        urlRedirect: `${process.env.NEXT_PUBLIC_APP_URL}/student/portfolio?portfolio_success=true`,
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
    console.error("Error en portfolio checkout:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
