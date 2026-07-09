"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client"; // Ajusta la ruta de tu cliente si es necesario
import { CreditCard, Ticket } from "lucide-react";
import Link from "next/link";

type Props = {
  pymeId: string;    // 🌟 1. Añadimos el pymeId para poder filtrar en Supabase
  available: number; // Este actúa como valor inicial del servidor
  used: number;      // Este actúa como valor inicial del servidor
};

export function CreditsWidget({ pymeId, available: initialAvailable, used: initialUsed }: Props) {
  // 🌟 2. Convertimos los datos en estados locales mutables
  const [available, setAvailable] = useState(initialAvailable);
  const [used, setUsed] = useState(initialUsed);
  const supabase = createClient();

  // Mantiene sincronizado el estado por si cambias de página normalmente
  useEffect(() => {
    setAvailable(initialAvailable);
    setUsed(initialUsed);
  }, [initialAvailable, initialUsed]);

  // 🌟 3. Nos suscribimos al canal de Supabase Realtime
  useEffect(() => {
    if (!pymeId) return;

    const channel = supabase
      .channel(`realtime-widget-${pymeId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE", // Solo cuando cambien/sumen créditos
          schema: "public",
          table: "pyme_credits",
          filter: `pyme_id=eq.${pymeId}`, // Escucha SOLO los datos de ESTA pyme
        },
        (payload: any) => {
          // Extraemos los nuevos datos de forma segura para TypeScript
          const newData = payload.new as { credits_available: number; credits_used: number };
          
          
          // Actualizamos la pantalla instantáneamente
          setAvailable(newData.credits_available);
          setUsed(newData.credits_used);
        }
      )
      .subscribe();

    // Limpieza de la conexión cuando el componente se desmonte
    return () => {
      supabase.removeChannel(channel);
    };
  }, [pymeId, supabase]);

  // Conservamos tus cálculos originales intactos
  const total = available + used;
  const percentage = total > 0 ? (available / total) * 100 : 0;

  return (
    <div className="bg-[#0D3A6E] rounded-xl h-32 p-4">
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4 text-[#38A3F1]" />
          <p className="text-xs font-medium text-[#38A3F1] uppercase tracking-widest">
            Créditos
          </p>
        </div>
        <Link
          href="/pyme/pricing"
          className="flex items-center gap-1 text-xs font-medium text-white bg-[#38A3F1] px-3 py-1.5 rounded-lg hover:bg-[#0D5FA6] transition"
        >
          <CreditCard className="w-5 h-5" /> Comprar más
        </Link>
      </div>

      <div className="flex items-end gap-2 mb-2">
        <span className="text-2xl font-bold text-white">{available}</span>
        <span className="text-[#BAD8F7] text-sm mb-1">créditos disponibles</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-[#38A3F1] rounded-full transition-all duration-500" // Añadí suavidad a la animación de la barra
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between mb-2">
        <p className="text-[10px] text-[#BAD8F7]">{used} usados</p>
        <p className="text-[10px] text-[#BAD8F7]">{total} total comprados</p>
      </div>

      {available === 0 && (
        <div className="mt-3 p-2.5 bg-red-500/10 border border-red-400/20 rounded-lg">
          <p className="text-xs text-red-300">
            No tienes créditos disponibles. Compra un plan para publicar más proyectos.
          </p>
        </div>
      )}
    </div>
  );
}