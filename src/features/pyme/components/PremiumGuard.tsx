"use client";

import { useState, useEffect } from "react";
import { Crown, Loader2 } from "lucide-react";
import { getPymePlan } from "@/app/actions/pyme/premium";
import { isPremiumPlan } from "@/lib/premium";
import Link from "next/link";

export default function PremiumGuard({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPymePlan().then((p) => {
      setPlan(p);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <noscript>
          <div className="max-w-lg mx-auto text-center py-20 px-4">
            <p className="text-sm text-[#5B8DB8]">
              JavaScript es necesario para verificar tu plan. Asegurate de tenerlo habilitado o contactá a soporte.
            </p>
          </div>
        </noscript>
        <Loader2 className="w-6 h-6 animate-spin text-[#38A3F1]" />
      </div>
    );
  }

  if (!isPremiumPlan(plan)) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="bg-white rounded-2xl border border-[#E8F3FD] p-8 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#FFFBEB] flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-[#F59E0B]" />
          </div>
          <h2 className="text-lg font-bold text-[#0D3A6E] mb-2">Funcionalidad Premium</h2>
          <p className="text-sm text-[#5B8DB8] mb-6 leading-relaxed">
            Esta sección está disponible solo para planes <strong>Growth</strong> y <strong>Pro</strong>.
            Actualizá tu plan para acceder a analítica avanzada, talent pool y proyectos destacados.
          </p>
          <Link
            href="/pyme/pricing"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-[#F59E0B] to-[#E67E22] px-6 py-3 rounded-xl hover:opacity-90 transition shadow-md"
          >
            <Crown className="w-4 h-4" />
            Ver planes
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
