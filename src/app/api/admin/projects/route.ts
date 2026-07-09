import { NextResponse } from 'next/server';
import { getAdminClientWithAudit } from '@/lib/admin-auth';

export async function GET() {
  const { client, error } = await getAdminClientWithAudit("admin_list_projects");
  if (error) return error;

  const { data, error: dbError } = await client!
    .from('projects')
    .select('*, pymes(company_name)')
    .order('created_at', { ascending: false });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ projects: data || [] });
}
