"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight,
  ArrowLeft,
  User,
  Check,
  X,
  Briefcase,
  GraduationCap,
  Shield,
  KeyRound,
  RefreshCw
} from "lucide-react";
import {DexpertLogo} from "@/components/DexpertLogo"

export default function SignUpPage() {
  const router = useRouter();
  
  // Paso actual: formulario o verificación
  const [step, setStep] = useState<"form" | "verification">("form");
  
  // Campos del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'ESTUDIANTE' | 'PYME' | null>(null);
  
  // Verificación
  const [verificationCode, setVerificationCode] = useState("");
  const [signUpEmail, setSignUpEmail] = useState(""); // email usado en signUp
  const [resending, setResending] = useState(false);

  // Validaciones de contraseña
  const passwordChecks = {
    length: password.length >= 6,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;
  
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-400";
    if (passwordStrength === 3) return "bg-yellow-400";
    return "bg-green-400";
  };

  // Enviar formulario inicial → envía código de verificación
  // Enviar formulario inicial → envía código de verificación
  // Enviar formulario inicial → envía código de verificación
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      toast.error("Por favor selecciona tu rol");
      return;
    }

    if (passwordStrength < 3) {
      toast.error("Por favor elige una contraseña más segura");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      // 1. Validar si el correo ya existe usando la función RPC
      const { data: emailExists, error: rpcError } = await supabase
        .rpc("check_if_email_exists", { email_to_check: email });

      if (rpcError) {
        console.error("Error al validar correo:", rpcError);
        toast.error("Hubo un problema al validar tu cuenta. Intenta de nuevo.");
        setLoading(false);
        return;
      }

      // 2. Si existe, detenemos el flujo y avisamos al usuario
      if (emailExists) {
        toast.error("Este correo electrónico ya está registrado.");
        setLoading(false);
        return;
      }

      // 3. Si no existe, procedemos con el registro normal de Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: selectedRole,
          },
        },
      });

      if (signUpError) {
        toast.error(signUpError.message);
        setLoading(false);
        return;
      }

      // Guardar email para la verificación
      setSignUpEmail(email);
      setStep("verification");
      toast.success("Código de verificación enviado a tu correo");
      
    } catch (err) {
      console.error(err);
      toast.error("Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  // Verificar código OTP
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode || verificationCode.length < 6) {
      toast.error("Por favor ingresa el código de 6 dígitos");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.verifyOtp({
      email: signUpEmail,
      token: verificationCode,
      type: "signup",
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Usuario verificado, ahora crear perfiles
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Crear perfil en tabla profiles
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({ id: user.id, role: selectedRole });

      if (profileError) {
        console.error("Error creando el perfil:", profileError);
      }

      // Crear perfil específico según el rol
      if (selectedRole === "ESTUDIANTE") {
        await supabase.from("students").upsert({
          user_id: user.id,
          full_name: fullName,
          email: signUpEmail,
        });
      } else {
        await supabase.from("pymes").upsert({
          user_id: user.id,
          company_name: fullName,
          contact_person: fullName,
          description: "",
        });
      }

      toast.success("Cuenta verificada exitosamente!");
      router.push(selectedRole === "ESTUDIANTE" ? "/onboarding/student" : "/onboarding/pyme");
    } else {
      toast.error("No se pudo obtener el usuario después de la verificación");
    }
    setLoading(false);
  };

  // Reenviar código
  const handleResendCode = async () => {
    setResending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: signUpEmail,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Código reenviado exitosamente");
    }
    setResending(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-white to-[#E8F3FD] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Animated Background Elements */}
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
          
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 1 }}
              className="w-14 h-14  flex items-center justify-center mx-auto mb-5  "
            >
              <DexpertLogo />
            </motion.div>
            
            <AnimatePresence mode="wait">
              {step === "form" ? (
                <motion.div key="form-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h1 className="text-xl font-bold text-[#0D3A6E] mb-2">Crea tu cuenta</h1>
                  <p className="text-sm text-[#5B8DB8]">Únete a Dexpert y comienza tu viaje</p>
                </motion.div>
              ) : (
                <motion.div key="verify-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h1 className="text-2xl font-bold text-[#0D3A6E] mb-2">Verifica tu correo</h1>
                  <p className="text-sm text-[#5B8DB8]">
                    Hemos enviado un código de 6 dígitos a <span className="font-medium text-[#0D3A6E]">{signUpEmail}</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {step === "form" ? (
              <motion.div key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                {/* Role Selector */}
                <div className="mb-6">
                  <label className="text-xs font-semibold text-[#0D3A6E] mb-2 block">Soy...</label>
                  <div className="flex gap-2 p-1 bg-[#F0F7FF] rounded-xl">
                    <button type="button" onClick={() => setSelectedRole('ESTUDIANTE')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                        selectedRole === 'ESTUDIANTE' ? 'bg-white text-[#0D3A6E] shadow-sm' : 'text-[#5B8DB8] hover:text-[#0D3A6E]'}`}>
                      <GraduationCap className="w-3.5 h-3.5" /> Estudiante
                    </button>
                    <button type="button" onClick={() => setSelectedRole('PYME')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                        selectedRole === 'PYME' ? 'bg-white text-[#0D3A6E] shadow-sm' : 'text-[#5B8DB8] hover:text-[#0D3A6E]'}`}>
                      <Briefcase className="w-3.5 h-3.5" /> Empresa
                    </button>
                  </div>
                  {!selectedRole && <p className="text-[10px] text-[#93B8D4] mt-1.5">Selecciona tu rol para continuar</p>}
                </div>

                {/* Sign Up Form */}
                <form onSubmit={handleSignUp} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">Nombre completo</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                      <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Rodrigo Campos" required
                        className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all" />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">Correo electrónico</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" required
                        className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all" />
                    </div>
                  </div>

                  {/* Password + strength */}
                  <div>
                    <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                      <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Crea una contraseña segura" required minLength={6}
                        className="w-full text-sm pl-10 pr-10 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#93B8D4] hover:text-[#0D3A6E] transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {password && (
                      <div className="mt-2 space-y-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div key={level} className={`h-1 flex-1 rounded-full transition-all ${
                              level <= passwordStrength ? getPasswordStrengthColor() : "bg-gray-200"}`} />
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-1">
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
                            <span className="text-[10px] text-[#5B8DB8]">Caracteres especiales</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-2 py-2">
                    <input type="checkbox" required className="mt-0.5 w-3.5 h-3.5 rounded border-[#BAD8F7] text-[#38A3F1] focus:ring-[#38A3F1]/20" />
                    <span className="text-[10px] text-[#5B8DB8]">
                      Estoy de acuerdo con los{" "}
                      <Link href="/terminos" target="_blank" className="text-[#38A3F1] hover:underline">Términos de Servicio</Link>{" "}
                      y{" "}
                      <Link href="/privacidad" target="_blank" className="text-[#38A3F1] hover:underline">Política de Privacidad</Link>
                    </span>
                  </div>

                  {/* Submit button */}
                  <motion.button type="submit" disabled={loading}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
             
                   className="relative w-full cursor-pointer bg-[#0D3A6E] text-white text-sm font-semibold py-3 rounded-xl  hover:bg-[#38A3F1] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Enviando código...
                        </>
                      ) : (
                        <>
                          Continuar
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                    
                  </motion.button>
                </form>

                {/* Sign In Link */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-[#5B8DB8]">
                    ¿Ya tienes una cuenta?{" "}
                    <Link href="/sign-in" className="text-[#38A3F1] hover:text-[#0D5FA6] font-semibold transition-colors inline-flex items-center gap-1 group">
                      Iniciar sesión
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="verification" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {/* Verification Form */}
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">Código de verificación</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={8}
                        value={verificationCode}
                        onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="00000000"
                        required
                        className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] text-center tracking-[0.5em] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                      />
                    </div>
                  </div>

                  <motion.button type="submit" disabled={loading}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="relative w-full bg-gradient-to-r from-[#0D3A6E] to-[#1D5A9E] text-white text-sm font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-[#38A3F1]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Verificando...
                        </>
                      ) : (
                        <>
                          Verificar y crear cuenta
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#38A3F1] to-[#1D9E75] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.button>

                  {/* Resend code */}
                  <div className="flex items-center justify-between pt-2">
                    <button type="button" onClick={() => setStep("form")}
                      className="text-xs text-[#5B8DB8] hover:text-[#0D3A6E] flex items-center gap-1 transition-colors">
                      <ArrowLeft className="w-3 h-3" /> Atrás
                    </button>
                    <button type="button" onClick={handleResendCode} disabled={resending}
                      className="text-xs text-[#38A3F1] hover:text-[#0D5FA6] font-medium flex items-center gap-1 transition-colors disabled:opacity-50">
                      {resending ? (
                        <div className="w-3 h-3 border-2 border-[#38A3F1] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3" />
                      )}
                      Reenviar código
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

       
      </motion.div>
    </div>
  );
}