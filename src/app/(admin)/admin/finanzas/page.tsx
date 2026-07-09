'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { fetchTransactions, fetchRevenueChart, fetchDashboardOverview } from '@/lib/admin/api';
import { DateRangeFilter } from '@/components/admin/DateRangeFilter';
import { ExportButton } from '@/components/admin/ExportButton';
import { SectionHeader } from '@/components/admin/SectionHeader';
import { KpiCard } from '@/components/admin/KpiCard';
import { MetricChart } from '@/components/admin/MetricChart';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import type { Transaction, TimeRange } from '@/lib/admin/types';
import { formatCurrency } from '@/lib/admin/export';

export default function FinanzasPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [overview, setOverview] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [revenueChart, setRevenueChart] = useState<any[]>([]);
  const [totalVolume, setTotalVolume] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [txData, chartData, ovData] = await Promise.all([
        fetchTransactions(),
        fetchRevenueChart(60),
        fetchDashboardOverview(),
      ]);
      setTransactions(txData.transactions);
      setTotalVolume(txData.totalVolume);
      setTotalCount(txData.totalCount);
      setRevenueChart(chartData);
      setOverview(ovData);
    } catch (err) {
      console.error('Error loading financial data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const columns: Column<Transaction>[] = [
    { key: 'transactionId', header: 'Transacción', sortable: true },
    {
      key: 'companyName',
      header: 'Empresa',
      sortable: true,
    },
    {
      key: 'plan',
      header: 'Plan',
      sortable: true,
    },
    {
      key: 'amount',
      header: 'Monto',
      sortable: true,
      align: 'right',
      render: (t) => (
        <span className="font-medium text-[#0D3A6E]">{formatCurrency(t.amount)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (t) => <StatusBadge status={t.status} />,
    },
    {
      key: 'createdAt',
      header: 'Fecha',
      sortable: true,
      render: (t) => (
        <span className="text-[#5B8DB8]">
          {new Date(t.createdAt).toLocaleDateString('es-SV', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    },
  ];

  return (
    <div id="finanzas-page">
      <SectionHeader
        title="Métricas Financieras"
        description="Ingresos, transacciones y conversión de pagos"
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
              filename="finanzas"
              pdfTitle="Reporte Financiero"
              pdfElementId="finanzas-page"
              csvHeaders={['Transacción', 'Empresa', 'Plan', 'Monto', 'Estado', 'Fecha']}
              csvRows={transactions.map((t) => [
                t.transactionId,
                t.companyName,
                t.plan,
                String(t.amount),
                t.status,
                new Date(t.createdAt).toISOString(),
              ])}
            />
          </>
        }
      />

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          metric={{
            id: 'total_volume',
            label: 'Volumen Total',
            value: totalVolume,
            previousValue: 0,
            change: 0,
            changeType: 'neutral',
            format: 'currency',
          }}
          loading={loading}
        />
        <KpiCard
          metric={{
            id: 'total_transactions',
            label: 'Transacciones',
            value: totalCount,
            previousValue: 0,
            change: 0,
            changeType: 'neutral',
          }}
          loading={loading}
        />
        <KpiCard
          metric={
            overview?.revenue || {
              id: 'revenue',
              label: 'Ingresos (30d)',
              value: 0,
              previousValue: 0,
              change: 0,
              changeType: 'neutral',
              format: 'currency',
            }
          }
          loading={loading}
        />
        <KpiCard
          metric={
            overview?.conversionRate || {
              id: 'conversion',
              label: 'Tasa Conversión',
              value: 0,
              previousValue: 0,
              change: 0,
              changeType: 'neutral',
              format: 'percent',
            }
          }
          loading={loading}
        />
      </div>

      {/* Revenue Chart */}
      <div className="mb-6">
        <MetricChart
          title="Ingresos (60 días)"
          data={revenueChart}
          type="area"
          loading={loading}
          formatValue={(v) => `$${v.toLocaleString()}`}
          height={320}
        />
      </div>

      {/* Transactions Table */}
      <DataTable
        columns={columns}
        data={transactions}
        loading={loading}
        searchable
        searchPlaceholder="Buscar transacción o empresa..."
        keyExtractor={(t) => t.id}
      />
    </div>
  );
}
