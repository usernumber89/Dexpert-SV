"use client";

import { useState, useEffect, Suspense } from "react";
import { TalentPoolPanel } from "@/features/pyme/components/premium/TalentPoolPanel";
import { TalentPaywall } from "@/features/pyme/components/TalentPaywall";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTalentAccess } from "@/hooks/useTalentAccess";

function TalentPoolLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-white to-[#E8F3FD] flex items-center justify-center">
      <div className="text-center max-w-sm px-4">
        <div className="w-16 h-16 rounded-2xl bg-[#F0F7FF] border border-[#BAD8F7] flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-[#38A3F1] animate-spin" />
        </div>
        <h2 className="text-lg font-bold text-[#0D3A6E] mb-2">Verificando acceso...</h2>
      </div>
    </div>
  );
}

function TalentPoolContent() {
  const searchParams = useSearchParams();
  const isPostPayment = searchParams.get("success") === "true";

  const { hasAccess, loading, refetch } = useTalentAccess();
  const [checkingPayment, setCheckingPayment] = useState(false);

  useEffect(() => {
    if (hasAccess === false && isPostPayment) {
      setCheckingPayment(true);
      const poll = async () => {
        const MAX_RETRIES = 20;
        const INTERVAL = 3000;
        for (let i = 0; i < MAX_RETRIES; i++) {
          await new Promise(r => setTimeout(r, INTERVAL));
          const access = await refetch();
          if (access) {
            setCheckingPayment(false);
            return;
          }
        }
        setCheckingPayment(false);
      };
      poll();
    }
  }, [hasAccess, isPostPayment, refetch]);

  if (loading || (hasAccess === null && !checkingPayment)) {
    return <TalentPoolLoader />;
  }

  if (checkingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-white to-[#E8F3FD] flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <div className="w-16 h-16 rounded-2xl bg-[#F0F7FF] border border-[#BAD8F7] flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-[#38A3F1] animate-spin" />
          </div>
          <h2 className="text-lg font-bold text-[#0D3A6E] mb-2">Confirmando tu pago</h2>
          <p className="text-sm text-[#5B8DB8]">
            Estamos verificando la transacción con Wompi. Esto puede tomar hasta 60 segundos...
          </p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return <TalentPaywall />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F9FF] via-white to-[#EEF6FF]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6">
        <div>
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-brand-mid mb-1">
            Premium · Talent Pool
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-ink-primary">
            Mis Estudiantes Favoritos
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            Guardá estudiantes destacados para contactarlos cuando tengas proyectos disponibles
          </p>
        </div>
        <TalentPoolPanel />
      </div>
    </div>
  );
}

export default function TalentPoolPage() {
  return (
    <Suspense fallback={<TalentPoolLoader />}>
      <TalentPoolContent />
    </Suspense>
  );
}
