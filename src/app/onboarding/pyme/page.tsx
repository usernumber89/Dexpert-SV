"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  Building2, 
  User, 
  FileText, 
  Globe, 
  MapPin, 
  ArrowRight,
  Sparkles,
  Briefcase,
  Phone
} from "lucide-react";

export default function PymeOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    contact: "",
    description: "",
    website: "",
    location: "",
    phone: "",
    industry: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/sign-in"); return; }

    const { error } = await supabase.from("pymes").upsert({
      id: user.id,
      company_name: form.name,
      contact_person: form.contact,
      description: form.description,
      website: form.website,
      location: form.location,
      phone: form.phone,
      industry: form.industry,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      toast.error("Error saving profile");
      console.error(error);
      setLoading(false);
      return;
    }

    toast.success("Business profile created! Welcome! 🚀");
    router.push("/pyme/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-white to-[#E8F3FD] flex items-center justify-center p-6 relative">
      {/* Background decoration */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-[#0D3A6E] rounded-full opacity-5 blur-3xl" />
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-[#F59E0B] rounded-full opacity-5 blur-3xl" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-[#BAD8F7] shadow-2xl p-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#0D3A6E] to-[#1D5A9E] rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs font-medium uppercase tracking-widest text-[#0D5FA6]">
                Step 2 of 2 • Business
              </p>
            </div>
            <h1 className="text-2xl font-bold text-[#0D3A6E] mb-2">
              Set up your business profile
            </h1>
            <p className="text-sm text-[#5B8DB8]">
              Tell students about your company and start posting projects
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Business Name */}
              <div>
                <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                  Business name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                  <input
                    value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Granja Los Campos"
                    required
                    className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                  />
                </div>
              </div>

              {/* Contact Person */}
              <div>
                <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                  Contact person <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                  <input
                    value={form.contact}
                    onChange={e => setForm(prev => ({ ...prev, contact: e.target.value }))}
                    placeholder="Rodrigo Campos"
                    required
                    className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                  />
                </div>
              </div>

              {/* Industry */}
              <div>
                <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                  Industry
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                  <input
                    value={form.industry}
                    onChange={e => setForm(prev => ({ ...prev, industry: e.target.value }))}
                    placeholder="Agriculture, Technology, Retail..."
                    className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                  <input
                    value={form.phone}
                    onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+503 1234 5678"
                    className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                  Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                  <input
                    value={form.website}
                    onChange={e => setForm(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="www.mibusiness.com"
                    className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                  <input
                    value={form.location}
                    onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="San Juan Opico, La Libertad"
                    className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                What does your business do? <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-[#93B8D4]" />
                <textarea
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="We are a poultry farm specializing in..."
                  required
                  rows={3}
                  className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all resize-none"
                />
              </div>
              <p className="text-[10px] text-[#93B8D4] mt-1">
                A clear description helps students understand your business needs
              </p>
            </div>

            {/* AI Tip */}
            <div className="bg-gradient-to-r from-[#F0F7FF] to-[#E8F3FD] rounded-xl p-4 border border-[#BAD8F7]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#F59E0B] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0D3A6E] mb-1">
                    💡 Complete profiles get better matches
                  </p>
                  <p className="text-[10px] text-[#5B8DB8]">
                    Businesses with complete profiles receive 2x more quality applications
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full bg-gradient-to-r from-[#0D3A6E] to-[#1D5A9E] text-white text-sm font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-[#0D3A6E]/25 transition-all disabled:opacity-50 overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating profile...
                  </>
                ) : (
                  <>
                    Complete profile
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}