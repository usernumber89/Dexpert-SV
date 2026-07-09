import { NextResponse } from 'next/server';
import { getAdminClientWithAudit } from '@/lib/admin-auth';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { client, error } = await getAdminClientWithAudit("admin_approve_project", { project_id: id });
  if (error) return error;

  const { error: dbError } = await client!
    .from('projects')
    .update({
      status: 'active',
      is_published: true,
    })
    .eq('id', id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
