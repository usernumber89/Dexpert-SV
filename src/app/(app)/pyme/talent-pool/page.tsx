"use client";

import { useState, useEffect } from "react";
import { TalentPoolPanel } from "@/features/pyme/components/premium/TalentPoolPanel";
import { TalentPaywall } from "@/features/pyme/components/TalentPaywall";
import { hasTalentAccess } from "@/app/actions/pyme/premium";
import { Loader2 } from "lucide-react";

export default function TalentPoolPage() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    hasTalentAccess().then(setHasAccess);
  }, []);

  if (hasAccess === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-white to-[#E8F3FD] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#38A3F1] animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#5B8DB8]">Verificando acceso...</p>
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
