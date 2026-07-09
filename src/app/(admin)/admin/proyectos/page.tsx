'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { DateRangeFilter } from '@/components/admin/DateRangeFilter';
import { ExportButton } from '@/components/admin/ExportButton';
import { SectionHeader } from '@/components/admin/SectionHeader';
import { MetricChart } from '@/components/admin/MetricChart';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import type { ProjectSummary, TimeRange } from '@/lib/admin/types';

interface ProjectStatusCount {
  name: string;
  value: number;
  color: string;
}

interface ProjectWithActions extends ProjectSummary {
  flagged?: boolean;
}

export default function ProyectosPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [projects, setProjects] = useState<ProjectWithActions[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<ProjectStatusCount[]>([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [flaggedCount, setFlaggedCount] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/projects');
      const json = await res.json();
      const projList: any[] = json.projects || [];

      setTotalProjects(projList.length);
      setActiveCount(projList.filter((p) => p.status === 'in_progress' || p.status === 'open' || p.status === 'active').length);
      setFlaggedCount(projList.filter((p) => p.status === 'flagged').length);

      setStatusDistribution([
        { name: 'Abiertos', value: projList.filter((p) => p.status === 'open').length, color: '#38A3F1' },
        { name: 'Activos', value: projList.filter((p) => p.status === 'active').length, color: '#38A3F1' },
        { name: 'En Progreso', value: projList.filter((p) => p.status === 'in_progress').length, color: '#F59E0B' },
        { name: 'Completados', value: projList.filter((p) => p.status === 'completed').length, color: '#1D9E75' },
        { name: 'Cancelados', value: projList.filter((p) => p.status === 'cancelled' || p.status === 'closed').length, color: '#E24B4A' },
        { name: 'Flagged', value: projList.filter((p) => p.status === 'flagged').length, color: '#E24B4A' },
      ]);

      const summaryList: ProjectWithActions[] = projList.map((p: any) => ({
        id: p.id,
        title: p.title,
        companyName: p.pymes?.company_name || '',
        status: p.status || 'sin estado',
        applicationsCount: 0,
        acceptedCount: 0,
        createdAt: p.created_at,
        deadline: p.deadline,
        flagged: p.status === 'flagged',
      }));
      setProjects(summaryList);
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      setConfirmDelete(null);
      loadData();
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  }, [loadData]);

  const handleApprove = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/admin/projects/${id}/approve`, { method: 'POST' });
      if (!res.ok) throw new Error('Error al aprobar');
      loadData();
    } catch (err) {
      console.error('Error approving project:', err);
    }
  }, [loadData]);

  const columns: Column<ProjectWithActions>[] = [
    {
      key: 'title',
      header: 'Proyecto',
      sortable: true,
    },
    {
      key: 'companyName',
      header: 'Empresa',
      sortable: true,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (p) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={p.status} />
          {p.flagged && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Creado',
      sortable: true,
      render: (p) => (
        <span className="text-[#5B8DB8] text-xs">
          {new Date(p.createdAt).toLocaleDateString('es-SV', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      render: (p) => (
        <div className="flex items-center justify-end gap-1">
          {p.flagged && (
            <button
              onClick={(e) => { e.stopPropagation(); handleApprove(p.id); }}
              className="p-1.5 rounded-lg text-[#1D9E75] hover:bg-[#E1F5EE] transition-colors"
              title="Aprobar proyecto"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {confirmDelete === p.id ? (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-red-600 font-medium">¿Eliminar?</span>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                className="p-1.5 rounded-lg text-white bg-red-500 hover:bg-red-600 transition-colors text-[10px] font-bold px-2"
              >
                Sí
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmDelete(null); }}
                className="p-1.5 rounded-lg text-[#5B8DB8] hover:bg-[#F0F7FF] transition-colors text-[10px] px-2"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(p.id); }}
              className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Eliminar proyecto"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const flaggedProjects = projects.filter((p) => p.flagged);
  const cleanProjects = projects.filter((p) => !p.flagged);

  return (
    <div id="proyectos-page">
      <SectionHeader
        title="Gestión de Proyectos"
        description="Estado, progreso y moderación de proyectos"
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
              filename="proyectos"
              csvHeaders={['Proyecto', 'Empresa', 'Estado', 'Creado', 'Fecha Límite']}
              csvRows={projects.map((p) => [p.title, p.companyName, p.status, new Date(p.createdAt).toISOString(), p.deadline || ''])}
            />
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#E8F3FD] p-5">
          <p className="text-xs font-medium text-[#5B8DB8] uppercase tracking-wider mb-1">Total</p>
          <p className="text-2xl font-bold text-[#0D3A6E]">{totalProjects}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E8F3FD] p-5">
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wider mb-1">Activos</p>
          <p className="text-2xl font-bold text-[#0D3A6E]">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E8F3FD] p-5">
          <p className="text-xs font-medium text-[#1D9E75] uppercase tracking-wider mb-1">Completados</p>
          <p className="text-2xl font-bold text-[#0D3A6E]">
            {statusDistribution.find((s) => s.name === 'Completados')?.value || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-[#E8F3FD] p-5">
          <p className="text-xs font-medium text-[#38A3F1] uppercase tracking-wider mb-1">Abiertos</p>
          <p className="text-2xl font-bold text-[#0D3A6E]">
            {statusDistribution.find((s) => s.name === 'Abiertos' || s.name === 'Activos')?.value || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-[#E8F3FD] p-5">
          <p className="text-xs font-medium text-red-600 uppercase tracking-wider mb-1">Flagged</p>
          <p className="text-2xl font-bold text-[#0D3A6E]">{flaggedCount}</p>
        </div>
      </div>

      {/* Flagged Projects Section */}
      {flaggedProjects.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-semibold text-red-600">
              Proyectos Flagged — Requieren revisión ({flaggedProjects.length})
            </h3>
          </div>
          <DataTable
            columns={columns}
            data={flaggedProjects}
            loading={loading}
            searchable
            searchPlaceholder="Buscar proyecto flagged..."
            keyExtractor={(p) => p.id}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <MetricChart title="Distribución por Estado" data={statusDistribution} type="pie" loading={loading} />
        <div className="bg-white rounded-xl border border-[#E8F3FD] p-5">
          <h3 className="text-sm font-semibold text-[#0D3A6E] mb-4">Resumen de Proyectos</h3>
          {loading ? (
            <div className="space-y-3">
              {Array(6).fill(null).map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {statusDistribution.map((s) => (
                <div key={s.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-sm text-[#5B8DB8] flex-1">{s.name}</span>
                  <span className="text-sm font-semibold text-[#0D3A6E]">{s.value}</span>
                  <span className="text-xs text-[#93B8D4] w-12 text-right">
                    {totalProjects > 0 ? ((s.value / totalProjects) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              ))}
              <div className="h-px bg-[#E8F3FD] my-2" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#0D3A6E]">Total</span>
                <span className="text-sm font-bold text-[#0D3A6E]">{totalProjects}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* All Projects Table */}
      <DataTable
        columns={columns}
        data={cleanProjects}
        loading={loading}
        searchable
        searchPlaceholder="Buscar proyecto..."
        keyExtractor={(p) => p.id}
      />
    </div>
  );
}
