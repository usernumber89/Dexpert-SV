"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { Lock, Eye, EyeOff, ArrowLeft, Check, X, AlertCircle, Loader2 } from "lucide-react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (processedRef.current) return;

      if (event === "PASSWORD_RECOVERY") {
        processedRef.current = true;
        setRecoveryMode(true);
        setCheckingSession(false);
        return;
      }

      if (event === "SIGNED_IN" && !recoveryMode) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          processedRef.current = true;
          setRecoveryMode(true);
          setCheckingSession(false);
          return;
        }
      }

      setCheckingSession(false);
    });

    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      if (data.session) {
        if (!processedRef.current) {
          processedRef.current = true;
          setRecoveryMode(true);
        }
      }
      setCheckingSession(false);
    });

    const hash = window.location.hash;
    if (hash && !processedRef.current) {
      const params = new URLSearchParams(hash.replace("#", "?"));
      const type = params.get("type");
      if (type === "recovery") {
        processedRef.current = true;
        setRecoveryMode(true);
        setCheckingSession(false);
      }
    }
  }, [recoveryMode]);

  const passwordChecks = {
    length: password.length >= 6,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    matches: password === confirmPassword && password.length > 0,
  };

  const passwordStrength = [passwordChecks.length, passwordChecks.hasLetter, passwordChecks.hasNumber, passwordChecks.hasSpecial].filter(Boolean).length;

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-400";
    if (passwordStrength === 3) return "bg-yellow-400";
    return "bg-green-400";
  };

  const isValid =
    passwordChecks.length &&
    passwordChecks.hasLetter &&
    passwordChecks.hasNumber &&
    passwordChecks.matches;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      toast.error("Asegurate de cumplir todos los requisitos de contraseña.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        console.error("Error al actualizar contraseña:", updateError);
        toast.error("No se pudo restablecer la contraseña. El enlace puede haber expirado.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      toast.success("¡Contraseña actualizada exitosamente!");

      await supabase.auth.signOut();

      setTimeout(() => {
        router.push("/sign-in");
      }, 2500);
    } catch (err) {
      console.error("Error inesperado:", err);
      toast.error("Ocurrió un error inesperado. Intentá de nuevo.");
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-white to-[#E8F3FD] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 text-[#38A3F1] animate-spin" />
          <p className="text-sm text-[#5B8DB8]">Verificando enlace de recuperación...</p>
        </div>
      </div>
    );
  }

  if (!recoveryMode && !success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-white to-[#E8F3FD] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#38A3F1] rounded-full opacity-10 blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#F59E0B] rounded-full opacity-10 blur-3xl animate-pulse delay-1000" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative"
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-[#BAD8F7] shadow-2xl shadow-[#0D3A6E]/10 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-red-500" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-[#0D3A6E] mb-2">Enlace inválido o expirado</h1>
            <p className="text-sm text-[#5B8DB8] mb-6">
              El enlace de recuperación no es válido o ya expiró. Solicitá uno nuevo para restablecer tu contraseña.
            </p>
            <Link
              href="/forgot-password"
              className="inline-flex items-center gap-2 bg-[#0D3A6E] text-white text-sm font-semibold py-3 px-6 rounded-xl hover:bg-[#38A3F1] transition-all"
            >
              Solicitar nuevo enlace
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

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

            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-7 h-7 text-green-600" />
                  </div>
                </div>
                <h1 className="text-xl font-bold text-[#0D3A6E] mb-2">¡Contraseña actualizada!</h1>
                <p className="text-sm text-[#5B8DB8]">
                  Vas a ser redirigido al inicio de sesión...
                </p>
              </motion.div>
            ) : (
              <>
                <h1 className="text-xl font-bold text-[#0D3A6E] mb-2">Restablecer contraseña</h1>
                <p className="text-sm text-[#5B8DB8]">
                  Elegí una contraseña segura para tu cuenta.
                </p>
              </>
            )}
          </div>

          {!success && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                    autoFocus
                    className="w-full text-sm pl-10 pr-10 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#93B8D4] hover:text-[#0D3A6E] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <>
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4].map(level => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            level <= passwordStrength ? getPasswordStrengthColor() : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-1 mt-1.5">
                      <div className="flex items-center gap-1">
                        {passwordChecks.length ? <Check className="w-3 h-3 text-green-500" /> : <X className="w-3 h-3 text-gray-300" />}
                        <span className="text-[10px] text-[#5B8DB8]">6+ caracteres</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {passwordChecks.hasLetter ? <Check className="w-3 h-3 text-green-500" /> : <X className="w-3 h-3 text-gray-300" />}
                        <span className="text-[10px] text-[#5B8DB8]">Letras</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {passwordChecks.hasNumber ? <Check className="w-3 h-3 text-green-500" /> : <X className="w-3 h-3 text-gray-300" />}
                        <span className="text-[10px] text-[#5B8DB8]">Números</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {passwordChecks.hasSpecial ? <Check className="w-3 h-3 text-green-500" /> : <X className="w-3 h-3 text-gray-300" />}
                        <span className="text-[10px] text-[#5B8DB8]">Especiales</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                  Confirmar nueva contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repetí la contraseña"
                    required
                    className="w-full text-sm pl-10 pr-10 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#93B8D4] hover:text-[#0D3A6E] transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && (
                  <div className="flex items-center gap-1 mt-1.5">
                    {passwordChecks.matches ? (
                      <>
                        <Check className="w-3 h-3 text-green-500" />
                        <span className="text-[10px] text-green-600">Las contraseñas coinciden</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3 text-red-400" />
                        <span className="text-[10px] text-red-400">Las contraseñas no coinciden</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={loading || !isValid}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full cursor-pointer bg-[#0D3A6E] text-white text-sm font-semibold py-3 rounded-xl hover:bg-[#38A3F1] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Actualizando contraseña...
                    </>
                  ) : (
                    <>
                      Restablecer contraseña
                      <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </motion.button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
