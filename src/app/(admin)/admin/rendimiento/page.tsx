'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Activity, Clock, AlertTriangle, Server, Database, Wifi } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { SectionHeader } from '@/components/admin/SectionHeader';
import { MetricChart } from '@/components/admin/MetricChart';
import { RealtimeIndicator } from '@/components/admin/RealtimeIndicator';
import type { ChartDataPoint } from '@/lib/admin/types';

export default function RendimientoPage() {
  const [loading, setLoading] = useState(true);
  const [uptimeChart, setUptimeChart] = useState<ChartDataPoint[]>([]);
  const [latencyChart, setLatencyChart] = useState<ChartDataPoint[]>([]);
  const [latestUptime, setLatestUptime] = useState(99.9);
  const [avgResponseTime, setAvgResponseTime] = useState(0);
  const [latestDbLatency, setLatestDbLatency] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [totalHeartbeats, setTotalHeartbeats] = useState(0);

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: systemMetrics } = await supabase
        .from('system_metrics')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(2000);

      const sm = (systemMetrics || []) as any[];

      // Uptime points (reverse for chronological order)
      const uptimePoints = sm
        .filter((m: any) => m.metric_name === 'uptime')
        .reverse()
        .slice(-60)
        .map((m: any) => ({
          date: new Date(m.recorded_at).toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' }),
          value: Number(m.metric_value),
        }));

      // DB Latency
      const latencyPoints = sm
        .filter((m: any) => m.metric_name === 'db_latency')
        .reverse()
        .slice(-60)
        .map((m: any) => ({
          date: new Date(m.recorded_at).toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' }),
          value: Number(m.metric_value),
        }));

      // Latest values
      const latestUptimeVal = uptimePoints[uptimePoints.length - 1]?.value ?? 99.9;
      const errors = sm.filter((m: any) => m.metric_name === 'db_error_count');
      const latestErrors = Number(errors[0]?.metric_value || 0);
      const responseTimes = sm.filter((m: any) => m.metric_name === 'response_time');
      const avgTime = responseTimes.length > 0
        ? responseTimes.reduce((s: number, m: any) => s + Number(m.metric_value), 0) / responseTimes.length
        : 0;
      const dbLatency = latencyPoints[latencyPoints.length - 1]?.value ?? 0;

      setUptimeChart(uptimePoints);
      setLatencyChart(latencyPoints);
      setLatestUptime(latestUptimeVal);
      setAvgResponseTime(Math.round(avgTime * 10) / 10);
      setLatestDbLatency(Math.round(dbLatency));
      setErrorCount(latestErrors);
      setTotalHeartbeats(sm.filter((m: any) => m.metric_name === 'uptime').length);
    } catch (err) {
      console.error('Error loading performance data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Record one heartbeat on mount
    fetch('/api/admin/heartbeat').catch(() => {});
    loadMetrics();
    const interval = setInterval(loadMetrics, 60000);
    return () => clearInterval(interval);
  }, [loadMetrics]);

  const metricCards = [
    {
      label: 'Uptime',
      value: `${latestUptime.toFixed(2)}%`,
      icon: <Wifi className="w-5 h-5" />,
      color: latestUptime >= 99 ? 'text-[#1D9E75]' : 'text-amber-600',
      bg: latestUptime >= 99 ? 'bg-[#E1F5EE]' : 'bg-amber-50',
    },
    {
      label: 'Tiempo Respuesta',
      value: `${avgResponseTime.toFixed(0)}ms`,
      icon: <Clock className="w-5 h-5" />,
      color: avgResponseTime < 500 ? 'text-[#1D9E75]' : avgResponseTime < 1000 ? 'text-amber-600' : 'text-red-500',
      bg: avgResponseTime < 500 ? 'bg-[#E1F5EE]' : avgResponseTime < 1000 ? 'bg-amber-50' : 'bg-red-50',
    },
    {
      label: 'Latencia BD',
      value: `${latestDbLatency}ms`,
      icon: <Database className="w-5 h-5" />,
      color: latestDbLatency < 50 ? 'text-[#1D9E75]' : latestDbLatency < 200 ? 'text-amber-600' : 'text-red-500',
      bg: latestDbLatency < 50 ? 'bg-[#E1F5EE]' : latestDbLatency < 200 ? 'bg-amber-50' : 'bg-red-50',
    },
    {
      label: 'Errores (24h)',
      value: String(errorCount),
      icon: <AlertTriangle className="w-5 h-5" />,
      color: errorCount === 0 ? 'text-[#1D9E75]' : 'text-red-500',
      bg: errorCount === 0 ? 'bg-[#E1F5EE]' : 'bg-red-50',
    },
  ];

  const resourceMetrics = [
    { label: 'Heartbeats Registrados', value: String(totalHeartbeats) },
    { label: 'Avg Response Time', value: `${avgResponseTime.toFixed(0)}ms` },
    { label: 'Última Latencia BD', value: `${latestDbLatency}ms` },
    { label: 'Estado del Servicio', value: latestUptime >= 99 ? 'Saludable' : 'Degradado' },
  ];

  return (
    <div>
      <SectionHeader
        title="Rendimiento de Plataforma"
        description="Uptime, latencia, errores y monitoreo en tiempo real"
        actions={
          <div className="flex items-center gap-2">
            <RealtimeIndicator table="system_metrics" onUpdate={loadMetrics} />
            <button
              onClick={loadMetrics}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-[#E8F3FD] rounded-lg text-[#0D3A6E] hover:bg-[#F0F7FF] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? Array(4).fill(null).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E8F3FD] p-5 animate-pulse">
            <div className="h-10 w-10 bg-gray-200 rounded-lg mb-3" />
            <div className="h-4 bg-gray-200 rounded w-16 mb-2" />
            <div className="h-6 bg-gray-200 rounded w-24" />
          </div>
        )) : metricCards.map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-[#E8F3FD] p-5">
            <div className={`w-10 h-10 rounded-lg ${m.bg} flex items-center justify-center ${m.color} mb-3`}>
              {m.icon}
            </div>
            <p className="text-xs font-medium text-[#5B8DB8] uppercase tracking-wider mb-1">{m.label}</p>
            <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <MetricChart
          title="Uptime (%)"
          data={uptimeChart}
          type="area"
          loading={loading}
          formatValue={(v) => `${v.toFixed(2)}%`}
          height={280}
        />
        <MetricChart
          title="Latencia BD (ms)"
          data={latencyChart}
          type="line"
          loading={loading}
          formatValue={(v) => `${v.toFixed(0)}ms`}
          height={280}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E8F3FD] p-5">
          <h3 className="text-sm font-semibold text-[#0D3A6E] mb-4">
            <Activity className="w-4 h-4 inline mr-1.5 text-[#38A3F1]" />
            Resumen de Monitoreo
          </h3>
          {loading ? (
            <div className="space-y-3">
              {Array(4).fill(null).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {resourceMetrics.map((m) => (
                <div key={m.label} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-[#F0F7FF]/50">
                  <span className="text-sm text-[#5B8DB8]">{m.label}</span>
                  <span className="text-sm font-semibold text-[#0D3A6E]">{m.value}</span>
                </div>
              ))}
              <p className="text-[10px] text-[#93B8D4] pt-2 text-center">
                Los heartbeats se registran cada 60s mientras el dashboard esté abierto.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[#E8F3FD] p-5">
          <h3 className="text-sm font-semibold text-[#0D3A6E] mb-4">
            <Server className="w-4 h-4 inline mr-1.5 text-[#38A3F1]" />
            Estado del Servicio
          </h3>
          {loading ? (
            <div className="space-y-3">
              {Array(4).fill(null).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#E1F5EE]">
                <div className="w-10 h-10 rounded-full bg-[#1D9E75]/20 flex items-center justify-center">
                  <Server className="w-5 h-5 text-[#1D9E75]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1D9E75]">
                    {latestUptime >= 99 ? 'Sistema Saludable' : 'Sistema Degradado'}
                  </p>
                  <p className="text-xs text-[#5B8DB8]">
                    {latestUptime >= 99
                      ? 'Todos los servicios operan normalmente'
                      : 'Se detectaron anomalías en el servicio'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[#5B8DB8]">
                  <span>API Response Time</span>
                  <span className={avgResponseTime < 500 ? 'text-[#1D9E75]' : 'text-amber-600'}>
                    {avgResponseTime.toFixed(0)}ms
                  </span>
                </div>
                <div className="h-2 bg-[#F0F7FF] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${avgResponseTime < 500 ? 'bg-[#1D9E75]' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min((avgResponseTime / 1000) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[#5B8DB8]">
                  <span>Latencia Base de Datos</span>
                  <span className={latestDbLatency < 50 ? 'text-[#1D9E75]' : 'text-amber-600'}>
                    {latestDbLatency}ms
                  </span>
                </div>
                <div className="h-2 bg-[#F0F7FF] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${latestDbLatency < 50 ? 'bg-[#1D9E75]' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min((latestDbLatency / 200) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[#5B8DB8]">
                  <span>Uptime</span>
                  <span className="text-[#1D9E75]">{latestUptime.toFixed(2)}%</span>
                </div>
                <div className="h-2 bg-[#F0F7FF] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#1D9E75]"
                    style={{ width: `${latestUptime}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
