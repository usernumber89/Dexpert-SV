"use client";

import { useEffect, useState } from "react";
import {
  useSearchParams,
  useRouter,
  usePathname,
} from "next/navigation";
import {
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { toast } from "sonner";

const processedKeys = new Set<string>();

export function PaymentFeedback() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailed, setShowFailed] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [amount, setAmount] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    const isSuccess = params.get("success") === "true";
    const isCanceled = params.get("canceled") === "true";
    const pendingCookie = document.cookie
      .split("; ")
      .find(c => c.startsWith("pending_plan="));

    if (isCanceled) {
      window.history.replaceState({}, "", pathname);
      document.cookie = "pending_plan=; path=/; max-age=0";
      toast.error("El pago fue cancelado", {
        icon: <XCircle className="h-4 w-4" />,
      });
      return;
    }

    if (!isSuccess) {
      if (pendingCookie) {
        window.history.replaceState({}, "", pathname);
        document.cookie = "pending_plan=; path=/; max-age=0";
        setShowFailed(true);
      }
      return;
    }

    const planFromUrl = params.get("plan") || "";
    const planFromCookie = pendingCookie?.split("=")[1];
    const resolvedPlan = planFromUrl || planFromCookie || "";
    const txnId = params.get("idTransaccion") || `fallback_${Date.now()}`;
    const monto = params.get("monto");

    const dedupKey = `${resolvedPlan}_${txnId}`;
    if (processedKeys.has(dedupKey)) return;
    processedKeys.add(dedupKey);

    window.history.replaceState({}, "", pathname);
    document.cookie = "pending_plan=; path=/; max-age=0";

    setPlan(resolvedPlan);
    setAmount(monto);
    setTransactionId(txnId);
    setShowSuccess(true);
  }, [params, pathname]);

  if (showFailed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-2xl">
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 p-4">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
          </div>

          <h2 className="mt-6 text-center text-2xl font-bold">
            El pago no se completó
          </h2>

          <p className="mt-3 text-center text-muted-foreground">
            El pago fue rechazado o no se procesó correctamente.
            Intentá de nuevo o usá otro método de pago.
          </p>

          <button
            onClick={() => setShowFailed(false)}
            className="mt-6 w-full rounded-xl bg-black px-4 py-3 font-medium text-white transition hover:opacity-90"
          >
            Volver a intentar
          </button>
        </div>
      </div>
    );
  }

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

        {transactionId && !transactionId.startsWith("fallback_") && (
          <div className="mt-6 text-center text-xs text-muted-foreground">
            ID: {transactionId}
          </div>
        )}

        <button
          onClick={() => {
            setShowSuccess(false);
            if (plan === "talent") {
              router.replace("/pyme/talent");
            } else {
              router.replace("/pyme/dashboard");
            }
          }}
          className="mt-6 w-full rounded-xl bg-black px-4 py-3 font-medium text-white transition hover:opacity-90"
        >
          {plan === "talent" ? "Ir a Talento" : "Ir al Dashboard"}
        </button>
      </div>
    </div>
  );
}
