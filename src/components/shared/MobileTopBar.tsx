'use client';

import Image from "next/image";
import { useSidebar } from '@/components/ui/sidebar';
import { PanelLeft, X } from 'lucide-react';

export function MobileTopBar() {
  const { openMobile, setOpenMobile } = useSidebar();

  return (
    <div className="sticky top-0 z-40 flex items-center justify-between bg-white/95 backdrop-blur-sm border-b border-[#BAD8F7] px-4 py-3 md:hidden">
      <button
        onClick={() => setOpenMobile(!openMobile)}
        className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[#F0F7FF] transition-colors -ml-1"
        aria-label={openMobile ? 'Cerrar menú' : 'Abrir menú'}
      >
        {openMobile ? (
          <X className="w-5 h-5 text-[#0D3A6E]" />
        ) : (
          <PanelLeft className="w-5 h-5 text-[#0D3A6E]" />
        )}
      </button>
      <div className="flex items-center gap-2">
        <Image src="/1.svg" alt="Dexpert" width={200} height={50} className="h-7" />
      </div>
    </div>
  );
}
