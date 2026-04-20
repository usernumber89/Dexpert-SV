"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  GraduationCap, 
  Code, 
  ArrowRight,
  Sparkles,
  BookOpen,
  MapPin
} from "lucide-react";

export default function StudentOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    education: "",
    skills: "",
    linked_in: "",
    location: "",
    major: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/sign-in"); return; }

    const skillsArray = form.skills.split(",").map(s => s.trim()).filter(Boolean);

    const { error } = await supabase.from("students").upsert({
      id: user.id,
      full_name: form.full_name,
      email: form.email,
      education: form.education,
      major: form.major,
      skills: skillsArray,
      linked_in: form.linked_in,
      location: form.location,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      toast.error("Error saving profile");
      console.error(error);
      setLoading(false);
      return;
    }

    toast.success("Profile completed! Welcome aboard! 🎓");
    router.push("/student/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-white to-[#E8F3FD] flex items-center justify-center p-6 relative">
      {/* Background decoration */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-[#38A3F1] rounded-full opacity-5 blur-3xl" />
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-[#1D9E75] rounded-full opacity-5 blur-3xl" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-[#BAD8F7] shadow-2xl p-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#38A3F1] to-[#1D9E75] rounded-lg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs font-medium uppercase tracking-widest text-[#38A3F1]">
                Step 2 of 2 • Student
              </p>
            </div>
            <h1 className="text-2xl font-bold text-[#0D3A6E] mb-2">
              Complete your profile
            </h1>
            <p className="text-sm text-[#5B8DB8]">
              This helps businesses find the perfect match for their projects
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                  Full name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                  <input
                    value={form.full_name}
                    onChange={e => setForm(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Rodrigo Campos"
                    required
                    className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                  Email <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="rodrigo@email.com"
                    required
                    className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                  />
                </div>
              </div>

              {/* Education */}
              <div>
                <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                  University/Institution
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                  <input
                    value={form.education}
                    onChange={e => setForm(prev => ({ ...prev, education: e.target.value }))}
                    placeholder="Universidad Dr. José Matías Delgado"
                    className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                  />
                </div>
              </div>

              {/* Major */}
              <div>
                <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                  Major/Field of Study
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                  <input
                    value={form.major}
                    onChange={e => setForm(prev => ({ ...prev, major: e.target.value }))}
                    placeholder="Computer Science"
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
                    placeholder="San Salvador"
                    className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                  />
                </div>
              </div>

              {/* LinkedIn */}
              <div>
                <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                  LinkedIn Profile
                </label>
                <div className="relative">
                  <Code className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
                  <input
                    value={form.linked_in}
                    onChange={e => setForm(prev => ({ ...prev, linked_in: e.target.value }))}
                    placeholder="linkedin.com/in/username"
                    className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
                Skills
              </label>
              <div className="relative">
                <Code className="absolute left-3 top-3 w-4 h-4 text-[#93B8D4]" />
                <textarea
                  value={form.skills}
                  onChange={e => setForm(prev => ({ ...prev, skills: e.target.value }))}
                  placeholder="React, Python, Marketing, Design... (separate with commas)"
                  rows={2}
                  className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-[#0D3A6E] placeholder:text-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all resize-none"
                />
              </div>
              <p className="text-[10px] text-[#93B8D4] mt-1">
                Add your top skills to get matched with relevant projects
              </p>
            </div>

            {/* AI Tip */}
            <div className="bg-gradient-to-r from-[#F0F7FF] to-[#E8F3FD] rounded-xl p-4 border border-[#BAD8F7]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#38A3F1] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0D3A6E] mb-1">
                    💡 Complete profile = Better matches
                  </p>
                  <p className="text-[10px] text-[#5B8DB8]">
                    Students with complete profiles get 3x more project invitations
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full bg-gradient-to-r from-[#38A3F1] to-[#1D9E75] text-white text-sm font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-[#38A3F1]/25 transition-all disabled:opacity-50 overflow-hidden group"
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