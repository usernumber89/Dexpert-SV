import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import PDFDocument from "pdfkit";
import path from "path";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return new NextResponse("No autorizado", { status: 401 });

    const { data: invoice, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !invoice) {
      return new NextResponse("Factura no encontrada", { status: 404 });
    }

    const { data: pyme } = await supabase
      .from("pymes")
      .select("company_name, location")
      .eq("id", invoice.pyme_id)
      .single();

    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({
        size: "LETTER",
        layout: "portrait",
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      const PAGE_W = 612;
      const PAGE_H = 792;
      const ml = 40;
      const cw = PAGE_W - ml * 2; // 532

      // ── PALETA DE MARCA DEXPERT ──
      const primary = "#0d3a6e"; // navy
      const accent = "#38a3f1"; // azul
      const bgLight = "#eaf4fe"; // fondo suave
      const borderBlue = "#bad8f7"; // borde suave
      const textMain = "#26313d";
      const textSec = "#6b7a8d";
      const amber = "#d97706";

      const isPaid = invoice.status === "paid";
      const statusLabel = isPaid ? "PAGADA" : String(invoice.status).toUpperCase();

      // ══════════════════════════════════════════
      // BANDA SUPERIOR
      // ══════════════════════════════════════════
      doc.rect(0, 0, PAGE_W, 132).fill(primary);
      doc.rect(0, 132, PAGE_W, 4).fill(accent);

      const logoPath = path.join(process.cwd(), "public", "X2.png");
      try {
        doc.image(logoPath, ml, 30, { width: 92 });
      } catch {
        doc.fontSize(20).font("Helvetica-Bold").fillColor("#ffffff").text("Dexpert", ml, 30);
      }

      doc
        .fontSize(8.5)
        .font("Helvetica-Bold")
        .fillColor(accent)
        .text("PLATAFORMA DE TALENTO ESTUDIANTIL", ml, 76, { characterSpacing: 0.6 });

      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor(borderBlue)
        .text("NIT: 0614-123456-789-0   |   facturacion@dexpert.sv", ml, 92);

      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(accent)
        .text("FACTURA", ml, 32, { width: cw, align: "right", characterSpacing: 1.2 });

      doc
        .fontSize(22)
        .font("Helvetica-Bold")
        .fillColor("#ffffff")
        .text(invoice.invoice_number, ml, 46, { width: cw, align: "right" });

      // Píldora de estado
      const pillW = 100;
      const pillX = ml + cw - pillW;
      const pillY = 90;
      doc
        .roundedRect(pillX, pillY, pillW, 22, 11)
        .fill(isPaid ? accent : amber);
      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor("#ffffff")
        .text(statusLabel, pillX, pillY + 6.5, { width: pillW, align: "center" });

      // ── MARCA DE AGUA (si está pagada) ──
      if (isPaid) {
        doc.save();
        doc.rotate(-28, { origin: [PAGE_W / 2, 430] });
        doc.fillOpacity(0.055);
        doc
          .fontSize(100)
          .font("Helvetica-Bold")
          .fillColor(accent)
          .text("PAGADA", 40, 385, { width: PAGE_W - 80, align: "center" });
        doc.fillOpacity(1);
        doc.restore();
      }

      // ══════════════════════════════════════════
      // TARJETAS: FACTURADO A / DETALLES
      // ══════════════════════════════════════════
      const cardY = 156;
      const cardH = 92;
      const cardW = (cw - 22) / 2;

      doc.lineWidth(1);

      // Tarjeta izquierda — Facturado a
      doc.roundedRect(ml, cardY, cardW, cardH, 8).fillAndStroke(bgLight, borderBlue);
      doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .fillColor(primary)
        .text("FACTURADO A", ml + 16, cardY + 14, { characterSpacing: 0.5 });
      doc
        .fontSize(12.5)
        .font("Helvetica-Bold")
        .fillColor(textMain)
        .text(pyme?.company_name || "—", ml + 16, cardY + 30, { width: cardW - 32 });
      if (pyme?.location) {
        doc
          .fontSize(8.5)
          .font("Helvetica")
          .fillColor(textSec)
          .text(pyme.location, ml + 16, cardY + 50, { width: cardW - 32 });
      }

      // Tarjeta derecha — Detalles
      const card2X = ml + cardW + 22;
      doc.roundedRect(card2X, cardY, cardW, cardH, 8).fillAndStroke(bgLight, borderBlue);

      const issueDate = new Date(invoice.created_at).toLocaleDateString("es-SV", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .fillColor(primary)
        .text("DETALLES DE FACTURA", card2X + 16, cardY + 14, { characterSpacing: 0.5 });

      doc.fontSize(7.5).font("Helvetica").fillColor(textSec).text("FECHA DE EMISIÓN", card2X + 16, cardY + 32);
      doc.fontSize(9.5).font("Helvetica-Bold").fillColor(textMain).text(issueDate, card2X + 16, cardY + 43);

      doc.fontSize(7.5).font("Helvetica").fillColor(textSec).text("CONDICIÓN DE PAGO", card2X + 16, cardY + 62);
      doc.fontSize(9.5).font("Helvetica-Bold").fillColor(textMain).text("Contado", card2X + 16, cardY + 73);

      // ══════════════════════════════════════════
      // TABLA DE ITEMS
      // ══════════════════════════════════════════
      const tTop = cardY + cardH + 30; // 278
      const cols = [ml, ml + 30, ml + 330, ml + 390, ml + 456];
      const colW = [30, 300, 60, 66, 76];
      const align: ("left" | "center" | "right")[] = ["left", "left", "center", "right", "right"];

      doc.roundedRect(ml, tTop, cw, 26, 6).fill(primary);
      ["#", "Descripción", "Cant.", "P. Unit.", "Total"].forEach((t, i) => {
        doc
          .fontSize(8.5)
          .font("Helvetica-Bold")
          .fillColor("#ffffff")
          .text(t, cols[i] + 6, tTop + 9, { width: colW[i] - 12, align: align[i] });
      });

      const rY = tTop + 26 + 16;

      doc.fontSize(9).font("Helvetica").fillColor(textSec).text("1", cols[0] + 6, rY, { width: colW[0] - 12, align: "left" });

      doc
        .fontSize(10.5)
        .font("Helvetica-Bold")
        .fillColor(textMain)
        .text(invoice.plan_name, cols[1] + 6, rY, { width: colW[1] - 12, align: "left" });
      doc
        .fontSize(8.5)
        .font("Helvetica")
        .fillColor(textSec)
        .text(`Plan ${invoice.plan}`, cols[1] + 6, rY + 14, { width: colW[1] - 12, align: "left" });

      doc.fontSize(9).font("Helvetica").fillColor(textMain).text("1", cols[2] + 6, rY, { width: colW[2] - 12, align: "center" });
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(textMain)
        .text(`$${invoice.amount.toFixed(2)}`, cols[3] + 6, rY, { width: colW[3] - 12, align: "right" });
      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(textMain)
        .text(`$${invoice.amount.toFixed(2)}`, cols[4] + 6, rY, { width: colW[4] - 12, align: "right" });

      const itemEnd = rY + 34;
      doc.moveTo(ml, itemEnd).lineTo(ml + cw, itemEnd).strokeColor(borderBlue).lineWidth(1).stroke();

      // ══════════════════════════════════════════
      // TARJETA DE TOTALES
      // ══════════════════════════════════════════
      const sub = invoice.amount / 1.13;
      const iva = invoice.amount - sub;

      const totW = 240;
      const totX = ml + cw - totW;
      const totY = itemEnd + 22;
      const totH = 108;

      doc.roundedRect(totX, totY, totW, totH, 8).fillAndStroke(bgLight, borderBlue);

      doc
        .fontSize(8.5)
        .font("Helvetica")
        .fillColor(textSec)
        .text("Subtotal", totX + 18, totY + 16, { width: totW - 36, align: "left" });
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(textMain)
        .text(`$${sub.toFixed(2)}`, totX + 18, totY + 16, { width: totW - 36, align: "right" });

      doc
        .fontSize(8.5)
        .font("Helvetica")
        .fillColor(textSec)
        .text("IVA (13%)", totX + 18, totY + 34, { width: totW - 36, align: "left" });
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(textMain)
        .text(`$${iva.toFixed(2)}`, totX + 18, totY + 34, { width: totW - 36, align: "right" });

      doc
        .moveTo(totX + 18, totY + 56)
        .lineTo(totX + totW - 18, totY + 56)
        .strokeColor(borderBlue)
        .lineWidth(1)
        .stroke();

      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor(primary)
        .text("TOTAL", totX + 18, totY + 68, { width: totW - 36, align: "left" });
      doc
        .fontSize(15)
        .font("Helvetica-Bold")
        .fillColor(primary)
        .text(`$${invoice.amount.toFixed(2)}`, totX + 18, totY + 82, { width: totW - 36, align: "right" });

      // ══════════════════════════════════════════
      // INFORMACIÓN DE PAGO
      // ══════════════════════════════════════════
      const payY = totY + totH + 26;
      doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .fillColor(primary)
        .text("INFORMACIÓN DE PAGO", ml, payY, { characterSpacing: 0.5 });

      doc
        .fontSize(8.5)
        .font("Helvetica")
        .fillColor(textSec)
        .text("Método:  Tarjeta de crédito / débito (Wompi)", ml, payY + 16);

      if (invoice.transaction_id) {
        doc
          .fontSize(8.5)
          .font("Helvetica")
          .fillColor(textSec)
          .text(`ID de transacción:  ${invoice.transaction_id}`, ml, payY + 30);
      }

      doc
        .fontSize(9)
        .font("Helvetica-Oblique")
        .fillColor(textMain)
        .text("Gracias por confiar en el talento estudiantil salvadoreño.", ml, payY + 52, {
          width: cw,
        });

      // ══════════════════════════════════════════
      // PIE DE PÁGINA
      // ══════════════════════════════════════════
      const footH = 78;
      const footY = PAGE_H - footH;

      doc.rect(0, footY - 4, PAGE_W, 4).fill(accent);
      doc.rect(0, footY, PAGE_W, footH).fill(primary);

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#ffffff")
        .text("¡Gracias por tu confianza!", ml, footY + 18, { width: cw, align: "center" });

      doc
        .fontSize(8.5)
        .font("Helvetica")
        .fillColor(borderBlue)
        .text("Dexpert SV — Plataforma de talento estudiantil | San Salvador, El Salvador", ml, footY + 36, {
          width: cw,
          align: "center",
        });

      doc
        .fontSize(7.5)
        .font("Helvetica")
        .fillColor(borderBlue)
        .text("dexpert.app", ml, footY + 52, { width: cw, align: "center" });

      doc.end();
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="factura-${invoice.invoice_number}.pdf"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    console.error("Error generando PDF de factura:", err);
    return new NextResponse("Error al generar la factura", { status: 500 });
  }
}