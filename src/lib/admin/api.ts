import { createClient } from '@/lib/supabase/client';
import type {
  DashboardOverview,
  KpiMetric,
  ChartDataPoint,
  Transaction,
  AdminUser,
  AuditLogEntry,
  AlertConfig,
  AlertHistoryEntry,
  ProjectSummary,
  DateRange,
} from './types';

function calcChange(current: number, previous: number): { change: number; changeType: 'increase' | 'decrease' | 'neutral' } {
  if (previous === 0) return { change: current > 0 ? 100 : 0, changeType: current > 0 ? 'increase' : 'neutral' };
  const change = ((current - previous) / previous) * 100;
  return {
    change: Math.round(change * 100) / 100,
    changeType: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'neutral',
  };
}

function getDateRange(days: number): { now: Date; daysAgo: Date } {
  const now = new Date();
  return { now, daysAgo: new Date(now.getTime() - days * 86400000) };
}

function buildChartData(
  days: number,
  raw: { dateKey: string; value: number }[]
): ChartDataPoint[] {
  const daily: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - (days - i) * 86400000);
    daily[d.toISOString().split('T')[0]] = 0;
  }
  raw.forEach((r) => {
    if (daily[r.dateKey] !== undefined) daily[r.dateKey] += r.value;
  });
  return Object.entries(daily).map(([date, value]) => ({ date, value }));
}

export async function fetchDashboardOverview(dateRange?: DateRange): Promise<DashboardOverview> {
  const supabase = createClient();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000);

  const [{ data: allInvoices }, { data: recentInvoices }, { data: profiles }, { data: projects }, { data: snapshots }] = await Promise.all([
    supabase.from('invoices').select('amount, status').eq('status', 'paid'),
    supabase.from('invoices').select('amount, created_at, status').gte('created_at', sixtyDaysAgo.toISOString()),
    supabase.from('profiles').select('role, created_at'),
    supabase.from('projects').select('status'),
    supabase.from('daily_snapshots').select('*').order('snapshot_date', { ascending: false }).limit(60),
  ]);

  const allPaid = (allInvoices || []) as { amount: number }[];
  const revenue = allPaid.reduce((sum, i) => sum + Number(i.amount), 0);

  const paidRecent = ((recentInvoices || []) as { amount: number; created_at: string; status: string }[])
    .filter((i) => i.status === 'paid');
  const currentRevenue = paidRecent
    .filter((i) => new Date(i.created_at) >= thirtyDaysAgo)
    .reduce((sum, i) => sum + Number(i.amount), 0);
  const prevInvoices = paidRecent.filter(
    (i) => new Date(i.created_at) >= sixtyDaysAgo && new Date(i.created_at) < thirtyDaysAgo
  );
  const prevRevenue = prevInvoices.reduce((sum, i) => sum + Number(i.amount), 0);

  const profileList = (profiles || []) as { role: string; created_at: string }[];
  const students = profileList.filter((p) => p.role === 'STUDENT');
  const pymes = profileList.filter((p) => p.role === 'PYME');

  const projectList = (projects || []) as { status: string }[];
  const activeStatuses = ['active', 'in_progress', 'open'];
  const activeProjects = projectList.filter((p) => activeStatuses.includes(p.status)).length;

  const projectsByStatus = [
    { name: 'Activos', value: projectList.filter((p) => activeStatuses.includes(p.status)).length, color: '#38A3F1' },
    { name: 'Completados', value: projectList.filter((p) => p.status === 'completed').length, color: '#1D9E75' },
    { name: 'Cerrados', value: projectList.filter((p) => p.status === 'closed' || p.status === 'cancelled').length, color: '#93B8D4' },
  ];

  const snapshotList = (snapshots || []) as any[];
  const latest = snapshotList[0];

  // ---- Revenue Chart ----
  let revenueChart: ChartDataPoint[];
  if (snapshotList.length > 0) {
    const snapshotsData = [...snapshotList].reverse();
    revenueChart = snapshotsData.map((s: any) => ({
      date: s.snapshot_date,
      value: Number(s.total_revenue) || 0,
    }));
  } else {
    revenueChart = buildChartData(60, paidRecent.map((i) => ({
      dateKey: new Date(i.created_at).toISOString().split('T')[0],
      value: Number(i.amount),
    })));
  }

  // ---- Signups Chart ----
  let signupsChart: ChartDataPoint[];
  if (snapshotList.length > 0) {
    const snapshotsData = [...snapshotList].reverse();
    signupsChart = snapshotsData.map((s: any) => ({
      date: s.snapshot_date,
      value: s.new_signups || 0,
    }));
  } else {
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', sixtyDaysAgo.toISOString());

    signupsChart = buildChartData(60, ((allProfiles || []) as { created_at: string }[]).map((p) => ({
      dateKey: new Date(p.created_at).toISOString().split('T')[0],
      value: 1,
    })));
  }

  const toKpi = (label: string, value: number, prev: number, format: KpiMetric['format'] = 'number'): KpiMetric => ({
    id: label.toLowerCase().replace(/\s+/g, '_'),
    label,
    value,
    previousValue: prev,
    ...calcChange(value, prev),
    format,
  });

  return {
    revenue: toKpi('Ingresos Totales', revenue, 0, 'currency'),
    mrr: toKpi('MRR (30d)', currentRevenue, prevRevenue, 'currency'),
    totalStudents: toKpi('Estudiantes', students.length, students.length - (latest?.total_students || 0)),
    totalPymes: toKpi('PyMEs', pymes.length, pymes.length - (latest?.total_pymes || 0)),
    activeProjects: toKpi('Proyectos Activos', activeProjects, 0),
    conversionRate: toKpi('Tasa de Conversión', latest?.conversion_rate || 0, 0, 'percent'),
    retentionRate: toKpi('Retención', latest?.retention_rate || 0, 0, 'percent'),
    platformUptime: toKpi('Uptime', latest?.platform_uptime || 99.9, 100, 'percent'),
    revenueChart,
    signupsChart,
    projectsByStatus,
  };
}

