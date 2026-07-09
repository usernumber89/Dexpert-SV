export type TimeRange = '24h' | '7d' | '30d' | '90d' | '1y' | 'custom';

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export interface KpiMetric {
  id: string;
  label: string;
  value: number;
  previousValue: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  format?: 'currency' | 'number' | 'percent' | 'decimal';
  icon?: string;
  helpText?: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  secondary?: number;
  label?: string;
}

export interface Transaction {
  id: string;
  transactionId: string;
  amount: number;
  plan: string;
  status: string;
  companyName: string;
  userEmail: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'STUDENT' | 'PYME' | 'ADMIN';
  avatarUrl: string | null;
  createdAt: string;
  lastSignIn: string | null;
  isActive: boolean;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  createdAt: string;
}

export interface AlertConfig {
  id: string;
  name: string;
  description: string | null;
  metricKey: string;
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  enabled: boolean;
  notifyEmail: string[];
  notifySlack: string | null;
  cooldownMin: number;
  lastTriggeredAt: string | null;
}

export interface AlertHistoryEntry {
  id: string;
  alertConfigId: string;
  alertName: string;
  metricValue: number;
  threshold: number;
  condition: string;
  triggeredAt: string;
  resolvedAt: string | null;
  status: 'triggered' | 'acknowledged' | 'resolved';
}

export interface ProjectSummary {
  id: string;
  title: string;
  companyName: string;
  status: string;
  applicationsCount: number;
  acceptedCount: number;
  createdAt: string;
  deadline: string | null;
}

export interface DashboardOverview {
  revenue: KpiMetric;
  mrr: KpiMetric;
  totalStudents: KpiMetric;
  totalPymes: KpiMetric;
  activeProjects: KpiMetric;
  conversionRate: KpiMetric;
  retentionRate: KpiMetric;
  platformUptime: KpiMetric;
  revenueChart: ChartDataPoint[];
  signupsChart: ChartDataPoint[];
  projectsByStatus: { name: string; value: number; color: string }[];
}
