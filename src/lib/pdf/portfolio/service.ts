import { ExportError, ERROR } from "./errors";
import { fetchPortfolioData } from "./repository";
import { renderPortfolioPDF } from "./renderer";
import { validateId } from "./validate";
import type { PortfolioData } from "./types";

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "portafolio"
  );
}

export interface ExportResult {
  pdf: Buffer;
  filename: string;
  studentName: string | null;
}

export async function generatePortfolioPDF(rawId: string): Promise<ExportResult> {
  const id = validateId(rawId);

  const data: PortfolioData = await fetchPortfolioData(id);
  const pdf: Buffer = await renderPortfolioPDF(data);

  return {
    pdf,
    filename: `${slugify(data.student.full_name ?? "portafolio")}-dexpert.pdf`,
    studentName: data.student.full_name,
  };
}

export { ExportError, ERROR };
