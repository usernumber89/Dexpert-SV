"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function StudentOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    education: "",
    skills: "",
    linked_in: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/sign-in"); return; }

    const { error } = await supabase.from("students").upsert({
      user_id: user.id,
      ...form,
    });

    if (error) {
      toast.error("Error saving profile");
      setLoading(false);
      return;
    }

    toast.success("Profile created!");
    router.push("/student/dashboard");
  };

  const fields = [
    { key: "full_name", label: "Full name", placeholder: "Rodrigo Campos", required: true },
    { key: "email", label: "Email", placeholder: "rodrigo@email.com", required: true },
    { key: "education", label: "Education", placeholder: "Universidad Dr. José Matías Delgado", required: false },
    { key: "skills", label: "Skills", placeholder: "React, Design, Marketing...", required: false },
    { key: "linked_in", label: "LinkedIn", placeholder: "linkedin.com/in/rodrigo", required: false },
  ];

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#BAD8F7] p-8">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-[#38A3F1] mb-2">Step 2 of 2</p>
          <h1 className="text-xl font-semibold text-[#0D3A6E]">Complete your profile</h1>
          <p className="text-sm text-[#5B8DB8] mt-1">This helps businesses find the right fit</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium text-[#5B8DB8] mb-1.5 block">
                {f.label} {!f.required && <span className="text-[#93B8D4]">(optional)</span>}
              </label>
              <input
                value={form[f.key as keyof typeof form]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                required={f.required}
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-[#BAD8F7] text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1]"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#38A3F1] text-white text-sm font-medium py-3 rounded-xl hover:bg-[#0D5FA6] transition disabled:opacity-50 mt-2"
          >
            {loading ? "Saving..." : "Go to dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}