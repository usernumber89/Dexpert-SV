import PDFDocument from "pdfkit";
import type { PortfolioData } from "./types";

const C = {
  navy: "#0D3A6E",
  gold: "#B8924A",
  muted: "#7BA3C7",
  body: "#2C3E50",
  white: "#FFFFFF",
  subtleBorder: "#E8EFF5",
} as const;

const SB_W = 200;
const ML = 224;
const MR = 44;
const MW = 612 - ML - MR;
const PAGE_H = 792;

function drawSidebar(doc: PDFKit.PDFDocument, data: PortfolioData, pageH: number) {
  const { student, skills, certificates } = data;

  doc.rect(0, 0, SB_W, pageH).fill(C.navy);

  let y = 36;

  const initial = (student.full_name ?? "?").charAt(0).toUpperCase();
  doc.circle(SB_W / 2, y + 22, 24).fillColor(C.gold).fill();
  doc.font("Helvetica-Bold").fontSize(18).fillColor(C.white)
    .text(initial, SB_W / 2 - 6, y + 8);

  y += 60;

  doc.font("Helvetica-Bold").fontSize(10).fillColor(C.white)
    .text(student.full_name ?? "", 18, y, { width: SB_W - 36, align: "center" });
  y = doc.y + 8;

  const titleLine = [student.major, student.university].filter(Boolean).join(" — ");
  if (titleLine) {
    doc.font("Helvetica").fontSize(8).fillColor(C.white).opacity(0.65)
      .text(titleLine, 18, y, { width: SB_W - 36, align: "center" });
    y = doc.y + 4;
  }

  if (student.location) {
    doc.font("Helvetica").fontSize(8).fillColor(C.white).opacity(0.5)
      .text(student.location, 18, y, { width: SB_W - 36, align: "center" });
    y = doc.y + 4;
  }

  y += 16;

  // Separator
  doc.rect(28, y, SB_W - 56, 0.5).fill(C.gold).opacity(0.4);
  y += 14;

  // Contact section
  doc.font("Helvetica-Bold").fontSize(8).fillColor(C.gold)
    .text("CONTACTO", 18, y, { characterSpacing: 1.2 });
  y += 14;

  const contactItems = [
    student.email && `${student.email}`,
    student.location && `${student.location}`,
  ].filter(Boolean) as string[];

  for (const item of contactItems) {
    doc.font("Helvetica").fontSize(8).fillColor(C.white).opacity(0.75)
      .text(item, 18, y, { width: SB_W - 36 });
    y = doc.y + 4;
  }

  y += 8;
  doc.rect(28, y, SB_W - 56, 0.5).fill(C.gold).opacity(0.4);
  y += 14;

  if (skills.length) {
    doc.font("Helvetica-Bold").fontSize(8).fillColor(C.gold)
      .text("HABILIDADES", 18, y, { characterSpacing: 1.2 });
    y += 14;

    for (const skill of skills) {
      doc.font("Helvetica").fontSize(8).fillColor(C.white).opacity(0.8)
        .text(`- ${skill}`, 18, y, { width: SB_W - 36, lineGap: 4 });
      y = doc.y + 2;
      if (y > pageH - 60) break;
    }
    y += 10;
  }

  if (certificates.length) {
    if (y > pageH - 100) y = pageH - 100;
    doc.rect(28, y, SB_W - 56, 0.5).fill(C.gold).opacity(0.4);
    y += 14;

    doc.font("Helvetica-Bold").fontSize(8).fillColor(C.gold)
      .text("CERTIFICADOS", 18, y, { characterSpacing: 1.2 });
    y += 14;

    for (const cert of certificates) {
      const app = (cert as Record<string, unknown>).applications as Record<string, unknown> | undefined;
      const project = app?.project as Record<string, unknown> | undefined;
      const title = project?.title ?? "Certificado";
      const company = ((project?.pyme as Record<string, unknown> | undefined)?.company_name as string) ?? "";
      const line = [title, company].filter(Boolean).join(" — ");

      doc.font("Helvetica").fontSize(7.5).fillColor(C.white).opacity(0.75)
        .text(`- ${line}`, 18, y, { width: SB_W - 36, lineGap: 4 });
      y = doc.y + 2;
      if (y > pageH - 40) break;
    }
  }
}

function drawFooter(doc: PDFKit.PDFDocument) {
  doc.font("Helvetica").fontSize(7).fillColor(C.muted).opacity(0.4)
    .text("Generado por Dexpert — Portafolio profesional", ML, PAGE_H - 28, { width: MW, align: "center" });
}

function mainHeader(doc: PDFKit.PDFDocument, data: PortfolioData) {
  const { student } = data;

  doc.font("Helvetica-Bold").fontSize(30).fillColor(C.navy)
    .text(student.full_name ?? "", ML, 32);

  const titleLine = [student.major, student.university].filter(Boolean).join(" — ");
  if (titleLine) {
    doc.font("Helvetica").fontSize(11).fillColor(C.muted)
      .text(titleLine, ML, doc.y + 6);
  }

  if (student.location) {
    doc.font("Helvetica").fontSize(9).fillColor(C.muted)
      .text(student.location, ML, doc.y + 4);
  }

  doc.rect(ML, doc.y + 12, 36, 2).fill(C.gold);
}

