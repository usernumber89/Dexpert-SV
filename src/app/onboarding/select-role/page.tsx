"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Building2 } from "lucide-react";

export default function SelectRolePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<"STUDENT" | "PYME" | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selected }),
      });
      if (!res.ok) throw new Error("Failed");
      router.push(selected === "STUDENT" ? "/onboarding/student" : "/onboarding/pyme");
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-raised flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-10 h-10 bg-brand-navy rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <h1 className="text-xl font-semibold text-brand-navy">Welcome to Dexpert</h1>
          <p className="text-sm text-ink-secondary mt-1">How will you use the platform?</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setSelected("STUDENT")}
            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
              selected === "STUDENT"
                ? "border-brand-mid bg-brand-light"
                : "border-brand-border bg-white hover:border-brand-mid"
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              selected === "STUDENT" ? "bg-brand-mid" : "bg-surface-raised"
            }`}>
              <GraduationCap className={`w-6 h-6 ${selected === "STUDENT" ? "text-white" : "text-ink-secondary"}`} />
            </div>
            <div className="text-center">
              <p className={`text-sm font-semibold ${selected === "STUDENT" ? "text-brand-title" : "text-brand-navy"}`}>
                Student
              </p>
              <p className="text-xs text-ink-secondary mt-0.5">
                Find projects and gain experience
              </p>
            </div>
          </button>

          <button
            onClick={() => setSelected("PYME")}
            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
              selected === "PYME"
                ? "border-brand-mid bg-brand-light"
                : "border-brand-border bg-white hover:border-brand-mid"
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              selected === "PYME" ? "bg-brand-mid" : "bg-surface-raised"
            }`}>
              <Building2 className={`w-6 h-6 ${selected === "PYME" ? "text-white" : "text-ink-secondary"}`} />
            </div>
            <div className="text-center">
              <p className={`text-sm font-semibold ${selected === "PYME" ? "text-brand-title" : "text-brand-navy"}`}>
                Business
              </p>
              <p className="text-xs text-ink-secondary mt-0.5">
                Post projects and find talent
              </p>
            </div>
          </button>
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected || loading}
          className="w-full bg-brand-mid text-white text-sm font-medium py-3 rounded-xl hover:bg-brand-title transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Setting up your account..." : "Continue"}
        </button>

      </div>
    </div>
  );
}