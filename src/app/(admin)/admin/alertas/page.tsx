'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Plus, Bell, BellOff, Trash2, CheckCircle } from 'lucide-react';
import { fetchAlertConfigs, fetchAlertHistory, toggleAlertConfig, deleteAlertConfig, acknowledgeAlert, createAlertConfig } from '@/lib/admin/api';
import { SectionHeader } from '@/components/admin/SectionHeader';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { toast } from 'sonner';
import type { AlertConfig, AlertHistoryEntry } from '@/lib/admin/types';

export default function AlertasPage() {
  const [configs, setConfigs] = useState<AlertConfig[]>([]);
  const [history, setHistory] = useState<AlertHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newAlert, setNewAlert] = useState({
    name: '',
    description: '',
    metricKey: '',
    condition: 'gt' as const,
    threshold: 0,
    enabled: true,
    notifyEmail: [] as string[],
    notifySlack: '',
    cooldownMin: 60,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [c, h] = await Promise.all([fetchAlertConfigs(), fetchAlertHistory()]);
      setConfigs(c);
      setHistory(h);
    } catch (err) {
      console.error('Error loading alerts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await toggleAlertConfig(id, enabled);
      toast.success(enabled ? 'Alerta activada' : 'Alerta desactivada');
      loadData();
    } catch {
      toast.error('Error al actualizar alerta');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAlertConfig(id);
      toast.success('Alerta eliminada');
      loadData();
    } catch {
      toast.error('Error al eliminar alerta');
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await acknowledgeAlert(id);
      toast.success('Alerta acknowledgeada');
      loadData();
    } catch {
      toast.error('Error al acknowledgear alerta');
    }
  };

  const handleCreate = async () => {
    if (!newAlert.name || !newAlert.metricKey) {
      toast.error('Nombre y métrica son requeridos');
      return;
    }
    try {
      await createAlertConfig(newAlert);
      toast.success('Alerta creada exitosamente');
      setShowCreate(false);
      setNewAlert({ name: '', description: '', metricKey: '', condition: 'gt', threshold: 0, enabled: true, notifyEmail: [], notifySlack: '', cooldownMin: 60 });
      loadData();
    } catch {
      toast.error('Error al crear alerta');
    }
  };

  const configColumns: Column<AlertConfig>[] = [
    { key: 'name', header: 'Nombre', sortable: true },
    {
      key: 'metricKey',
      header: 'Métrica',
      sortable: true,
      render: (a) => <span className="font-mono text-xs">{a.metricKey}</span>,
    },
    {
      key: 'condition',
      header: 'Condición',
      sortable: true,
      render: (a) => (
        <span className="font-mono text-xs bg-[#F0F7FF] px-2 py-0.5 rounded">
          {a.condition} {a.threshold}
        </span>
      ),
    },
    {
      key: 'enabled',
      header: 'Estado',
      render: (a) => (
        <button
          onClick={() => handleToggle(a.id, !a.enabled)}
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
            a.enabled ? 'bg-[#E1F5EE] text-[#1D9E75]' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {a.enabled ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
          {a.enabled ? 'Activo' : 'Inactivo'}
        </button>
      ),
    },
    {
      key: 'cooldownMin',
      header: 'Cooldown',
      render: (a) => <span className="text-xs text-[#5B8DB8]">{a.cooldownMin} min</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (a) => (
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={() => handleToggle(a.id, !a.enabled)}
            className="p-1.5 rounded-lg hover:bg-[#F0F7FF] text-[#93B8D4] hover:text-[#38A3F1] transition-colors"
            title={a.enabled ? 'Desactivar' : 'Activar'}
          >
            {a.enabled ? <BellOff className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => handleDelete(a.id)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-[#93B8D4] hover:text-red-500 transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const historyColumns: Column<AlertHistoryEntry>[] = [
    { key: 'alertName', header: 'Alerta', sortable: true },
    {
      key: 'condition',
      header: 'Condición',
      render: (h) => (
        <span className="font-mono text-xs">
          {h.condition} {h.threshold}
        </span>
      ),
    },
    {
      key: 'metricValue',
      header: 'Valor',
      sortable: true,
      render: (h) => <span className="font-medium">{h.metricValue}</span>,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (h) => <StatusBadge status={h.status} />,
    },
    {
      key: 'triggeredAt',
      header: 'Disparada',
      sortable: true,
      render: (h) => (
        <span className="text-xs text-[#5B8DB8]">
          {new Date(h.triggeredAt).toLocaleString('es-SV')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (h) =>
        h.status === 'triggered' ? (
          <button
            onClick={() => handleAcknowledge(h.id)}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-amber-50 text-amber-600 rounded-md hover:bg-amber-100 transition-colors"
          >
            <CheckCircle className="w-3 h-3" />
            Ack
          </button>
        ) : null,
    },
  ];

  return (
    <div>
      <SectionHeader
        title="Alertas"
        description="Configurar notificaciones para anomalías del sistema"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-[#38A3F1] text-white rounded-lg hover:bg-[#2d8ed6] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva Alerta
            </button>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-[#E8F3FD] rounded-lg text-[#0D3A6E] hover:bg-[#F0F7FF] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        }
      />

      {/* Create Alert Form */}
      {showCreate && (
        <div className="bg-white rounded-xl border border-[#E8F3FD] p-5 mb-6">
          <h3 className="text-sm font-semibold text-[#0D3A6E] mb-4">Nueva Alerta</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-[#5B8DB8] mb-1">Nombre</label>
              <input
                type="text"
                value={newAlert.name}
                onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                placeholder="Ej: Bajo uptime"
                className="w-full px-3 py-2 text-sm bg-[#F0F7FF] border border-[#E8F3FD] rounded-lg text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5B8DB8] mb-1">Métrica</label>
              <input
                type="text"
                value={newAlert.metricKey}
                onChange={(e) => setNewAlert({ ...newAlert, metricKey: e.target.value })}
                placeholder="Ej: uptime, error_rate"
                className="w-full px-3 py-2 text-sm bg-[#F0F7FF] border border-[#E8F3FD] rounded-lg text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5B8DB8] mb-1">Condición</label>
              <select
                value={newAlert.condition}
                onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value as any })}
                className="w-full px-3 py-2 text-sm bg-[#F0F7FF] border border-[#E8F3FD] rounded-lg text-[#0D3A6E] focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30"
              >
                <option value="gt">Mayor que (&gt;)</option>
                <option value="lt">Menor que (&lt;)</option>
                <option value="gte">Mayor o igual (&gt;=)</option>
                <option value="lte">Menor o igual (&lt;=)</option>
                <option value="eq">Igual a (=)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5B8DB8] mb-1">Umbral</label>
              <input
                type="number"
                value={newAlert.threshold}
                onChange={(e) => setNewAlert({ ...newAlert, threshold: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-[#F0F7FF] border border-[#E8F3FD] rounded-lg text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5B8DB8] mb-1">Cooldown (min)</label>
              <input
                type="number"
                value={newAlert.cooldownMin}
                onChange={(e) => setNewAlert({ ...newAlert, cooldownMin: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-[#F0F7FF] border border-[#E8F3FD] rounded-lg text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5B8DB8] mb-1">Slack Webhook (opcional)</label>
              <input
                type="text"
                value={newAlert.notifySlack}
                onChange={(e) => setNewAlert({ ...newAlert, notifySlack: e.target.value })}
                placeholder="https://hooks.slack.com/..."
                className="w-full px-3 py-2 text-sm bg-[#F0F7FF] border border-[#E8F3FD] rounded-lg text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-[#5B8DB8] mb-1">Descripción</label>
            <textarea
              value={newAlert.description}
              onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
              placeholder="Describe cuándo debería dispararse esta alerta..."
              rows={2}
              className="w-full px-3 py-2 text-sm bg-[#F0F7FF] border border-[#E8F3FD] rounded-lg text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:ring-2 focus:ring-[#38A3F1]/30"
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-sm text-[#5B8DB8] hover:text-[#0D3A6E] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 text-sm bg-[#38A3F1] text-white rounded-lg hover:bg-[#2d8ed6] transition-colors"
            >
              Crear Alerta
            </button>
          </div>
        </div>
      )}

      {/* Alert Configs */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-[#0D3A6E] mb-3">Configuración de Alertas</h2>
        <DataTable
          columns={configColumns}
          data={configs}
          loading={loading}
          searchable
          searchPlaceholder="Buscar alerta..."
          keyExtractor={(a) => a.id}
        />
      </div>

      {/* Alert History */}
      <div>
        <h2 className="text-sm font-semibold text-[#0D3A6E] mb-3">Historial de Alertas</h2>
        <DataTable
          columns={historyColumns}
          data={history}
          loading={loading}
          keyExtractor={(h) => h.id}
          emptyMessage="No hay alertas registradas"
        />
      </div>
    </div>
  );
}
