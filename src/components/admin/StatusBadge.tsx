'use client';

const statusStyles: Record<string, string> = {
  paid: 'bg-[#E1F5EE] text-[#1D9E75]',
  pending: 'bg-amber-50 text-amber-600',
  failed: 'bg-red-50 text-red-500',
  refunded: 'bg-purple-50 text-purple-600',
  open: 'bg-[#F0F7FF] text-[#38A3F1]',
  in_progress: 'bg-amber-50 text-amber-600',
  completed: 'bg-[#E1F5EE] text-[#1D9E75]',
  cancelled: 'bg-gray-100 text-gray-500',
  accepted: 'bg-[#E1F5EE] text-[#1D9E75]',
  rejected: 'bg-red-50 text-red-500',
  active: 'bg-[#E1F5EE] text-[#1D9E75]',
  inactive: 'bg-gray-100 text-gray-500',
  triggered: 'bg-red-50 text-red-500',
  acknowledged: 'bg-amber-50 text-amber-600',
  resolved: 'bg-[#E1F5EE] text-[#1D9E75]',
  STUDENT: 'bg-[#F0F7FF] text-[#38A3F1]',
  PYME: 'bg-amber-50 text-amber-600',
  ADMIN: 'bg-purple-50 text-purple-600',
  flagged: 'bg-red-50 text-red-500',
  'sin estado': 'bg-gray-100 text-gray-400',
};

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const style = statusStyles[status] || 'bg-gray-100 text-gray-500';
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${style}`}
    >
      {label}
    </span>
  );
}
