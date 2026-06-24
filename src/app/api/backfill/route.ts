import { NextResponse } from "next/server";
import { backfillExperience } from "@/app/actions/simulation";

export async function GET() {
  const result = await backfillExperience();
  return NextResponse.json(result);
}
