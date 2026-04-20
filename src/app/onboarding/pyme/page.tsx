"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function PymeOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    contact: "",
    description: "",
    website: "",
    location: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/sign-in"); return; }

    const { error } = await supabase.from("pymes").upsert({
      user_id: user.id,
      ...form,
    });

    if (error) {
      toast.error("Error saving profile");
      setLoading(false);
      return;
    }

    toast.success("Business profile created!");
    router.push("/pyme/dashboard");
  };

  const fields = [
    { key: "name", label: "Business name", placeholder: "Granja Los Campos", required: true },
    { key: "contact", label: "Contact person", placeholder: "Rodrigo Campos", required: true },
    { key: "description", label: "What does your business do?", placeholder: "We are a poultry farm...", required: true },
    { key: "website", label: "Website", placeholder: "www.mibusiness.com", required: false },
    { key: "location", label: "Location", placeholder: "San Juan Opico, La Libertad", required: false },
  ];

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#BAD8F7] p-8">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-[#38A3F1] mb-2">Step 2 of 2</p>
          <h1 className="text-xl font-semibold text-[#0D3A6E]">Set up your business</h1>
          <p className="text-sm text-[#5B8DB8] mt-1">Tell students about your company</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium text-[#5B8DB8] mb-1.5 block">
                {f.label} {!f.required && <span className="text-[#93B8D4]">(optional)</span>}
              </label>
              {f.key === "description" ? (
                <textarea
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  required={f.required}
                  rows={3}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-[#BAD8F7] text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] resize-none"
                />
              ) : (
                <input
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  required={f.required}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-[#BAD8F7] text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1]"
                />
              )}
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