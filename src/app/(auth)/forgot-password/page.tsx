"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { Mail, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Por favor ingresá tu correo electrónico");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error("Error al enviar correo de recuperación:", error);
        toast.error("No pudimos procesar tu solicitud. Intentá de nuevo más tarde.");
        setLoading(false);
        return;
      }

      setSent(true);
      toast.success("Si el correo existe, recibirás un enlace de recuperación.");
    } catch (err) {
      console.error("Error inesperado:", err);
      toast.error("Ocurrió un error inesperado. Intentá de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-white to-[#E8F3FD] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#38A3F1] rounded-full opacity-10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#1D9E75] rounded-full opacity-10 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#F59E0B] rounded-full opacity-5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-[#BAD8F7] shadow-2xl shadow-[#0D3A6E]/10 p-8">
          <div className="text-center mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center justify-center mb-5 mx-auto"
            >
              <Image src="/dex.png" alt="Dexpert" width={200} height={50} className="w-50" />
            </motion.div>

            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-green-600" />
                  </div>
                </div>
                <h1 className="text-xl font-bold text-[#0D3A6E] mb-2">Revisá tu correo</h1>
                <p className="text-sm text-[#5B8DB8]">
                  Si existe una cuenta con <span className="font-medium text-[#0D3A6E]">{email}</span>,
                  recibirás un enlace para restablecer tu contraseña.
                </p>
              </motion.div>
            ) : (
              <>
                <h1 className="text-xl font-bold text-[#0D3A6E] mb-2">Recuperar contraseña</h1>
                <p className="text-sm text-[#5B8DB8]">
                  Ingresá tu correo y te enviaremos un enlace para restablecer tu contraseña.
                </p>
              </>
            )}
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    required
                    autoFocus
                    className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full cursor-pointer bg-[#0D3A6E] text-white text-sm font-semibold py-3 rounded-xl hover:bg-[#38A3F1] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando enlace...
                    </>
                  ) : (
                    <>
                      Enviar enlace de recuperación
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </motion.button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-[#5B8DB8] text-center leading-relaxed">
                El enlace expira en 1 hora. Si no lo ves en tu bandeja de entrada,
                revisá la carpeta de spam o correo no deseado.
              </p>

              <button
                type="button"
                onClick={() => { setSent(false); setEmail(""); }}
                className="w-full text-center text-xs text-[#38A3F1] hover:text-[#0D5FA6] font-medium transition-colors"
              >
                Enviar a otro correo
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/sign-in"
              className="text-xs text-[#38A3F1] hover:text-[#0D5FA6] font-medium transition-colors inline-flex items-center gap-1 group"
            >
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
              Volver a inicio de sesión
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
