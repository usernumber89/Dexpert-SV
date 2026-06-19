import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

interface RouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    const resolvedParams = await params;
    const certificateId = resolvedParams.id;

    const supabase = await createClient();

    // 1. Consultamos la base de datos
    const { data: certificate, error } = await supabase
      .from("certificates")
      .select(`
        id,
        created_at,
        applications (
          id,
          students!student_id (
            full_name
          ),
          projects (
            id,
            title,
            pymes (
              id,
              company_name
            )
          )
        )
      `)
      .eq("application_id", certificateId)
      .single();

    if (error || !certificate) {
      console.error("❌ Error u objeto no encontrado en Supabase:", error);
      return new NextResponse("Certificado no encontrado", { status: 404 });
    }

    // 2. Desempaquetamos las relaciones de forma segura
    const application = Array.isArray(certificate?.applications) 
      ? certificate.applications[0] 
      : certificate?.applications;
    
    const studentData = Array.isArray(application?.students) 
      ? application?.students[0] 
      : application?.students;
    const studentName = studentData?.full_name || "Estudiante de Dexpert";

    const project = Array.isArray(application?.projects) 
      ? application?.projects[0] 
      : application?.projects;
    const projectTitle = project?.title || "Proyecto de Consultoría Tecnológica";

    const pyme = Array.isArray(project?.pymes) 
      ? project?.pymes[0] 
      : project?.pymes;
    const pymeName = pyme?.company_name || "Empresa Aliada";

    const formattedDate = certificate?.created_at
      ? new Date(certificate.created_at).toLocaleDateString("es-SV", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "Fecha no disponible";

    // 3. Intentamos cargar las imágenes locales desde la carpeta /public
    const fotoPath = path.join(process.cwd(), "public", "dex.png");
    const firmaPath = path.join(process.cwd(), "public", "firma.png");

    let fotoBuffer: Buffer | null = null;
    let firmaBuffer: Buffer | null = null;

    try {
      if (fs.existsSync(fotoPath)) fotoBuffer = fs.readFileSync(fotoPath);
      if (fs.existsSync(firmaPath)) firmaBuffer = fs.readFileSync(firmaPath);
    } catch (imgError) {
      console.warn("⚠️ Advertencia: No se pudieron cargar los archivos de imagen locales:", imgError);
    }

    // 4. Generación del PDF
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({
        size: "LETTER",
        layout: "landscape",
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      const pageWidth = 792;
      const pageHeight = 612;
      const marginX = 55;

      // ── BACKGROUND ──
      doc.rect(0, 0, pageWidth, pageHeight).fill("#FCFCFA");

      // ── TOP HEADER BAND ──
      doc.rect(0, 0, pageWidth, 100).fill("#0A2647");
      doc.rect(0, 100, pageWidth, 4).fill("#D4A843");

      // Logo en header
      if (fotoBuffer) {
        doc.image(fotoBuffer, marginX, 32, { width: 140, height: 40 });
      }

      // Marca top-right
      doc.fillColor("#ffffff")
         .fontSize(20)
         .font("Helvetica-Bold")
         .text("DEXPERT", pageWidth - marginX - 150, 34, { width: 150, align: "right" });
      doc.fillColor("#D4A843")
         .fontSize(9)
         .font("Helvetica")
         .text("Donde el potencial no tiene límites!", pageWidth - marginX - 150, 62, { width: 150, align: "right" });

      // ── LEFT GOLD ACCENT LINE ──
      const goldLineX = 75;
      doc.rect(goldLineX, 130, 3, 350).fill("#D4A843");

      // ── CONTENT ──
      const contentX = goldLineX + 22;

      doc.fillColor("#D4A843")
         .fontSize(10)
         .font("Helvetica-Bold")
         .text("CERTIFICADO DE COMPLETACIÓN", contentX, 140);

      doc.rect(contentX, 160, 130, 2).fill("#D4A843");

      doc.fillColor("#0A2647")
         .fontSize(30)
         .font("Helvetica-Bold")
         .text("Reconocimiento", contentX, 180);

      doc.fillColor("#64748B")
         .fontSize(12)
         .font("Helvetica")
         .text("Por cuanto se reconoce que el (la) estudiante:", contentX, 230);

      doc.fillColor("#0F172A")
         .fontSize(24)
         .font("Helvetica-Bold")
         .text(studentName, contentX, 260);

      doc.fillColor("#64748B")
         .fontSize(12)
         .font("Helvetica")
         .text("Ha cumplido con éxito los requerimientos prácticos y el", contentX, 305);
      doc.text("desarrollo técnico del proyecto:", contentX, doc.y + 2);

      doc.fillColor("#1B5597")
         .fontSize(16)
         .font("Helvetica-Bold")
         .text(`"${projectTitle}"`, contentX, 345);

      doc.fillColor("#64748B")
         .fontSize(12)
         .font("Helvetica")
         .text("En colaboración estratégica con la organización:", contentX, 380);

      doc.fillColor("#0F172A")
         .fontSize(14)
         .font("Helvetica-Bold")
         .text(pymeName, contentX, 405);

      doc.fillColor("#94A3B8")
         .fontSize(10)
         .font("Helvetica-Oblique")
         .text(`El Salvador, ${formattedDate}`, contentX, 440);

      // ── SELLO DECORATIVO ──
      const sealX = pageWidth - marginX - 60;
      const sealY = 310;
      doc.circle(sealX, sealY, 55).lineWidth(1.5).stroke("#D4A843");
      doc.circle(sealX, sealY, 48).lineWidth(0.5).stroke("#D4A843");
      doc.save();
      doc.translate(sealX, sealY);
      doc.rotate(15);
      for (let i = 0; i < 12; i++) {
        doc.rect(-22, -42, 44, 4).fill("#D4A843");
        doc.rotate(30);
      }
      doc.restore();
      doc.fillColor("#D4A843")
         .fontSize(8)
         .font("Helvetica-Bold")
         .text("VERIFICADO", sealX - 26, sealY - 14, { width: 52, align: "center" });
      doc.fillColor("#D4A843")
         .fontSize(8)
         .font("Helvetica")
         .text("DEXPERT", sealX - 26, sealY + 2, { width: 52, align: "center" });

      // ── BLOQUE DE FIRMA ──
      const sigX = contentX;
      const sigY = 495;

      if (firmaBuffer) {
        doc.image(firmaBuffer, sigX, sigY - 38, { width: 100 });
      }

      doc.rect(sigX, sigY, 210, 1).fill("#CBD5E1");

      doc.fillColor("#0F172A")
         .fontSize(11)
         .font("Helvetica-Bold")
         .text("Rodrigo Campos Alvarenga", sigX, sigY + 8);

      doc.fillColor("#64748B")
         .fontSize(8)
         .font("Helvetica")
         .text("Director & Fundador — Dexpert", sigX, sigY + 23);

         const footerY = 580;
      
      // Izquierda: ID del certificado
      doc.fillColor("#94A3B8")
         .fontSize(8)
         .font("Helvetica-Bold")
         .text(`ID DE VERIFICACIÓN: ${certificate.id}`, marginX, footerY, { width: 350, align: "left" });
      doc.y = 400;

      // Derecha: URL del portal de validación
      doc.fillColor("#94A3B8")
         .fontSize(8)
         .font("Helvetica")
         .text(`Validar autenticidad en: dexpert-sv.vercel.app/verify/${certificate.id}`, pageWidth - marginX - 300, footerY, { width: 300, align: "right" });
      doc.y = 400;

      // ── BOTTOM GOLD LINE ──
      doc.rect(0, pageHeight - 4, pageWidth, 4).fill("#D4A843");

      doc.end();
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="certificado-${certificateId}.pdf"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });

  } catch (globalError) {
    console.error("🚨 Error crítico generando el PDF:", globalError);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}