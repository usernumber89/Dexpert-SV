import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

async function writeAuditTrail(userId: string, action: string, metadata: Record<string, unknown> = {}) {
  try {
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await admin.from("audit_logs").insert({
      user_id: userId,
      action,
      entity_type: "admin_action",
      metadata,
    });
  } catch {
  }
}

export async function getAdminClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { client: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "ADMIN") {
    return { client: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  const client = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  return { client, error: null, user };
}

export async function getAdminClientWithAudit(action: string, metadata: Record<string, unknown> = {}) {
  const result = await getAdminClient();
  if (result.client && result.user) {
    await writeAuditTrail(result.user.id, action, metadata);
  }
  return result;
}

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { user, error: null };
}

export async function requirePymeOwner(userId: string) {
  const supabase = await createClient();
  const { data: pyme } = await supabase
    .from("pymes")
    .select("id")
    .eq("user_id", userId)
    .single();
  if (!pyme) return { pyme: null, error: NextResponse.json({ error: "Pyme not found" }, { status: 404 }) };
  return { pyme, error: null };
}
