"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight,
  Sparkles,
  Briefcase,
  GraduationCap
} from "lucide-react";
import { DexpertLogo } from "@/components/DexpertLogo";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'ESTUDIANTE' | 'PYME' | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // --- INTERCEPTAR CREDENCIALES INVÁLIDAS ---
      if (error.message.includes("Invalid login credentials")) {
        toast.error("El correo o la contraseña son incorrectos.");
      } else if (error.message.includes("Email not confirmed")) {
        toast.error("Por favor, verifica tu correo electrónico antes de iniciar sesión.");
      } else {
        toast.error(error.message);
      }
      setLoading(false);
      return;
    }

    // Obtener rol y redirigir
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role) {
        toast.success(`¡Bienvenido de nuevo!`);
        router.push(profile.role === 'ESTUDIANTE' ? '/student/dashboard' : '/pyme/dashboard');
      } else {
        router.push('/onboarding/select-role');
      }
    }
    setLoading(false);
  };

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    });
    
    if (error) {
      toast.error(error.message);
    }
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
        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-[#BAD8F7] shadow-2xl shadow-[#0D3A6E]/10 p-8">
          
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center justify-center mx-auto mb-5 "
            >
              <DexpertLogo variant="dark"/>
            </motion.div>
            
            <h1 className="text-xl font-bold text-[#0D3A6E] mb-2">
              ¡Bienvenido de nuevo a Dexpert!
            </h1>
            <p className="text-sm text-[#5B8DB8]">
              Inicia sesión para continuar tu viaje
            </p>
          </div>

          {/* Role Selector */}
          <div className="flex gap-2 p-1 bg-[#F0F7FF] rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setSelectedRole('ESTUDIANTE')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedRole === 'ESTUDIANTE'
                  ? 'bg-white text-[#0D3A6E] shadow-sm'
                  : 'text-[#5B8DB8] hover:text-[#0D3A6E]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Estudiante
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('PYME')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedRole === 'PYME'
                  ? 'bg-white text-[#0D3A6E] shadow-sm'
                  : 'text-[#5B8DB8] hover:text-[#0D3A6E]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Empresa
            </button>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSignIn} className="space-y-5">
            {/* Email Field */}
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
                  className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#0D3A6E]">
                  Contraseña
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-[10px] text-[#38A3F1] hover:text-[#0D5FA6] font-medium transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full text-sm pl-10 pr-10 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#93B8D4] hover:text-[#0D3A6E] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />)}
                </button>
              </div>
            </div>

            {/* Submit Button */}
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
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    Iniciar sesión
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </motion.button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-xs text-[#5B8DB8]">
              ¿No tienes una cuenta?{" "}
              <Link 
                href="/sign-up" 
                className="text-[#38A3F1] hover:text-[#0D5FA6] font-semibold transition-colors inline-flex items-center gap-1 group"
              >
                Crear cuenta
                
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}