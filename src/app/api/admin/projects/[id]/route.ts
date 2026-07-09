import { NextResponse } from 'next/server';
import { getAdminClientWithAudit } from '@/lib/admin-auth';

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { client, error } = await getAdminClientWithAudit("admin_delete_project", { project_id: id });
  if (error) return error;

  const { error: dbError } = await client!.from('projects').delete().eq('id', id);
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
