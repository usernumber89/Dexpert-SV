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
  User,
  Check,
  X,
  Briefcase,
  GraduationCap,
  Shield
} from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'PYME' | null>(null);

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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    if (passwordStrength < 3) {
      toast.error("Please choose a stronger password");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    
    // Registrar usuario con metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: selectedRole,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Crear perfil en la tabla profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: email,
          full_name: fullName,
          role: selectedRole,
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }

      toast.success("Account created successfully!");
      
      // ✅ SIEMPRE redirigir a select-role
      router.push('/onboarding/select-role');
    }
  };

  const handleOAuthSignUp = async (provider: 'github' | 'google') => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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
        
        {/* Floating elements */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-20 left-10 text-2xl opacity-20"
        >
          ✨
        </motion.div>
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute bottom-20 right-10 text-2xl opacity-20"
        >
          🚀
        </motion.div>
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
          <div className="text-center mb-6">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-14 h-14 bg-gradient-to-br from-[#0D3A6E] to-[#1D5A9E] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#0D3A6E]/20"
            >
              <span className="text-white font-bold text-2xl">D</span>
            </motion.div>
            
            <h1 className="text-2xl font-bold text-[#0D3A6E] mb-2">
              Create your account
            </h1>
            <p className="text-sm text-[#5B8DB8]">
              Join Dexpert and start your journey
            </p>
          </div>

          {/* Role Selector */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-[#0D3A6E] mb-2 block">
              I am a...
            </label>
            <div className="flex gap-2 p-1 bg-[#F0F7FF] rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedRole('STUDENT')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  selectedRole === 'STUDENT'
                    ? 'bg-white text-[#0D3A6E] shadow-sm'
                    : 'text-[#5B8DB8] hover:text-[#0D3A6E]'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Student
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('PYME')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  selectedRole === 'PYME'
                    ? 'bg-white text-[#0D3A6E] shadow-sm'
                    : 'text-[#5B8DB8] hover:text-[#0D3A6E]'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Business
              </button>
            </div>
            {!selectedRole && (
              <p className="text-[10px] text-[#93B8D4] mt-1.5">
                Select your role to continue
              </p>
            )}
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Full Name Field */}
            <div>
              <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  minLength={6}
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
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          level <= passwordStrength
                            ? getPasswordStrengthColor()
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* Password Requirements */}
                  <div className="grid grid-cols-2 gap-1">
                    <div className="flex items-center gap-1">
                      {passwordChecks.length ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <X className="w-3 h-3 text-gray-300" />
                      )}
                      <span className="text-[10px] text-[#5B8DB8]">6+ characters</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordChecks.hasLetter ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <X className="w-3 h-3 text-gray-300" />
                      )}
                      <span className="text-[10px] text-[#5B8DB8]">Letters</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordChecks.hasNumber ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <X className="w-3 h-3 text-gray-300" />
                      )}
                      <span className="text-[10px] text-[#5B8DB8]">Numbers</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordChecks.hasSpecial ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <X className="w-3 h-3 text-gray-300" />
                      )}
                      <span className="text-[10px] text-[#5B8DB8]">Special char</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-2 py-2">
              <input
                type="checkbox"
                required
                className="mt-0.5 w-3.5 h-3.5 rounded border-[#BAD8F7] text-[#38A3F1] focus:ring-[#38A3F1]/20"
              />
              <span className="text-[10px] text-[#5B8DB8]">
                I agree to the{" "}
                <Link href="/terms" className="text-[#38A3F1] hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#38A3F1] hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full bg-gradient-to-r from-[#0D3A6E] to-[#1D5A9E] text-white text-sm font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-[#38A3F1]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#38A3F1] to-[#1D9E75] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#BAD8F7]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-[#93B8D4]">or sign up with</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuthSignUp('google')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#BAD8F7] text-sm font-medium text-[#5B8DB8] hover:bg-[#F0F7FF] hover:border-[#38A3F1] hover:text-[#0D3A6E] transition-all group"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            
            <button
              type="button"
              onClick={() => handleOAuthSignUp('github')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#BAD8F7] text-sm font-medium text-[#5B8DB8] hover:bg-[#F0F7FF] hover:border-[#38A3F1] hover:text-[#0D3A6E] transition-all group"
            >
              <Sparkles className="w-4 h-4" />
              GitHub
            </button>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-xs text-[#5B8DB8]">
              Already have an account?{" "}
              <Link 
                href="/sign-in" 
                className="text-[#38A3F1] hover:text-[#0D5FA6] font-semibold transition-colors inline-flex items-center gap-1 group"
              >
                Sign in
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-[#1D9E75]" />
            <span className="text-[10px] text-[#93B8D4]">Secure</span>
          </div>
          <div className="w-1 h-1 bg-[#BAD8F7] rounded-full" />
          <span className="text-[10px] text-[#93B8D4]">Free forever</span>
          <div className="w-1 h-1 bg-[#BAD8F7] rounded-full" />
          <span className="text-[10px] text-[#93B8D4]">No credit card</span>
        </div>
      </motion.div>
    </div>
  );
}