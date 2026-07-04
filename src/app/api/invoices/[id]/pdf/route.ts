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
        margins: { top: 40, bottom: 40, left: 50, right: 50 },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      const ml = 50;
      const mr = 50;
      const cw = 512;
      const rightX = 310;
      const rightW = 252;

      const primary = "#1E40AF";
      const primaryLight = "#DBEAFE";
      const accent = "#0EA5E9";
      const gray = "#64748B";
      const grayLight = "#F8FAFC";
      const dark = "#0F172A";
      const green = "#16A34A";

      // ── TOP DECORATIVE BAR ──
      doc.rect(0, 0, 612, 8).fill(primary);

      // ── HEADER ──
      const logoPath = path.join(process.cwd(), "public", "dex.png");

      try {
        doc.image(logoPath, ml, 28, { width: 95 });
      } catch {
        doc.fontSize(22).font("Helvetica-Bold").fillColor(primary).text("Dexpert", ml, 36);
      }

      doc.fontSize(7.5).font("Helvetica").fillColor(gray);
      doc.text("Plataforma de talento estudiantil", ml, 68);
      doc.text("NIT: 0614-123456-789-0  |  NRC: 123456-7", ml, 82);
      doc.text("San Salvador, El Salvador  |  +503 1234-5678", ml, 96);
      doc.text("facturacion@dexpert.sv", ml, 110);

      // ── INVOICE NUMBER BADGE ──
      doc.roundedRect(rightX, 28, rightW, 54, 6).fill(primaryLight);
      doc.fontSize(10).font("Helvetica-Bold").fillColor(primary).text("FACTURA", rightX, 34, { width: rightW, align: "center" });
      doc.fontSize(11).font("Courier-Bold").fillColor(dark).text(invoice.invoice_number, rightX, 50, { width: rightW, align: "center" });

      const hdrEnd = 104;
      doc.moveTo(ml, hdrEnd).lineTo(ml + cw, hdrEnd).strokeColor("#E2E8F0").lineWidth(1).stroke();

      // ── CLIENT + DATES ──
      const secY = hdrEnd + 18;

      doc.fontSize(8).font("Helvetica-Bold").fillColor(primary).text("FACTURADO A", ml, secY);

      doc.fontSize(11).font("Helvetica-Bold").fillColor(dark).text(pyme?.company_name || "—", ml, secY + 16);

      if (pyme?.location) {
        doc.fontSize(9).font("Helvetica").fillColor(gray).text(pyme.location, ml, secY + 34);
      }

      const issueDate = new Date(invoice.created_at).toLocaleDateString("es-SV", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      const statusLabel = invoice.status === "paid" ? "Pagada" : invoice.status;

      // ── INFO CARD ──
      const cardX = rightX;
      const cardY = secY - 2;
      const cardW = rightW;
      const cardH = 58;

      doc.roundedRect(cardX, cardY, cardW, cardH, 6).fill(grayLight);
      doc.roundedRect(cardX, cardY, cardW, cardH, 6).stroke("#E2E8F0");

      const infoRows = [
        { label: "Fecha de emisión", value: issueDate },
        { label: "Condición de pago", value: "Contado" },
        { label: "Estado", value: statusLabel, highlight: statusLabel === "Pagada" },
      ];

      infoRows.forEach((row, i) => {
        const y = cardY + 8 + i * 15;
        doc.fontSize(7.5).font("Helvetica").fillColor(gray).text(row.label, cardX + 10, y, { width: 100, align: "left" });
        doc.fontSize(8.5).font("Helvetica-Bold").fillColor(row.highlight ? green : dark).text(row.value, cardX + 112, y, { width: cardW - 122, align: "right" });
      });

      const infoEnd = cardY + cardH + 14;
      doc.moveTo(ml, infoEnd).lineTo(ml + cw, infoEnd).strokeColor("#E2E8F0").lineWidth(1).stroke();

      // ── ITEMS TABLE ──
      const tTop = infoEnd + 18;
      const cols = [ml, ml + 36, ml + 376, ml + 430, ml + 474];
      const colW = [36, 340, 54, 44, 38];

      doc.roundedRect(ml, tTop, cw, 20, 4).fill(primary);

      const th = ["#", "Descripción", "Cant.", "P. Unit.", "Total"];
      const ta: ("left" | "center" | "right")[] = ["left", "left", "center", "right", "right"];
      th.forEach((t, i) => {
        doc.fontSize(7).font("Helvetica-Bold").fillColor("#FFFFFF").text(t, cols[i] + 6, tTop + 6, { width: colW[i] - 4, align: ta[i] });
      });

      const rY = tTop + 30;

      doc.fontSize(8).font("Helvetica").fillColor(gray);
      doc.text("1", cols[0] + 6, rY + 2, { width: colW[0], align: "left" });
      doc.fontSize(9.5).font("Helvetica-Bold").fillColor(dark);
      doc.text(invoice.plan_name, cols[1] + 6, rY + 2, { width: colW[1], align: "left" });
      doc.fontSize(7.5).font("Helvetica").fillColor(gray);
      doc.text(`Plan ${invoice.plan}`, cols[1] + 6, rY + 16, { width: colW[1], align: "left" });
      doc.fontSize(9).font("Helvetica-Bold").fillColor(dark);
      doc.text("1", cols[2] + 6, rY + 6, { width: colW[2], align: "center" });
      doc.text(`$${invoice.amount.toFixed(2)}`, cols[3] + 6, rY + 6, { width: colW[3], align: "right" });
      doc.text(`$${invoice.amount.toFixed(2)}`, cols[4] + 6, rY + 6, { width: colW[4], align: "right" });

      const itemEnd = rY + 34;
      doc.moveTo(ml, itemEnd).lineTo(ml + cw, itemEnd).strokeColor("#E2E8F0").lineWidth(0.5).stroke();

      // ── TOTALS ──
      const sub = invoice.amount / 1.13;
      const iva = invoice.amount - sub;
      const toX = 350;
      const toW = 162;
      const toY = itemEnd + 16;

      doc.roundedRect(toX, toY, toW, 72, 6).fill(grayLight);
      doc.roundedRect(toX, toY, toW, 72, 6).stroke("#E2E8F0");

      const totRows = [
        ["Subtotal", `$${sub.toFixed(2)}`],
        ["IVA (13 %)", `$${iva.toFixed(2)}`],
      ];

      totRows.forEach(([l, v], i) => {
        const y = toY + 10 + i * 18;
        doc.fontSize(9).font("Helvetica").fillColor(gray).text(l, toX + 12, y, { width: toW - 80, align: "left" });
        doc.fontSize(9).font("Helvetica-Bold").fillColor(dark).text(v, toX + toW - 12, y, { width: 68, align: "right" });
      });

      doc.moveTo(toX + 12, toY + 48).lineTo(toX + toW - 12, toY + 48).strokeColor("#CBD5E1").lineWidth(1).stroke();

      doc.fontSize(14).font("Helvetica-Bold").fillColor(primary);
      doc.text("Total", toX + 12, toY + 52, { width: toW - 80, align: "left" });
      doc.text(`$${invoice.amount.toFixed(2)}`, toX + toW - 12, toY + 52, { width: 68, align: "right" });

      // ── PAYMENT INFO ──
      const pY = 560;
      doc.moveTo(ml, pY).lineTo(ml + cw, pY).strokeColor("#E2E8F0").lineWidth(1).stroke();

      doc.fontSize(8).font("Helvetica-Bold").fillColor(primary).text("Información de pago", ml, pY + 14);

      doc.fontSize(8).font("Helvetica").fillColor(gray);
      doc.text("Método: Tarjeta de crédito / débito", ml, pY + 30);
      if (invoice.transaction_id) {
        doc.text(`ID transacción: ${invoice.transaction_id}`, ml, pY + 42);
      }
      doc.text(`Estado: ${statusLabel}`, ml, pY + 54);

      doc.fontSize(7).font("Helvetica").fillColor(gray);
      doc.text("Dexpert SV", rightX, pY + 14, { width: rightW, align: "right" });
      doc.text("NIT: 0614-123456-789-0", rightX, pY + 26, { width: rightW, align: "right" });

      // ── FOOTER ──
      doc.rect(0, 730, 612, 40).fill(primary);

      doc.fontSize(7.5).font("Helvetica-Bold").fillColor("#FFFFFF");
      doc.text("¡Gracias por tu compra!", ml, 740, { width: cw, align: "center" });

      doc.fontSize(6.5).font("Helvetica").fillColor("#BFDBFE");
      doc.text(
        "Dexpert SV — Plataforma de talento estudiantil | San Salvador, El Salvador | facturacion@dexpert.sv",
        ml,
        756,
        { width: cw, align: "center" }
      );

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