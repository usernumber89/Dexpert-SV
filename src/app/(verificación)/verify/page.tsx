"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Search, ArrowRight, FileText } from "lucide-react";

export default function VerifySearchPage() {
  const [certificateId, setCertificateId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validación básica para evitar envíos vacíos
    const cleanId = certificateId.trim();
    if (!cleanId) {
      setError("Por favor, ingresa un ID de certificado válido.");
      return;
    }

    setIsLoading(true);
    // Redirige dinámicamente a la página de validación pública
    router.push(`/verify/${cleanId}`);
  };

  return (
    <div className="min-h-screen bg-[#FCFCFA] flex flex-col justify-between antialiased selection:bg-[#38B6FF]/30">
      
      {/* Navbar Minimalista */}
    

      {/* Contenedor Principal */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white border border-slate-100 rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-100/50 relative overflow-hidden">
          
          {/* Detalle decorativo de fondo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#38B6FF]/10 to-transparent rounded-bl-full pointer-events-none" />

          {/* Icono y Títulos */}
          <div className="text-center space-y-3 mb-8">
            <div className="w-12 h-12 bg-[#F0F7FF] border border-[#BAD8F7] rounded-2xl flex items-center justify-center mx-auto text-[#0D3A6E]">
              <ShieldCheck className="w-6 h-6 text-[#38B6FF]" />
            </div>
            <h1 className="text-2xl font-black text-[#0D3A6E] tracking-tight">
              Portal de Verificación
            </h1>
            <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
              Ingresa el identificador único para validar la autenticidad de las acreditaciones de Dexpert.
            </p>
          </div>

          {/* Formulario de Búsqueda */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor="certificate-id" 
                className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2"
              >
                ID Único del Certificado
              </label>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  id="certificate-id"
                  className={`block w-full pl-11 pr-4 py-3.5 bg-slate-50 text-slate-800 placeholder-slate-400 border rounded-2xl focus:outline-none focus:ring-2 transition-all font-mono text-sm ${
                    error 
                      ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" 
                      : "border-slate-200 focus:ring-[#38B6FF]/20 focus:border-[#0D3A6E]"
                  }`}
                  placeholder="ej: clx87692-..."
                  value={certificateId}
                  onChange={(e) => {
                    setCertificateId(e.target.value);
                    if (error) setError("");
                  }}
                  disabled={isLoading}
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>
              {error && (
                <p className="text-xs font-medium text-red-500 mt-2 flex items-center gap-1 animate-pulse">
                  ⚠️ {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0D3A6E] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#0D3A6E]/10 hover:bg-[#1E4E8C] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Validar Certificado
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Tip / Ayuda al usuario */}
          <div className="mt-8 pt-6 border-t border-slate-50 flex items-start gap-3 bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-200">
            <FileText className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 leading-relaxed">
              <span className="font-bold text-slate-600">¿Dónde encontrarlo?</span> El código de verificación alfanumérico se encuentra impreso en la esquina inferior izquierda del documento PDF del certificado otorgado.
            </p>
          </div>

        </div>
      </main>

      {/* Footer / Lema de la plataforma */}
      <footer className="w-full text-center py-6 border-t border-slate-100">
        <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
          Dexpert — Donde el potencial no tiene límites
        </p>
      </footer>

    </div>
  );
}