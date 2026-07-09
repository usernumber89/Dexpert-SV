'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { fetchDashboardOverview } from '@/lib/admin/api';
import { DateRangeFilter } from '@/components/admin/DateRangeFilter';
import { ExportButton } from '@/components/admin/ExportButton';
import { SectionHeader } from '@/components/admin/SectionHeader';
import { KpiCard } from '@/components/admin/KpiCard';
import { MetricChart } from '@/components/admin/MetricChart';
import { RealtimeIndicator } from '@/components/admin/RealtimeIndicator';
import type { DashboardOverview, TimeRange } from '@/lib/admin/types';

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchDashboardOverview();
      setData(result);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const fallbackMetric = (id: string, label: string) => ({ id, label, value: 0, previousValue: 0, change: 0, changeType: 'neutral' as const });
  const kpiCards = data
    ? [
        data.revenue,
        data.mrr,
        data.totalStudents,
        data.totalPymes,
        data.activeProjects,
        data.conversionRate,
        data.retentionRate,
        data.platformUptime,
      ]
    : [
        fallbackMetric('revenue', 'Ingresos Totales'),
        fallbackMetric('mrr', 'MRR'),
        fallbackMetric('students', 'Estudiantes'),
        fallbackMetric('pymes', 'PyMEs'),
        fallbackMetric('active_projects', 'Proyectos Activos'),
        fallbackMetric('conversion', 'Tasa de Conversión'),
        fallbackMetric('retention', 'Retención'),
        fallbackMetric('uptime', 'Uptime'),
      ];

  return (
    <div>
      <SectionHeader
        title="Panel de Control"
        description="Resumen ejecutivo de los KPIs principales de Dexpert"
        actions={
          <>
            <RealtimeIndicator table="daily_snapshots" onUpdate={loadData} />
            <DateRangeFilter value={timeRange} onChange={setTimeRange} />
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-[#E8F3FD] rounded-lg text-[#0D3A6E] hover:bg-[#F0F7FF] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            <ExportButton
              filename="dashboard-overview"
              csvHeaders={['Métrica', 'Valor', 'Cambio (%)']}
              csvRows={
                data
                  ? [
                      ['Ingresos Totales', String(data.revenue.value), String(data.revenue.change)],
                      ['MRR', String(data.mrr.value), String(data.mrr.change)],
                      ['Estudiantes', String(data.totalStudents.value), String(data.totalStudents.change)],
                      ['PyMEs', String(data.totalPymes.value), String(data.totalPymes.change)],
                      ['Proyectos Activos', String(data.activeProjects.value), String(data.activeProjects.change)],
                      ['Tasa de Conversión', String(data.conversionRate.value), String(data.conversionRate.change)],
                      ['Retención', String(data.retentionRate.value), String(data.retentionRate.change)],
                      ['Uptime', String(data.platformUptime.value), String(data.platformUptime.change)],
                    ]
                  : []
              }
            />
          </>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiCards.map((metric: any, idx) => (
          <KpiCard key={idx} metric={metric} loading={loading} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <MetricChart
          title="Ingresos (últimos 60 días)"
          data={data?.revenueChart || []}
          type="area"
          loading={loading}
          formatValue={(v) => `$${v.toLocaleString()}`}
        />
        <MetricChart
          title="Nuevos Registros"
          data={data?.signupsChart || []}
          type="bar"
          loading={loading}
        />
      </div>

      {/* Project Status Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MetricChart
          title="Estado de Proyectos"
          data={data?.projectsByStatus || []}
          type="pie"
          loading={loading}
        />
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E8F3FD] p-5">
          <h3 className="text-sm font-semibold text-[#0D3A6E] mb-4">Resumen Rápido</h3>
          {loading ? (
            <div className="space-y-3">
              {Array(4).fill(null).map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#E1F5EE] rounded-lg">
                <span className="text-sm text-[#1D9E75] font-medium">Ingresos Totales</span>
                <span className="text-sm font-bold text-[#0D3A6E]">
                  ${data?.revenue.value.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#F0F7FF] rounded-lg">
                <span className="text-sm text-[#38A3F1] font-medium">Estudiantes Registrados</span>
                <span className="text-sm font-bold text-[#0D3A6E]">
                  {data?.totalStudents.value.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <span className="text-sm text-amber-600 font-medium">PyMEs Activas</span>
                <span className="text-sm font-bold text-[#0D3A6E]">
                  {data?.totalPymes.value.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm text-purple-600 font-medium">Proyectos Activos</span>
                <span className="text-sm font-bold text-[#0D3A6E]">
                  {data?.activeProjects.value.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
