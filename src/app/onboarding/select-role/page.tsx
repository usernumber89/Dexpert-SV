"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { GraduationCap, Building2 } from "lucide-react";

export default function SelectRolePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<"STUDENT" | "PYME" | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/sign-in');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, role: selected });

    if (error) {
      toast.error("Error setting up account");
      setLoading(false);
      return;
    }

    router.push(selected === "STUDENT" ? "/onboarding/student" : "/onboarding/pyme");
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-10 h-10 bg-[#0D3A6E] rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <h1 className="text-xl font-semibold text-[#0D3A6E]">Welcome to Dexpert</h1>
          <p className="text-sm text-[#5B8DB8] mt-1">How will you use the platform?</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { key: "STUDENT" as const, label: "Student", desc: "Find projects and gain experience", icon: GraduationCap },
            { key: "PYME" as const, label: "Business", desc: "Post projects and find talent", icon: Building2 },
          ].map(({ key, label, desc, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                selected === key
                  ? "border-[#38A3F1] bg-[#D6EEFF]"
                  : "border-[#BAD8F7] bg-white hover:border-[#38A3F1]"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                selected === key ? "bg-[#38A3F1]" : "bg-[#F0F7FF]"
              }`}>
                <Icon className={`w-6 h-6 ${selected === key ? "text-white" : "text-[#5B8DB8]"}`} />
              </div>
              <div className="text-center">
                <p className={`text-sm font-semibold ${selected === key ? "text-[#0D5FA6]" : "text-[#0D3A6E]"}`}>
                  {label}
                </p>
                <p className="text-xs text-[#5B8DB8] mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected || loading}
          className="w-full bg-[#38A3F1] text-white text-sm font-medium py-3 rounded-xl hover:bg-[#0D5FA6] transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Setting up your account..." : "Continue"}
        </button>
      </div>
    </div>
  );
}