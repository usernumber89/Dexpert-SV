"use client";

import { useEffect, useState, useRef } from "react";
import {
  useSearchParams,
  useRouter,
  usePathname,
} from "next/navigation";
import {
  CheckCircle2,
  Sparkles,
  XCircle,
} from "lucide-react";

import { toast } from "sonner";
import { recordPurchase } from "@/app/actions/pyme/premium";

export function PaymentFeedback() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const recordedRef = useRef(false);

  const [showSuccess, setShowSuccess] =
    useState(false);

  const plan = params.get("plan");
  const amount = params.get("monto");
 const transactionId =
  params.get("idTransaccion");

  useEffect(() => {
    const isSuccess =
      params.get("success") === "true";

    const isCanceled =
      params.get("canceled") === "true";

    const planFromUrl = params.get("plan");
    const planFromCookie = document.cookie.split("; ").find(c => c.startsWith("pending_plan="))?.split("=")[1];
    const plan = planFromUrl || planFromCookie;

    if (isSuccess && (transactionId || plan === "talent")) {
      setShowSuccess(true);

      toast.success(
        plan === "talent" ? "Talento desbloqueado" : "Pago procesado correctamente",
        {
          duration: 4000,
        }
      );

      if (plan && !recordedRef.current) {
        recordedRef.current = true;
        document.cookie = "pending_plan=; path=/; max-age=0";
        sessionStorage.setItem("talent_unlocked", "true");
        recordPurchase(transactionId || `talent_${Date.now()}`, plan).then((res) => {
          if (res?.success) {
            console.log("Plan registrado:", res.plan);
            router.refresh();
          } else {
            console.error("Error registrando compra:", res?.error);
          }
        });
      }

      const timer = setTimeout(() => {
        if (plan === "talent") {
          router.replace("/pyme/talent");
        } else {
          router.replace(pathname);
        }
      }, 8000);

      return () => clearTimeout(timer);
    }

    if (isCanceled) {
      toast.error(
        "El pago fue cancelado",
        {
          icon: (
            <XCircle className="h-4 w-4" />
          ),
        }
      );

      router.replace(pathname);
    }
  }, [params, router, pathname, transactionId]);

  if (!showSuccess) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-2xl">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <h2 className="mt-6 text-center text-2xl font-bold">
          {plan === "talent" ? "¡Talento desbloqueado!" : "¡Pago exitoso!"}
        </h2>

        <p className="mt-3 text-center text-muted-foreground">
          {plan === "talent"
            ? "Ahora tenés acceso completo al directorio de talento."
            : "Tu compra fue procesada correctamente."}
        </p>

        {amount && (
          <div className="mt-6 rounded-2xl bg-muted p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Monto pagado
              </span>

              <span className="font-semibold">
                ${amount}
              </span>
            </div>
          </div>
        )}

        {plan === "talent" ? (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3">
            <p className="text-sm text-green-700">
              Ya podés explorar estudiantes, filtrar por habilidades y guardar tus favoritos.
            </p>
          </div>
        ) : (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm text-amber-700">
              Tus créditos estarán disponibles en unos segundos.
            </p>
          </div>
        )}

        <div className="mt-6 text-center text-xs text-muted-foreground">
          ID: {transactionId}
        </div>

        <button
          onClick={() => {
            setShowSuccess(false);
            router.replace(pathname);
            router.refresh();
            if (plan === "talent") {
              router.push("/pyme/talent");
            }
          }}
          className="mt-6 w-full rounded-xl bg-black px-4 py-3 font-medium text-white transition hover:opacity-90"
        >
          {plan === "talent" ? "Ir a Talento" : "Continuar al Dashboard"}
        </button>
      </div>
    </div>
  );
}