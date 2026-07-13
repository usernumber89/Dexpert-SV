import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { student_id, sender_name, sender_email, company, message } = body;

    if (!student_id || !sender_name || !sender_email || !message) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const { error } = await getSupabaseAdmin()
      .from("portfolio_messages")
      .insert({ student_id, sender_name, sender_email, company: company || null, message });

    if (error) {
      console.error("Error inserting message:", error);
      return NextResponse.json({ error: "Error al enviar el mensaje" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}