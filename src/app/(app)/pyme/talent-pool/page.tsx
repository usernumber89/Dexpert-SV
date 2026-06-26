"use client";

import { useState, useEffect } from "react";
import { TalentPoolPanel } from "@/features/pyme/components/premium/TalentPoolPanel";
import { TalentPaywall } from "@/features/pyme/components/TalentPaywall";
import { hasTalentAccess } from "@/app/actions/pyme/premium";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function TalentPoolPage() {
  const searchParams = useSearchParams();
  const isPostPayment = searchParams.get("success") === "true";

  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);

  useEffect(() => {
    const init = async () => {
      const access = await hasTalentAccess();
      if (access) {
        setHasAccess(true);
        return;
      }

      if (isPostPayment) {
        setCheckingPayment(true);
        const MAX = 8;
        const INTERVAL = 2500;
        for (let i = 0; i < MAX; i++) {
          await new Promise(r => setTimeout(r, INTERVAL));
          const retryAccess = await hasTalentAccess();
          if (retryAccess) {
            setHasAccess(true);
            setCheckingPayment(false);
            return;
          }
        }
        setHasAccess(false);
        setCheckingPayment(false);
      } else {
        setHasAccess(false);
      }
    };

    init();
  }, [isPostPayment]);

  if (hasAccess === null || checkingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-white to-[#E8F3FD] flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <div className="w-16 h-16 rounded-2xl bg-[#F0F7FF] border border-[#BAD8F7] flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-[#38A3F1] animate-spin" />
          </div>
          <h2 className="text-lg font-bold text-[#0D3A6E] mb-2">
            {checkingPayment ? "Confirmando tu pago" : "Verificando acceso..."}
          </h2>
          {checkingPayment && (
            <p className="text-sm text-[#5B8DB8]">
              Estamos verificando la transacción con Wompi. Esto puede tomar unos segundos...
            </p>
          )}
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