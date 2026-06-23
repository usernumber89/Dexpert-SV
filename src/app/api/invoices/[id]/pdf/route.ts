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
      const rightX = 330;
      const rightW = 232;

      const darkBlue = "#0D3A6E";
      const lightBlue = "#5B8DB8";
      const gray = "#64748B";
      const dark = "#1e293b";

      function divider(y: number) {
        doc.moveTo(ml, y).lineTo(ml + cw, y).strokeColor("#cbd5e1").lineWidth(1).stroke();
      }

      // ── HEADER ──
      const logoPath = path.join(process.cwd(), "public", "dex.png");

      try {
        // Inserta el logo
        doc.image(logoPath, ml, 30, { width: 100 });
        // Imprime el texto desplazado hacia la derecha
        
      } catch (err) {
        // Fallback por si la imagen no se encuentra
        doc.fontSize(20).font("Helvetica-Bold").fillColor(darkBlue).text("Dexpert", ml, 40);
      }

      doc.fontSize(8).font("Helvetica").fillColor(lightBlue).text("Plataforma de talento estudiantil", ml, 65);

      doc.fontSize(7.5).fillColor(gray);
      doc.text("NIT: 0614-123456-789-0", ml, 84);
      doc.text("NRC: 123456-7", ml, 96);
      doc.text("San Salvador, El Salvador", ml, 108);
      doc.text("Tel: +503 1234-5678  |  facturacion@dexpert.sv", ml, 120);

      doc.fontSize(22).font("Helvetica-Bold").fillColor(darkBlue).text("FACTURA", rightX, 40, { width: rightW, align: "right" });

      doc.fontSize(12).font("Courier-Bold").fillColor(dark).text(invoice.invoice_number, rightX, 70, { width: rightW, align: "right" });

      const hdrEnd = 146;
      divider(hdrEnd);

      // ── CLIENT + DATES ──
      const secY = hdrEnd + 14;

      doc.fontSize(7).font("Helvetica-Bold").fillColor(lightBlue).text("FACTURADO A", ml, secY);

      doc.fontSize(10).font("Helvetica-Bold").fillColor(dark).text(pyme?.company_name || "—", ml, secY + 16);

      if (pyme?.location) {
        doc.fontSize(9).font("Helvetica").fillColor(gray).text(`${pyme.location}, El Salvador`, ml, secY + 32);
      }

      const issueDate = new Date(invoice.created_at).toLocaleDateString("es-SV", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      const due = new Date(invoice.created_at);
      due.setDate(due.getDate() + 30);
      const dueStr = due.toLocaleDateString("es-SV", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      const statusLabel = invoice.status === "paid" ? "Pagada" : invoice.status;

      const labels = [
        ["Fecha de emisión", issueDate],
        ["Fecha de vencimiento", dueStr],
        ["Condición de pago", "Contado"],
        ["Estado", statusLabel],
      ];

      labels.forEach(([lbl, val], i) => {
        const y = secY + i * 16;
        doc.fontSize(7.5).font("Helvetica").fillColor(gray).text(lbl as string, rightX, y, { width: 110, align: "left" });
        doc.fontSize(8.5).font("Helvetica-Bold").fillColor(lbl === "Estado" && invoice.status === "paid" ? "#16a34a" : dark).text(val as string, rightX + 112, y, { width: rightW - 112, align: "right" });
      });

      const infoEnd = secY + 78;
      divider(infoEnd);

      // ── ITEMS TABLE ──
      const tTop = infoEnd + 14;
      const cols = [ml, ml + 36, ml + 376, ml + 430, ml + 474];
      const colW = [36, 340, 54, 44, 38];

      doc.rect(ml, tTop, cw, 18).fill("#f1f5f9");

      const th = ["#", "Descripción", "Cant.", "P. Unit.", "Total"];
      const ta: ("left" | "center" | "right")[] = ["left", "left", "center", "right", "right"];
      th.forEach((t, i) => {
        doc.fontSize(6.5).font("Helvetica-Bold").fillColor(gray).text(t, cols[i] + 4, tTop + 5, { width: colW[i], align: ta[i] });
      });

      doc.moveTo(ml, tTop + 18).lineTo(ml + cw, tTop + 18).strokeColor("#cbd5e1").lineWidth(1).stroke();

      const rY = tTop + 22;

      doc.fontSize(8).font("Helvetica").fillColor(gray);
      doc.text("1", cols[0] + 4, rY + 4, { width: colW[0], align: "left" });
      doc.fontSize(9).font("Helvetica-Bold").fillColor(dark);
      doc.text(invoice.plan_name, cols[1] + 4, rY + 4, { width: colW[1], align: "left" });
      doc.fontSize(7).font("Helvetica").fillColor(gray);
      doc.text(`Plan ${invoice.plan}`, cols[1] + 4, rY + 18, { width: colW[1], align: "left" });
      doc.fontSize(9).font("Helvetica-Bold").fillColor(dark);
      doc.text("1", cols[2] + 4, rY + 8, { width: colW[2], align: "center" });
      doc.text(`$${invoice.amount.toFixed(2)}`, cols[3] + 4, rY + 8, { width: colW[3], align: "right" });
      doc.text(`$${invoice.amount.toFixed(2)}`, cols[4] + 4, rY + 8, { width: colW[4], align: "right" });

      const itemEnd = rY + 36;
      doc.moveTo(ml, itemEnd).lineTo(ml + cw, itemEnd).strokeColor("#e2e8f0").lineWidth(0.5).stroke();

      // ── TOTALS ──
      const sub = invoice.amount / 1.13;
      const iva = invoice.amount - sub;
      const toX = 350;
      const toW = 162;
      const toY = itemEnd + 14;

      const totRows = [
        ["Subtotal", `$${sub.toFixed(2)}`, false],
        ["IVA (13 %)", `$${iva.toFixed(2)}`, false],
      ];

      totRows.forEach(([l, v], i) => {
        const y = toY + i * 16;
        doc.fontSize(9).font("Helvetica").fillColor(gray).text(l as string, toX, y, { width: toW - 60, align: "left" });
        doc.fontSize(9).font("Helvetica-Bold").fillColor(dark).text(v as string, toX + toW - 60, y, { width: 60, align: "right" });
      });

      doc.moveTo(toX, toY + 34).lineTo(toX + toW, toY + 34).strokeColor("#cbd5e1").lineWidth(1).stroke();

      doc.fontSize(13).font("Helvetica-Bold").fillColor(darkBlue);
      doc.text("Total", toX, toY + 40, { width: toW - 60, align: "left" });
      doc.text(`$${invoice.amount.toFixed(2)}`, toX + toW - 60, toY + 40, { width: 60, align: "right" });

      // ── PAYMENT INFO ──
      const pY = 580;
      divider(pY);

      doc.fontSize(8).font("Helvetica-Bold").fillColor(dark).text("Información de pago", ml, pY + 12);

      doc.fontSize(8).font("Helvetica").fillColor(gray);
      doc.text("Método: Tarjeta de crédito / débito", ml, pY + 28);
      if (invoice.transaction_id) {
        doc.text(`ID transacción: ${invoice.transaction_id}`, ml, pY + 40);
      }
      doc.text(`Estado: ${statusLabel}`, ml, pY + 52);

      doc.fontSize(7).font("Helvetica").fillColor("#94a3b8");
      doc.text("Dexpert SV", rightX, pY + 12, { width: rightW, align: "right" });
      doc.text("Plataforma de talento estudiantil", rightX, pY + 24, { width: rightW, align: "right" });
      doc.text("NIT: 0614-123456-789-0", rightX, pY + 36, { width: rightW, align: "right" });

      // ── FOOTER ──
      doc.moveTo(ml, 700).lineTo(ml + cw, 700).strokeColor("#e2e8f0").lineWidth(0.5).stroke();

      doc.fontSize(7).font("Helvetica-Bold").fillColor(gray);
      doc.text("¡Gracias por tu compra!", ml, 712, { width: cw, align: "center" });

      doc.fontSize(6).font("Helvetica").fillColor("#94a3b8");
      doc.text(
        "Esta factura fue generada automáticamente por Dexpert SV — Plataforma de talento estudiantil",
        ml,
        726,
        { width: cw, align: "center" }
      );
      doc.text("San Salvador, El Salvador | facturacion@dexpert.sv | +503 1234-5678", ml, 738, { width: cw, align: "center" });

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