function sectionHeading(doc: PDFKit.PDFDocument, text: string, y: number): number {
  doc.font("Helvetica-Bold").fontSize(10).fillColor(C.navy)
    .text(text.toUpperCase(), ML, y, { characterSpacing: 1.2 });
  const lineY = doc.y + 3;
  doc.rect(ML, lineY, 28, 2).fill(C.gold);
  return lineY + 14;
}

function bodyText(doc: PDFKit.PDFDocument, text: string, y: number) {
  doc.font("Helvetica").fontSize(9.5).fillColor(C.body)
    .text(text, ML, y, { width: MW, lineGap: 5, align: "justify" });
  return doc.y + 12;
}

function checkPage(doc: PDFKit.PDFDocument, y: number, data: PortfolioData): number {
  if (y > PAGE_H - 110) {
    doc.addPage();
    drawSidebar(doc, data, PAGE_H);
    return 56;
  }
  return y;
}

function drawMain(doc: PDFKit.PDFDocument, data: PortfolioData): number {
  const { student, entries, education, experience } = data;

  mainHeader(doc, data);
  let y = doc.y + 20;

  const bio = student.about_me ?? student.bio;
  if (bio) {
    y = sectionHeading(doc, "Sobre mí", y);
    y = bodyText(doc, bio, y);
    y += 4;
  }

  if (experience.length) {
    y = checkPage(doc, y, data);
    y = sectionHeading(doc, "Experiencia", y);

    for (const exp of experience as Array<Record<string, unknown>>) {
      y = checkPage(doc, y, data);

      doc.font("Helvetica-Bold").fontSize(11).fillColor(C.navy)
        .text([exp.role, exp.company].filter(Boolean).join(" · "), ML, y, { width: MW });
      y = doc.y + 2;

      const dates = [exp.start_date, exp.end_date].filter(Boolean).join(" — ");
      if (dates) {
        doc.font("Helvetica").fontSize(8).fillColor(C.muted)
          .text(dates, ML, y, { width: MW });
        y = doc.y + 2;
      }

      if (exp.description) {
        doc.font("Helvetica").fontSize(9).fillColor(C.body)
          .text(exp.description as string, ML, y, { width: MW, lineGap: 3 });
        y = doc.y + 4;
      }

      if (Array.isArray(exp.tools) && (exp.tools as string[]).length) {
        doc.font("Helvetica-Oblique").fontSize(7.5).fillColor(C.muted)
          .text(`Herramientas: ${(exp.tools as string[]).join(", ")}`, ML, y, { width: MW });
        y = doc.y + 4;
      }

      y += 4;
      doc.rect(ML, y, MW, 0.5).fill(C.subtleBorder);
      y += 10;
    }
  }

  if (education.length) {
    y = checkPage(doc, y, data);
    y = sectionHeading(doc, "Formación", y);

    for (const edu of education as Array<Record<string, unknown>>) {
      y = checkPage(doc, y, data);

      doc.font("Helvetica-Bold").fontSize(11).fillColor(C.navy)
        .text([edu.degree, edu.field ? `en ${edu.field}` : ""].filter(Boolean).join(" "), ML, y, { width: MW });
      y = doc.y + 2;

      doc.font("Helvetica").fontSize(9).fillColor(C.muted)
        .text(edu.institution as string, ML, y, { width: MW });
      y = doc.y + 2;

      const dates = [edu.start_date, edu.end_date].filter(Boolean).join(" — ");
      if (dates) {
        doc.font("Helvetica").fontSize(8).fillColor(C.muted)
          .text(dates, ML, y, { width: MW });
        y = doc.y + 2;
      }

      if (edu.description) {
        doc.font("Helvetica").fontSize(9).fillColor(C.body)
          .text(edu.description as string, ML, y, { width: MW, lineGap: 3 });
        y = doc.y + 4;
      }

      y += 4;
      doc.rect(ML, y, MW, 0.5).fill(C.subtleBorder);
      y += 10;
    }
  }

  if (entries.length) {
    y = checkPage(doc, y, data);
    y = sectionHeading(doc, "Proyectos", y);

    for (const entry of entries) {
      y = checkPage(doc, y, data);

      doc.font("Helvetica-Bold").fontSize(11).fillColor(C.navy)
        .text(entry.title, ML, y, { width: MW });
      y = doc.y + 3;

      const tools: string[] = Array.isArray(entry.tools_used) ? entry.tools_used : [];
      if (tools.length) {
        doc.font("Helvetica").fontSize(7.5).fillColor(C.muted)
          .text(tools.join(", "), ML, y, { width: MW });
        y = doc.y + 3;
      }

      const desc = entry.custom_description;
      if (desc) {
        doc.font("Helvetica").fontSize(9).fillColor(C.body)
          .text(desc, ML, y, { width: MW, lineGap: 3 });
        y = doc.y + 4;
      }

      if (entry.completed_at) {
        const d = new Date(entry.completed_at);
        doc.font("Helvetica-Oblique").fontSize(7.5).fillColor(C.muted)
          .text(`Finalizado: ${d.toLocaleDateString("es-SV", { year: "numeric", month: "long" })}`, ML, y, { width: MW });
        y = doc.y + 2;
      }

      y += 6;
      doc.rect(ML, y, MW, 0.5).fill(C.subtleBorder);
      y += 10;
    }
  }

  return y;
}

export function renderPortfolioPDF(data: PortfolioData): Promise<Buffer> {
  const doc = new PDFDocument({
    size: "LETTER",
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  drawSidebar(doc, data, PAGE_H);
  drawMain(doc, data);
  drawFooter(doc);

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}