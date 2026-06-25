import { NextResponse } from "next/server";
import { backfillExperience, backfillRealProjects } from "@/app/actions/simulation";

export async function GET() {
  const simResult = await backfillExperience();
  const realResult = await backfillRealProjects();
  return NextResponse.json({ simulations: simResult, realProjects: realResult });
}
