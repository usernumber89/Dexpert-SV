'use client';

import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAdminAccess();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#38A3F1] animate-spin" />
          <p className="text-sm text-[#5B8DB8]">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <ShieldAlert className="w-16 h-16 text-red-400" />
          <h1 className="text-2xl font-semibold text-[#0D3A6E]">Acceso Denegado</h1>
          <p className="text-[#5B8DB8]">
            No tienes permisos de administrador para acceder a este panel.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
