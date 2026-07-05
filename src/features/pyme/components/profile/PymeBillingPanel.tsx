"use client";

import { motion } from "framer-motion";
import { Ticket, CreditCard, Receipt, ExternalLink, Shield } from "lucide-react";
import Link from "next/link";
import type { Invoice } from "./types";

type Props = {
  creditsAvailable: number;
  creditsUsed: number;
  invoices: Invoice[];
  loadingBilling: boolean;
};

export function PymeBillingPanel({ creditsAvailable, creditsUsed, invoices, loadingBilling }: Props) {
  if (loadingBilling) {
    return (
      <div className="text-center py-16">
        <div className="w-12 h-12 border-4 border-[#BAD8F7] border-t-[#38A3F1] rounded-full animate-spin mx-auto" />
        <p className="text-sm text-[#93B8D4] mt-4">Cargando información de facturación...</p>
      </div>
    );
  }

  return (
    <motion.div
      key="billing"
      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-semibold text-[#0D3A6E] mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#1D5A9E] rounded-full" />
            Créditos Disponibles
          </h3>
          <div className="bg-[#0D3A6E] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-[#38A3F1]" />
                <span className="text-sm font-medium text-[#38A3F1] uppercase tracking-widest">Créditos</span>
              </div>
              <Link
                href="/pyme/pricing"
                className="flex items-center gap-1.5 text-xs font-medium text-white bg-[#38A3F1] px-3 py-1.5 rounded-lg hover:bg-[#0D5FA6] transition"
              >
                <CreditCard className="w-4 h-4" /> Comprar más
              </Link>
            </div>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-3xl font-bold text-white">{creditsAvailable}</span>
              <span className="text-[#BAD8F7] text-sm mb-1">créditos disponibles</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#38A3F1] rounded-full transition-all"
                style={{ width: `${(creditsAvailable + creditsUsed) > 0 ? (creditsAvailable / (creditsAvailable + creditsUsed)) * 100 : 0}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-[#BAD8F7]">{creditsUsed} usados</span>
              <span className="text-xs text-[#BAD8F7]">{creditsAvailable + creditsUsed} total</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold text-[#0D3A6E] mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#1D5A9E] rounded-full" />
            Facturas Recientes
          </h3>
          {invoices.length === 0 ? (
            <div className="text-center py-10 bg-[#F8FBFE] rounded-xl border border-[#E8F3FD]">
              <Receipt className="w-10 h-10 text-[#BAD8F7] mx-auto mb-3" />
              <p className="text-sm text-[#5B8DB8]">Sin facturas aún</p>
              <p className="text-xs text-[#93B8D4] mt-1">
                Las facturas se generan después de cada compra de créditos
              </p>
              <Link
                href="/pyme/pricing"
                className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-[#38A3F1] hover:text-[#0D5FA6] transition"
              >
                <CreditCard className="w-4 h-4" /> Comprar créditos
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {invoices.map(inv => (
                <Link
                  key={inv.id}
                  href="/pyme/invoices"
                  className="flex items-center justify-between p-4 bg-[#F8FBFE] rounded-xl border border-[#E8F3FD] hover:border-[#BAD8F7] hover:bg-[#F0F7FF] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#F0F7FF] rounded-lg flex items-center justify-center">
                      <Receipt className="w-4 h-4 text-[#38A3F1]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0D3A6E]">{inv.invoice_number}</p>
                      <p className="text-xs text-[#93B8D4]">
                        {new Date(inv.created_at).toLocaleDateString("es-SV", { day: "2-digit", month: "short", year: "numeric" })}
                        {" · "}{inv.plan_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#0D3A6E]">${Number(inv.amount).toFixed(2)}</span>
                    <ExternalLink className="w-4 h-4 text-[#93B8D4] group-hover:text-[#38A3F1] transition-colors" />
                  </div>
                </Link>
              ))}
              <Link
                href="/pyme/invoices"
                className="block text-center text-sm text-[#38A3F1] hover:text-[#0D5FA6] transition pt-2 font-medium"
              >
                Ver todas las facturas →
              </Link>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-base font-semibold text-[#0D3A6E] mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#1D5A9E] rounded-full" />
            Método de Pago
          </h3>
          <div className="bg-[#F8FBFE] rounded-xl border border-[#E8F3FD] p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F0F7FF] rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#38A3F1]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#0D3A6E]">Pagos seguros con Wompi</p>
                <p className="text-xs text-[#93B8D4]">
                  Los pagos se procesan de forma segura a través de Wompi. No almacenamos información de tarjetas.
                </p>
              </div>
              <Link
                href="/pyme/pricing"
                className="text-sm font-medium text-[#38A3F1] hover:text-[#0D5FA6] transition whitespace-nowrap"
              >
                Comprar créditos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
