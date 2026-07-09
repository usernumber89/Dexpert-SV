'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import type { TimeRange } from '@/lib/admin/types';

const presets: { label: string; value: TimeRange }[] = [
  { label: 'Últimas 24h', value: '24h' },
  { label: 'Últimos 7 días', value: '7d' },
  { label: 'Últimos 30 días', value: '30d' },
  { label: 'Últimos 90 días', value: '90d' },
  { label: 'Último año', value: '1y' },
  { label: 'Personalizado', value: 'custom' },
];

interface DateRangeFilterProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLabel = presets.find((p) => p.value === value)?.label || 'Seleccionar período';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-[#E8F3FD] rounded-lg text-[#0D3A6E] hover:bg-[#F0F7FF] transition-colors"
      >
        <Calendar className="w-4 h-4 text-[#38A3F1]" />
        <span>{currentLabel}</span>
        <ChevronDown className="w-3 h-3 text-[#93B8D4]" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-[#E8F3FD] rounded-lg shadow-lg z-20 py-1">
          {presets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => {
                onChange(preset.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                value === preset.value
                  ? 'bg-[#F0F7FF] text-[#38A3F1] font-medium'
                  : 'text-[#0D3A6E] hover:bg-[#F0F7FF]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
