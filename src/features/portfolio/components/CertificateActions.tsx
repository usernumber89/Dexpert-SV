"use client";

import { useState } from "react";
import { Lock, Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export function CertificateActions({ certificateId }: { certificateId: string }) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/wompi/certificate-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Error al generar el pago");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      style={{ cursor: "pointer" }}
      className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold bg-[#22C55E] text-white hover:bg-[#16A34A] px-4 py-3 rounded-xl transition-all duration-300 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Lock className="w-4 h-4" />
      )}
      {loading ? "Generando pago..." : "Pagar $1.99 para descargar"}
      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
    </button>
  );
}
