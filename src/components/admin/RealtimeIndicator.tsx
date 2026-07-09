'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface RealtimeIndicatorProps {
  table: string;
  onUpdate?: () => void;
}

export function RealtimeIndicator({ table, onUpdate }: RealtimeIndicatorProps) {
  const [status, setStatus] = useState<'connected' | 'unavailable' | 'loading'>('loading');

  useEffect(() => {
    const supabase = createClient();
    setStatus('loading');

    const channel = supabase
      .channel(`admin-${table}-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => {
          onUpdate?.();
        }
      )
      .subscribe((s: string) => {
        setStatus(s === 'SUBSCRIBED' ? 'connected' : 'unavailable');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, onUpdate]);

  return (
    <div className="flex items-center gap-1.5 text-[10px]">
      {status === 'loading' && <RefreshCw className="w-3 h-3 text-[#93B8D4] animate-spin" />}
      {status === 'connected' && <Wifi className="w-3 h-3 text-[#1D9E75]" />}
      {status === 'unavailable' && <WifiOff className="w-3 h-3 text-[#93B8D4]" />}
      <span className="text-[#93B8D4]">
        {status === 'connected' ? 'Tiempo real' : 'No disponible'}
      </span>
    </div>
  );
}
