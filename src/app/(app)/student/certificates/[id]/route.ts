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
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      const centerX = 396; // Centro horizontal de la página LETTER horizontal

      // --- DISEÑO DEL CERTIFICADO ---
      doc.rect(20, 20, 752, 572).lineWidth(4).stroke("#38b6ff");
      doc.rect(28, 28, 736, 556).lineWidth(1.5).stroke("#1b5597");

      doc.fillColor("#38b6ff").rect(28, 28, 30, 30).fill();
      doc.fillColor("#1b5597").rect(734, 28, 30, 30).fill();
      doc.fillColor("#1b5597").rect(28, 554, 30, 30).fill();
      doc.fillColor("#38b6ff").rect(734, 554, 30, 30).fill();

      // ✨ SECCIÓN LOGO: Foto de perfil o fallback vectorial
      if (fotoBuffer) {
        doc.save();
        // Creamos un recorte circular perfecto en el centro superior
        
        doc.image(fotoBuffer, centerX - 85, 50, { width: 170, height: 50 });
        doc.restore();
        doc.moveDown(5.2);
      } else {
        // Fallback al logo geométrico por si aún no has subido la foto
        doc.save();
        doc.translate(centerX - 25, 55); 
        doc.path('M 0 0 L 25 0 C 38 0 42 10 42 22 C 42 34 38 44 25 44 L 0 44 Z').fill('#4f46e5');
        doc.path('M 10 9 L 22 9 C 28 9 31 14 31 22 C 31 30 28 35 22 35 L 10 35 Z').fill('#ffffff');
        doc.path('M 46 22 L 52 15 L 58 22 L 52 29 Z').fill('#d97706');
        doc.restore();
        doc.moveDown(4.2);
      }

      // Nombre de la marca
      

      // Título
      doc.moveDown(1);
      doc.fillColor("#1e293b")
         .fontSize(28)
         .font("Helvetica-Bold")
         .text("CERTIFICADO DE COMPLETACIÓN", { align: "center" });

      // Línea divisoria
      doc.moveDown(0.4);
      doc.moveTo(280, doc.y).lineTo(512, doc.y).lineWidth(1.5).stroke("#d97706");

      // Texto Conector 1
      doc.moveDown(1.5);
      doc.fillColor("#64748b")
         .fontSize(14)
         .font("Helvetica")
         .text("Por cuanto se reconoce que el (la) estudiante:", { align: "center" });

      // Nombre del Estudiante
      doc.moveDown(1);
      doc.fillColor("#0f172a")
         .fontSize(26)
         .font("Helvetica-Bold")
         .text(studentName, { align: "center" });

      // Texto Conector 2
      doc.moveDown(1.2);
      doc.fillColor("#475569")
         .fontSize(14)
         .font("Helvetica")
         .text("Ha cumplido con éxito los requerimientos prácticos y el desarrollo técnico del proyecto:", { align: "center", lineGap: 4 });

      // Nombre del Proyecto
      doc.moveDown(0.8);
      doc.fillColor("#1b5597")
         .fontSize(18)
         .font("Helvetica-Bold")
         .text(`"${projectTitle}"`, { align: "center" });

      // ✨ SOLUCIÓN AL CENTRADO: Separamos las líneas y forzamos el centrado explícito
      doc.moveDown(0.8);
      doc.fillColor("#475569")
         .fontSize(13)
         .font("Helvetica")
         .text("En colaboración estratégica con la organización:", { align: "center" });
      
      doc.moveDown(0.2);
      doc.fillColor("#1e293b")
         .font("Helvetica-Bold")
         .text(pymeName, { align: "center" });

      // Fecha
      doc.moveDown(1.8);
      doc.fillColor("#64748b")
         .fontSize(11)
         .font("Helvetica-Oblique")
         .text(`El Salvador - ${formattedDate}.`, { align: "center" });

      // --- BLOQUE DE FIRMA ---
      doc.moveDown(3.5);
      const signatureY = doc.y;
      const lineWidth = 220;
      const startLineX = centerX - (lineWidth / 2);

      // ✨ SECCIÓN FIRMA: Renderiza la imagen si existe justo arriba de la línea
      if (firmaBuffer) {
        doc.image(firmaBuffer, centerX - 60, signatureY - 55, { width: 120 });
      }

      // Línea física para firmar
      doc.moveTo(startLineX, signatureY)
         .lineTo(startLineX + lineWidth, signatureY)
         .lineWidth(1)
         .stroke("#94a3b8");

      // Texto de la firma
      doc.fillColor("#1e293b")
         .fontSize(12)
         .font("Helvetica-Bold")
         .text("Rodrigo Campos Alvarenga", startLineX, signatureY + 8, { width: lineWidth, align: "center" });

      doc.fillColor("#64748b")
         .fontSize(9)
         .font("Helvetica")
         .text("Director & Fundador - Dexpert", startLineX, signatureY + 22, { width: lineWidth, align: "center" });

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