export async function fetchTransactions(dateRange?: DateRange): Promise<{
  transactions: Transaction[];
  totalVolume: number;
  totalCount: number;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('invoices')
    .select('*, pymes!inner(company_name)')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;

  const transactions: Transaction[] = ((data || []) as any[]).map((inv: any) => ({
    id: inv.id,
    transactionId: inv.transaction_id || inv.id,
    amount: Number(inv.amount),
    plan: inv.plan,
    status: inv.status,
    companyName: inv.pymes?.company_name || inv.company_name || 'N/A',
    userEmail: '',
    createdAt: inv.created_at,
  }));

  return {
    transactions,
    totalVolume: transactions.reduce((s, t) => s + t.amount, 0),
    totalCount: transactions.length,
  };
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const supabase = createClient();
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, role, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const userIds = (profiles || []).map((p: any) => p.id);
  const studentIds = (profiles || []).filter((p: any) => p.role === 'STUDENT').map((p: any) => p.id);
  const pymeIds = (profiles || []).filter((p: any) => p.role === 'PYME').map((p: any) => p.id);

  const [{ data: studentsData }, { data: pymesData }] = await Promise.all([
    studentIds.length > 0
      ? supabase.from('students').select('user_id, full_name, email, avatar_url').in('user_id', studentIds)
      : Promise.resolve({ data: null }),
    pymeIds.length > 0
      ? supabase.from('pymes').select('user_id, company_name, logo_url').in('user_id', pymeIds)
      : Promise.resolve({ data: null }),
  ]);

  const students = (studentsData || []) as any[];
  const pymes = (pymesData || []) as any[];
  const studentMap = new Map(students.map((s: any) => [s.user_id, s]));
  const pymeMap = new Map(pymes.map((p: any) => [p.user_id, p]));

  return (profiles || []).map((p: any) => {
    const student = studentMap.get(p.id);
    const pyme = pymeMap.get(p.id);
    const displayName = student?.full_name || pyme?.company_name || student?.email || (p.role === 'PYME' ? 'PYME (perfil incompleto)' : 'Sin nombre');
    return {
      id: p.id,
      email: student?.email || '',
      fullName: displayName,
      role: p.role || 'PYME',
      avatarUrl: student?.avatar_url || pyme?.logo_url || null,
      createdAt: p.created_at,
      lastSignIn: null,
      isActive: true,
    };
  });
}

