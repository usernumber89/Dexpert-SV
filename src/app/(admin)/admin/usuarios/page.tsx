'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { fetchDashboardOverview } from '@/lib/admin/api';
import { DateRangeFilter } from '@/components/admin/DateRangeFilter';
import { ExportButton } from '@/components/admin/ExportButton';
import { SectionHeader } from '@/components/admin/SectionHeader';
import { KpiCard } from '@/components/admin/KpiCard';
import { MetricChart } from '@/components/admin/MetricChart';
import type { TimeRange, ChartDataPoint, DashboardOverview } from '@/lib/admin/types';

export default function UsuariosPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [signupsChart, setSignupsChart] = useState<ChartDataPoint[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [pymeCount, setPymeCount] = useState(0);
  const [recentSignups, setRecentSignups] = useState<{ id: string; role: string; created_at: string; displayName: string }[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const [{ data: profiles }, ov] = await Promise.all([
        supabase.from('profiles').select('id, role, created_at').order('created_at', { ascending: false }),
        fetchDashboardOverview(),
      ]);
      setOverview(ov);

      const profileList = ((profiles || []) as { id: string; role: string; created_at: string }[]);
      const students = profileList.filter((p) => p.role === 'STUDENT');
      const pymes = profileList.filter((p) => p.role === 'PYME');
      setStudentCount(students.length);
      setPymeCount(pymes.length);

      const recent = profileList.slice(0, 20);
      const studentIds = recent.filter((p) => p.role === 'STUDENT').map((p) => p.id);
      const pymeIds = recent.filter((p) => p.role === 'PYME').map((p) => p.id);

      const [{ data: sData }, { data: pData }] = await Promise.all([
        studentIds.length > 0
          ? supabase.from('students').select('user_id, full_name').in('user_id', studentIds)
          : Promise.resolve({ data: [] }),
        pymeIds.length > 0
          ? supabase.from('pymes').select('user_id, company_name').in('user_id', pymeIds)
          : Promise.resolve({ data: [] }),
      ]);

      const nameMap = new Map<string, string>();
      (sData || []).forEach((s: any) => nameMap.set(s.user_id, s.full_name));
      (pData || []).forEach((p: any) => nameMap.set(p.user_id, p.company_name));

      setRecentSignups(recent.map((p) => ({
        id: p.id,
        role: p.role,
        created_at: p.created_at,
        displayName: nameMap.get(p.id) || p.id.slice(0, 8),
      })));

      setSignupsChart(ov?.signupsChart || []);

      const daily: Record<string, number> = {};
      profileList.forEach((p) => {
        const day = new Date(p.created_at).toISOString().split('T')[0];
        daily[day] = (daily[day] || 0) + 1;
      });
      const chartData = Object.entries(daily)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-60)
        .map(([date, value]) => ({ date, value }));
      setSignupsChart(chartData);
    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div id="usuarios-page">
      <SectionHeader
        title="Crecimiento de Usuarios"
        description="Estudiantes, PyMEs y métricas de retención"
        actions={
          <>
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
              filename="usuarios"
              csvHeaders={['Tipo', 'Cantidad']}
              csvRows={[
                ['Estudiantes', String(studentCount)],
                ['PyMEs', String(pymeCount)],
              ]}
            />
          </>
        }
      />

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          metric={{
            id: 'students',
            label: 'Estudiantes',
            value: studentCount,
            previousValue: 0,
            change: 0,
            changeType: 'neutral',
          }}
          loading={loading}
        />
        <KpiCard
          metric={{
            id: 'pymes',
            label: 'PyMEs',
            value: pymeCount,
            previousValue: 0,
            change: 0,
            changeType: 'neutral',
          }}
          loading={loading}
        />
        <KpiCard
          metric={
            overview?.retentionRate || {
              id: 'retention',
              label: 'Retención',
              value: 0,
              previousValue: 0,
              change: 0,
              changeType: 'neutral',
              format: 'percent',
            }
          }
          loading={loading}
        />
        <KpiCard
          metric={{
            id: 'total',
            label: 'Total Usuarios',
            value: studentCount + pymeCount,
            previousValue: 0,
            change: 0,
            changeType: 'neutral',
          }}
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <MetricChart
          title="Nuevos Registros (diario)"
          data={signupsChart}
          type="bar"
          loading={loading}
        />
        <MetricChart
          title="Crecimiento Acumulado"
          data={signupsChart.reduce<ChartDataPoint[]>((acc, point, idx) => {
            const prev = acc[idx - 1]?.value || 0;
            acc.push({ date: point.date, value: prev + point.value });
            return acc;
          }, [])}
          type="area"
          loading={loading}
        />
      </div>

      {/* Recent signups */}
      <div className="bg-white rounded-xl border border-[#E8F3FD] p-5">
        <h3 className="text-sm font-semibold text-[#0D3A6E] mb-4">Registros Recientes</h3>
        {loading ? (
          <div className="space-y-2">
            {Array(5).fill(null).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {recentSignups.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#F0F7FF] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    profile.role === 'STUDENT' ? 'bg-[#F0F7FF] text-[#38A3F1]' : profile.role === 'PYME' ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-600'
                  }`}>
                    {profile.role === 'STUDENT' ? 'S' : profile.role === 'PYME' ? 'P' : 'A'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0D3A6E]">{profile.displayName}</p>
                    <p className="text-[10px] text-[#93B8D4] capitalize">{profile.role?.toLowerCase() || 'sin rol'}</p>
                  </div>
                </div>
                <span className="text-[10px] text-[#93B8D4]">
                  {new Date(profile.created_at).toLocaleDateString('es-SV', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
