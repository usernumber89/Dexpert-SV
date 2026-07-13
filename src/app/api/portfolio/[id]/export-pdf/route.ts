import { NextRequest, NextResponse } from "next/server";
import { generatePortfolioPDF, ExportError, ERROR } from "@/lib/pdf/portfolio/service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await generatePortfolioPDF(id);

    const pdf = new Uint8Array(result.pdf.buffer as ArrayBuffer, result.pdf.byteOffset, result.pdf.byteLength);

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${result.filename}"`,
        "Content-Length": String(pdf.byteLength),
      },
    });
  } catch (err) {
    if (err instanceof ExportError) {
      return NextResponse.json({ error: err.code, message: err.message }, { status: err.status });
    }
    console.error("Unhandled PDF export error:", err);
    return NextResponse.json({ error: ERROR.INTERNAL, message: "PDF generation failed" }, { status: 500 });
  }
}
