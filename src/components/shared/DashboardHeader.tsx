'use client';

import { useSidebar } from '@/components/ui/sidebar';
import { PanelLeft, X } from 'lucide-react';
import { NotificationBell } from '@/components/shared/NotificationBell';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export function DashboardHeader() {
  const { openMobile, setOpenMobile } = useSidebar();
  const { user } = useSupabaseAuth();

  return (
    <div className="sticky top-0 z-40 flex items-center justify-between bg-white/95 backdrop-blur-sm border-b border-[#BAD8F7] px-4 py-3 md:px-6 md:py-2">
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpenMobile(!openMobile)}
        className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[#F0F7FF] transition-colors -ml-1 md:hidden"
        aria-label={openMobile ? 'Cerrar menú' : 'Abrir menú'}
      >
        {openMobile ? (
          <X className="w-5 h-5 text-[#0D3A6E]" />
        ) : (
          <PanelLeft className="w-5 h-5 text-[#0D3A6E]" />
        )}
      </button>

      {/* Logo - mobile only */}
      <div className="flex items-center gap-2 md:hidden">
        <img src="/1.svg" className="h-7" alt="Dexpert" />
      </div>

      {/* Spacer - desktop only */}
      <div className="hidden md:block flex-1" />

      {/* Notification Bell - single instance */}
      <div className="flex items-center">
        {user && <NotificationBell userId={user.id} />}
      </div>
    </div>
  );
}
