'use client';

import { TrendingUp, TrendingDown, Minus, HelpCircle } from 'lucide-react';
import type { KpiMetric } from '@/lib/admin/types';
import { formatCurrency, formatNumber } from '@/lib/admin/export';

interface KpiCardProps {
  metric: KpiMetric;
  loading?: boolean;
}

export function KpiCard({ metric, loading }: KpiCardProps) {
  const formatValue = (val: number) => {
    switch (metric.format) {
      case 'currency':
        return formatCurrency(val);
      case 'percent':
        return `${val.toFixed(1)}%`;
      case 'decimal':
        return val.toFixed(2);
      default:
        return formatNumber(val);
    }
  };

  const TrendIcon = metric.changeType === 'increase' ? TrendingUp : metric.changeType === 'decrease' ? TrendingDown : Minus;
  const trendColor =
    metric.changeType === 'increase'
      ? 'text-[#1D9E75]'
      : metric.changeType === 'decrease'
      ? 'text-red-500'
      : 'text-[#93B8D4]';
  const trendBg =
    metric.changeType === 'increase'
      ? 'bg-[#E1F5EE]'
      : metric.changeType === 'decrease'
      ? 'bg-red-50'
      : 'bg-gray-100';

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E8F3FD] p-5 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
        <div className="h-8 bg-gray-200 rounded w-32 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-20" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E8F3FD] p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[#5B8DB8] uppercase tracking-wider">{metric.label}</span>
        {metric.helpText && (
          <span className="group relative">
            <HelpCircle className="w-3.5 h-3.5 text-[#93B8D4] cursor-help" />
            <span className="absolute right-0 top-6 bg-[#0D1B2A] text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              {metric.helpText}
            </span>
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-[#0D3A6E] mb-2">{formatValue(metric.value)}</div>
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium ${trendColor} ${trendBg}`}>
          <TrendIcon className="w-3 h-3" />
          <span>{metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}%</span>
        </div>
        <span className="text-[10px] text-[#93B8D4]">vs período anterior</span>
      </div>
    </div>
  );
}
