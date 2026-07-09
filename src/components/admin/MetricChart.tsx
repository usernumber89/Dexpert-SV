'use client';

import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import type { ChartDataPoint } from '@/lib/admin/types';

type ChartType = 'line' | 'bar' | 'area' | 'pie';

interface MetricChartProps {
  title: string;
  data: ChartDataPoint[] | { name: string; value: number; color?: string }[];
  type?: ChartType;
  loading?: boolean;
  dataKey?: string;
  secondaryDataKey?: string;
  formatValue?: (val: number) => string;
  height?: number;
}

const CustomTooltip = ({ active, payload, label, formatValue }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-[#E8F3FD] p-3 text-xs">
      <p className="font-medium text-[#0D3A6E] mb-1">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <p key={idx} style={{ color: entry.color }} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.name}: {formatValue ? formatValue(entry.value) : entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export function MetricChart({
  title,
  data,
  type = 'line',
  loading,
  formatValue,
  height = 280,
}: MetricChartProps) {
  const isPie = type === 'pie';

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E8F3FD] p-5">
        <div className="h-4 bg-gray-200 rounded w-32 mb-6 animate-pulse" />
        <div className="h-[220px] bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="bg-white rounded-xl border border-[#E8F3FD] p-5">
        <h3 className="text-sm font-semibold text-[#0D3A6E] mb-4">{title}</h3>
        <div className="h-[220px] flex items-center justify-center text-[#93B8D4] text-sm">
          Sin datos disponibles
        </div>
      </div>
    );
  }

  const renderChart = () => {
    if (isPie) {
      const pieData = data as { name: string; value: number; color?: string }[];
      return (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {pieData.map((entry, idx) => (
                <Cell key={idx} fill={entry.color || '#38A3F1'} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip formatValue={formatValue} />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', color: '#5B8DB8' }}
              formatter={(value: string) => <span className="text-[#5B8DB8]">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    const chartData = data as ChartDataPoint[];

    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 10, left: 0, bottom: 5 },
    };

    const axisProps = {
      dataKey: 'date' as const,
      tick: { fontSize: 11, fill: '#93B8D4' },
      axisLine: { stroke: '#E8F3FD' },
      tickLine: false,
    };

    const SharedXAxis = <XAxis {...axisProps} />;
    const SharedYAxis = (
      <YAxis tick={{ fontSize: 11, fill: '#93B8D4' }} axisLine={false} tickLine={false} width={50} />
    );
    const SharedGrid = <CartesianGrid strokeDasharray="3 3" stroke="#F0F7FF" />;
    const SharedTooltip = <Tooltip content={<CustomTooltip formatValue={formatValue} />} />;
    const GradientDef = (
      <defs>
        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#38A3F1" stopOpacity={0.15} />
          <stop offset="95%" stopColor="#38A3F1" stopOpacity={0} />
        </linearGradient>
      </defs>
    );

    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart {...commonProps}>
              {GradientDef}
              {SharedGrid}
              {SharedXAxis}
              {SharedYAxis}
              {SharedTooltip}
              <Bar dataKey="value" fill="#38A3F1" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart {...commonProps}>
              {GradientDef}
              {SharedGrid}
              {SharedXAxis}
              {SharedYAxis}
              {SharedTooltip}
              <Area
                type="monotone"
                dataKey="value"
                stroke="#38A3F1"
                strokeWidth={2}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart {...commonProps}>
              {GradientDef}
              {SharedGrid}
              {SharedXAxis}
              {SharedYAxis}
              {SharedTooltip}
              <Line
                type="monotone"
                dataKey="value"
                stroke="#38A3F1"
                strokeWidth={2}
                dot={{ r: 3, fill: '#38A3F1' }}
                activeDot={{ r: 5, fill: '#38A3F1' }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E8F3FD] p-5">
      <h3 className="text-sm font-semibold text-[#0D3A6E] mb-4">{title}</h3>
      {renderChart()}
    </div>
  );
}