export async function updateUserRole(userId: string, newRole: 'STUDENT' | 'PYME' | 'ADMIN'): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
  if (error) throw error;
}

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) throw error;
  return (data || []).map((l: any) => ({
    id: l.id,
    userId: l.user_id,
    userEmail: '',
    action: l.action,
    entityType: l.entity_type,
    entityId: l.entity_id,
    metadata: l.metadata || {},
    ipAddress: l.ip_address,
    createdAt: l.created_at,
  }));
}

export async function fetchAlertConfigs(): Promise<AlertConfig[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from('alert_configs').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((a: any) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    metricKey: a.metric_key,
    condition: a.condition,
    threshold: Number(a.threshold),
    enabled: a.enabled,
    notifyEmail: a.notify_email || [],
    notifySlack: a.notify_slack,
    cooldownMin: a.cooldown_min,
    lastTriggeredAt: a.last_triggered_at,
  }));
}

export async function fetchAlertHistory(): Promise<AlertHistoryEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('alert_history')
    .select('*, alert_configs(name)')
    .order('triggered_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return (data || []).map((h: any) => ({
    id: h.id,
    alertConfigId: h.alert_config_id,
    alertName: h.alert_configs?.name || 'Unknown',
    metricValue: Number(h.metric_value),
    threshold: Number(h.threshold),
    condition: h.condition,
    triggeredAt: h.triggered_at,
    resolvedAt: h.resolved_at,
    status: h.status as any,
  }));
}

export async function fetchProjectsSummary(): Promise<ProjectSummary[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*, pymes!inner(company_name)')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return (data || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    companyName: p.pymes?.company_name || 'N/A',
    status: p.status,
    applicationsCount: 0,
    acceptedCount: 0,
    createdAt: p.created_at,
    deadline: p.deadline,
  }));
}

export async function fetchRevenueChart(days: number = 30): Promise<ChartDataPoint[]> {
  const supabase = createClient();
  const start = new Date(Date.now() - days * 86400000).toISOString();
  const { data, error } = await supabase
    .from('invoices')
    .select('amount, created_at')
    .gte('created_at', start)
    .eq('status', 'paid')
    .order('created_at', { ascending: true });

  if (error) throw error;

  const daily: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - (days - i) * 86400000);
    daily[d.toISOString().split('T')[0]] = 0;
  }

  const invList = (data || []) as { amount: number; created_at: string }[];
  invList.forEach((inv) => {
    const day = new Date(inv.created_at).toISOString().split('T')[0];
    if (daily[day] !== undefined) daily[day] += Number(inv.amount);
  });

  return Object.entries(daily).map(([date, value]) => ({ date, value }));
}

export async function createAlertConfig(config: Omit<AlertConfig, 'id' | 'lastTriggeredAt'>): Promise<AlertConfig> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('alert_configs')
    .insert({
      name: config.name,
      description: config.description,
      metric_key: config.metricKey,
      condition: config.condition,
      threshold: config.threshold,
      enabled: config.enabled,
      notify_email: config.notifyEmail,
      notify_slack: config.notifySlack,
      cooldown_min: config.cooldownMin,
    })
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    metricKey: data.metric_key,
    condition: data.condition,
    threshold: Number(data.threshold),
    enabled: data.enabled,
    notifyEmail: data.notify_email || [],
    notifySlack: data.notify_slack,
    cooldownMin: data.cooldown_min,
    lastTriggeredAt: data.last_triggered_at,
  };
}

export async function toggleAlertConfig(id: string, enabled: boolean): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('alert_configs').update({ enabled }).eq('id', id);
  if (error) throw error;
}

export async function deleteAlertConfig(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('alert_configs').delete().eq('id', id);
  if (error) throw error;
}

export async function acknowledgeAlert(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('alert_history').update({ status: 'acknowledged' }).eq('id', id);
  if (error) throw error;
}

export async function writeAuditLog(params: {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}): Promise<void> {
  const supabase = createClient();
  await supabase.from('audit_logs').insert({
    user_id: params.userId,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId,
    metadata: params.metadata || {},
    ip_address: params.ipAddress,
  });
}
