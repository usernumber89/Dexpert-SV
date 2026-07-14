"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Printer,
  X,
  ExternalLink,
  Receipt,
  Calendar,
  Hash,
  CreditCard,
  Building2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Invoice = {
  id: string;
  invoice_number: string;
  plan: string;
  plan_name: string;
  amount: number;
  transaction_id: string | null;
  status: string;
  company_name: string | null;
  created_at: string;
};

type Pyme = {
  id: string;
  company_name: string | null;
  location: string | null;
};

const formatCurrency = (amount: number) =>
  "$" + amount.toFixed(2);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("es-SV", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

function InvoiceDetailModal({
  invoice,
  pyme,
  onClose,
}: {
  invoice: Invoice;
  pyme: Pyme;
  onClose: () => void;
}) {
  const date = formatDate(invoice.created_at);
  const subtotal = invoice.amount / 1.13;
  const iva = invoice.amount - subtotal;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 pt-8 sm:pt-16 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-[#BAD8F7] w-full max-w-2xl shadow-xl my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#BAD8F7]">
          <h2 className="text-sm font-semibold text-[#0D3A6E]">Detalle de factura</h2>
          <div className="flex items-center gap-2">
            <a
              href={`/api/invoices/${invoice.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#0D5FA6] bg-[#F0F7FF] rounded-lg hover:bg-[#E8F3FD] transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Descargar PDF
            </a>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F0F7FF] transition">
              <X className="w-4 h-4 text-[#5B8DB8]" />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg  flex items-center justify-center">
                  <Image src="/1.svg" alt="" width={200} height={50} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0D3A6E]">Dexpert </h3>
                  <p className="text-[11px] text-[#5B8DB8]">Plataforma de talento estudiantil</p>
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[11px] font-medium text-[#93B8D4] uppercase tracking-wider">Factura</p>
              <p className="text-sm font-bold text-[#0D3A6E] font-mono">{invoice.invoice_number}</p>
            </div>
          </div>

          <div className="h-px bg-[#BAD8F7]/50" />

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-[11px] font-medium text-[#93B8D4] uppercase tracking-wider mb-1">Facturado a</p>
              <div className="flex items-start gap-2">
                <Building2 className="w-3.5 h-3.5 text-[#93B8D4] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#0D3A6E]">{pyme.company_name || "—"}</p>
                  {pyme.location && (
                    <p className="text-xs text-[#5B8DB8] mt-0.5">{pyme.location}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#93B8D4] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-[#93B8D4]">Fecha de emisión</p>
                  <p className="text-sm text-[#0D3A6E]">{date}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Hash className="w-3.5 h-3.5 text-[#93B8D4] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-[#93B8D4]">Transacción</p>
                  <p className="text-sm text-[#0D3A6E] font-mono text-[11px] break-all">{invoice.transaction_id || "—"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-[#BAD8F7]/50" />

          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-[#93B8D4] uppercase tracking-wider border-b border-[#BAD8F7]/50">
                <th className="text-left pb-2 font-medium">Descripción</th>
                <th className="text-right pb-2 font-medium">Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#F0F7FF]">
                <td className="py-3 text-[#0D3A6E]">
                  <p className="font-medium">{invoice.plan_name}</p>
                  <p className="text-xs text-[#5B8DB8]">Plan {invoice.plan}</p>
                </td>
                <td className="py-3 text-right font-medium text-[#0D3A6E]">
                  {formatCurrency(invoice.amount)}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-full sm:w-64 space-y-1.5">
              <div className="flex justify-between text-sm text-[#5B8DB8]">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-[#5B8DB8]">
                <span>IVA (13 %)</span>
                <span>{formatCurrency(iva)}</span>
              </div>
              <div className="h-px bg-[#BAD8F7]" />
              <div className="flex justify-between text-base font-bold text-[#0D3A6E]">
                <span>Total</span>
                <span>{formatCurrency(invoice.amount)}</span>
              </div>
            </div>
          </div>

          <div className="text-center text-[10px] text-[#93B8D4] pt-4 border-t border-[#BAD8F7]/50">
            <p>Dexpert — Plataforma de talento estudiantil</p>
            <p>Factura generada automáticamente después de tu compra.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PymeInvoices({
  invoices,
  pyme,
}: {
  invoices: Invoice[];
  pyme: Pyme;
}) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("es-SV", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#F4F9FF] via-white to-[#EEF6FF]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-blue-50 text-[#0D3A6E] border border-blue-100 mb-2">
                <Receipt className="w-3 h-3 text-[#38b6ff]" />
                Facturación
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0D3A6E] tracking-tight">
                Mis facturas
              </h1>
              <p className="text-xs sm:text-sm text-[#5B8DB8] mt-1">
                Historial de facturas generadas después de cada compra de créditos.
              </p>
            </div>
            <Link
              href="/pyme/pricing"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#38A3F1] hover:text-[#0D5FA6] transition"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Comprar créditos
            </Link>
          </div>

          {/* Content */}
          {invoices.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#F0F7FF] mb-4">
                <Receipt className="w-7 h-7 text-[#93B8D4]" />
              </div>
              <h3 className="text-sm font-semibold text-[#0D3A6E]">Sin facturas aún</h3>
              <p className="text-xs text-[#5B8DB8] mt-1 max-w-xs mx-auto">
                Las facturas se generan automáticamente después de cada compra de créditos.
              </p>
              <Link
                href="/pyme/pricing"
                className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-[#38A3F1] hover:text-[#0D5FA6] transition"
              >
                <CreditCard className="w-4 h-4" />
                Comprar créditos
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Desktop header */}
              <div className="hidden sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-2.5 text-[11px] font-medium text-[#93B8D4] uppercase tracking-wider">
                <span>Factura</span>
                <span>Plan</span>
                <span>Fecha</span>
                <span>Monto</span>
                <span />
              </div>

              {invoices.map((inv, i) => (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <button
                    onClick={() => setSelectedInvoice(inv)}
                    className="w-full text-left bg-white rounded-xl border border-[#BAD8F7] p-4 sm:px-5 sm:py-3.5 transition-all duration-200 hover:shadow-md hover:border-[#38A3F1]/30 group"
                  >
                    {/* Mobile */}
                    <div className="sm:hidden space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#0D3A6E]">
                          {inv.invoice_number}
                        </span>
                        <span className="text-sm font-semibold text-[#0D3A6E]">
                          ${inv.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#5B8DB8]">{inv.plan_name}</span>
                        <span className="text-[10px] text-[#93B8D4]">
                          {formatDate(inv.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Desktop */}
                    <div className="hidden sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center">
                      <span className="text-sm font-bold text-[#0D3A6E]">
                        {inv.invoice_number}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-[#0D3A6E]">{inv.plan_name}</p>
                        <p className="text-[11px] text-[#5B8DB8]">{inv.plan}</p>
                      </div>
                      <span className="text-sm text-[#5B8DB8]">{formatDate(inv.created_at)}</span>
                      <span className="text-sm font-semibold text-[#0D3A6E]">
                        ${inv.amount.toFixed(2)}
                      </span>
                      <ExternalLink className="w-4 h-4 text-[#93B8D4] group-hover:text-[#38A3F1] transition-colors" />
                    </div>
                  </button>
                </motion.div>
              ))}

              <p className="text-[10px] text-[#93B8D4] text-center pt-4">
                {invoices.length} factura{invoices.length !== 1 ? "s" : ""} encontrada
                {invoices.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          pyme={pyme}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </>
  );
}
