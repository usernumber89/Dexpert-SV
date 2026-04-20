"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    router.push('/onboarding/select-role');
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#BAD8F7] p-8">

        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-[#0D3A6E] rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <h1 className="text-xl font-semibold text-[#0D3A6E]">Create your account</h1>
          <p className="text-sm text-[#5B8DB8] mt-1">Join Dexpert today</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#5B8DB8] mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-[#BAD8F7] text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#5B8DB8] mb-1.5 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-[#BAD8F7] text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#38A3F1] text-white text-sm font-medium py-2.5 rounded-xl hover:bg-[#0D5FA6] transition disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-xs text-[#5B8DB8] mt-6">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-[#38A3F1] hover:text-[#0D5FA6] font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}