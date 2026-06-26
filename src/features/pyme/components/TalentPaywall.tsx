"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Crown,
  Check,
  ArrowRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  Clock,
} from "lucide-react";
import { recordPurchase } from "@/app/actions/pyme/premium";

const PENDING_COOKIE = "pending_plan";

export function TalentPaywall() {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [hasPending, setHasPending] = useState(false);

  useEffect(() => {
    const hasCookie = document.cookie
      .split("; ")
      .some(c => c.startsWith(`${PENDING_COOKIE}=`));
    setHasPending(hasCookie);
  }, []);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      sessionStorage.setItem("talent_unlocked", "true");

      const res = await fetch("/api/wompi/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "talent" }),
      });
      const data = await res.json();

      if (!res.ok) {
        sessionStorage.removeItem("talent_unlocked");
        if (res.status === 409 && data.url) {
          window.location.href = data.url;
          return;
        }
        throw new Error(data.error || "Error al iniciar el pago");
      }

      if (!data.url) {
        sessionStorage.removeItem("talent_unlocked");
        throw new Error("No se pudo obtener la URL de pago");
      }

      document.cookie = `${PENDING_COOKIE}=talent; path=/; max-age=3600`;
      window.location.href = data.url;
    } catch (error: any) {
      sessionStorage.removeItem("talent_unlocked");
      console.error("Error en checkout talent:", error);
      toast.error(error.message || "Error al procesar el pago. Intentá de nuevo.");
      setLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    setVerifying(true);
    try {
      const planCookie = document.cookie
        .split("; ")
        .find(c => c.startsWith(`${PENDING_COOKIE}=`))
        ?.split("=")[1];

      const plan = planCookie || "talent";

      const res = await recordPurchase(`manual_${Date.now()}`, plan);
      if (res?.success) {
        document.cookie = `${PENDING_COOKIE}=; path=/; max-age=0`;
        sessionStorage.setItem("talent_unlocked", "true");
        toast.success("¡Acceso verificado! Redirigiendo...");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error("No pudimos verificar tu pago. Contactá a soporte.");
      }
    } catch (err) {
      console.error("Error verificando pago:", err);
      toast.error("Error al verificar. Intentá de nuevo.");
    } finally {
      setVerifying(false);
    }
  };

  const benefits = [
    "Directorio completo de estudiantes",
    "Filtros por habilidades técnicas",
    "Búsqueda por nombre, carrera o universidad",
    "Guardá estudiantes en tu Talent Pool",
    "Contacto directo por correo",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-white to-[#E8F3FD] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-[#BAD8F7] shadow-2xl shadow-[#0D3A6E]/10 p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-200">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#0D3A6E] mb-2">
              Acceso a Talento
            </h1>
            <p className="text-sm text-[#5B8DB8]">
              Explorá el directorio completo de estudiantes, filtrá por habilidades
              y guardá tus candidatos favoritos.
            </p>
          </div>

          <div className="bg-gradient-to-r from-[#F0F7FF] to-[#E8F3FD] rounded-2xl p-6 mb-8 text-center border border-[#BAD8F7]">
            <p className="text-[10px] uppercase tracking-widest text-[#5B8DB8] font-semibold mb-2">
              Pago único — Sin renovación
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-extrabold text-[#0D3A6E]">$7.99</span>
              <span className="text-sm text-[#93B8D4]">USD</span>
            </div>
            <p className="text-xs text-[#5B8DB8] mt-2">
              Acceso permanente. Un solo pago y es tuyo para siempre.
            </p>
          </div>

          <ul className="space-y-3 mb-8">
            {benefits.map((benefit, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-green-600" />
                </div>
                <span className="text-sm text-[#0D3A6E]">{benefit}</span>
              </li>
            ))}
          </ul>

          <motion.button
            onClick={handlePurchase}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative w-full bg-gradient-to-r from-[#F59E0B] to-[#E67E22] text-white text-sm font-bold py-3.5 rounded-xl shadow-lg shadow-amber-200 hover:shadow-xl hover:shadow-amber-300 transition-all disabled:opacity-60 overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Redirigiendo a Wompi...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Comprar acceso — $7.99
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </motion.button>

          <div className="flex items-center justify-center gap-1.5 mt-4 text-[10px] text-[#93B8D4]">
            <ShieldCheck className="w-3 h-3" />
            Pago seguro procesado por Wompi • SSL encriptado
          </div>

          {hasPending && (
            <div className="mt-6 pt-6 border-t border-[#E8F3FD]">
              <div className="flex items-center gap-2 mb-3 text-xs text-[#5B8DB8]">
                <Clock className="w-3.5 h-3.5" />
                ¿Ya realizaste el pago?
              </div>
              <motion.button
                onClick={handleVerifyPayment}
                disabled={verifying}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-[#0D5FA6] bg-[#F0F7FF] border border-[#BAD8F7] py-3 rounded-xl hover:bg-[#E8F3FD] transition-all disabled:opacity-50"
              >
                {verifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#38A3F1] border-t-transparent rounded-full animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Ya pagué — Verificar mi acceso
                  </>
                )}
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
