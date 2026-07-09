'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { fetchAuditLogs } from '@/lib/admin/api';
import { SectionHeader } from '@/components/admin/SectionHeader';
import { DataTable, type Column } from '@/components/admin/DataTable';
import type { AuditLogEntry } from '@/lib/admin/types';

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Error loading audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const columns: Column<AuditLogEntry>[] = [
    {
      key: 'action',
      header: 'Acción',
      sortable: true,
      render: (l) => (
        <span className="font-mono text-xs bg-[#F0F7FF] px-2 py-0.5 rounded text-[#0D3A6E]">
          {l.action}
        </span>
      ),
    },
    {
      key: 'entityType',
      header: 'Entidad',
      sortable: true,
      render: (l) => (
        <span className="text-xs text-[#5B8DB8]">{l.entityType}</span>
      ),
    },
    {
      key: 'entityId',
      header: 'ID Entidad',
      render: (l) => (
        <span className="text-[10px] font-mono text-[#93B8D4]">
          {l.entityId ? l.entityId.slice(0, 12) + '...' : '-'}
        </span>
      ),
    },
    {
      key: 'ipAddress',
      header: 'IP',
      render: (l) => (
        <span className="text-xs text-[#93B8D4]">{l.ipAddress || '-'}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Fecha',
      sortable: true,
      render: (l) => (
        <span className="text-xs text-[#5B8DB8]">
          {new Date(l.createdAt).toLocaleString('es-SV', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
  ];

  return (
    <div>
      <SectionHeader
        title="Auditoría"
        description="Historial de acciones críticas en la plataforma"
        actions={
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-[#E8F3FD] rounded-lg text-[#0D3A6E] hover:bg-[#F0F7FF] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        searchable
        searchPlaceholder="Buscar acción, entidad o IP..."
        keyExtractor={(l) => l.id}
      />
    </div>
  );
}
