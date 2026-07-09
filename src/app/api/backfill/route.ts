import { NextResponse } from "next/server";
import { getAdminClientWithAudit } from "@/lib/admin-auth";
import { backfillExperience, backfillRealProjects } from "@/app/actions/simulation";

export async function GET() {
  const { client, error } = await getAdminClientWithAudit("admin_backfill");
  if (error) return error;

  const simResult = await backfillExperience();
  const realResult = await backfillRealProjects();
  return NextResponse.json({ simulations: simResult, realProjects: realResult });
}
