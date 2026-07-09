import { NextResponse } from 'next/server';
import { getAdminClientWithAudit } from '@/lib/admin-auth';

export async function GET() {
  const start = Date.now();

  const { client, error } = await getAdminClientWithAudit("admin_heartbeat");
  if (error) return error;
  const supabase = client!;

  const metrics: { name: string; value: number; unit: string }[] = [];

  // Uptime = 100% (service is responding)
  metrics.push({ name: 'uptime', value: 100, unit: 'percent' });

  // Response time
  const responseTime = Date.now() - start;
  metrics.push({ name: 'response_time', value: responseTime, unit: 'ms' });

  // Test DB connectivity
  const dbStart = Date.now();
  const { error: dbError } = await supabase.from('profiles').select('id').limit(1);
  if (dbError) {
    metrics.push({ name: 'db_error_count', value: 1, unit: 'count' });
  } else {
    const dbLatency = Date.now() - dbStart;
    metrics.push({ name: 'db_latency', value: dbLatency, unit: 'ms' });
    metrics.push({ name: 'db_error_count', value: 0, unit: 'count' });
  }

  // Record all metrics
  const records = metrics.map((m) => ({
    metric_name: m.name,
    metric_value: m.value,
    unit: m.unit,
    recorded_at: new Date().toISOString(),
  }));

  const { error: insertError } = await supabase.from('system_metrics').insert(records);
  if (insertError) {
    console.error('Error recording heartbeat metrics:', insertError);
  }

  return NextResponse.json({
    success: true,
    metrics: Object.fromEntries(metrics.map((m) => [m.name, m.value])),
  });
}
