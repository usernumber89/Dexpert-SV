"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Star, StarOff, User, MapPin, BookOpen, Trash2,
  MessageSquare, Mail, Search, Crown, ExternalLink,
} from "lucide-react";
import {
  getSavedStudents, removeSavedStudent, getPymePlan,
} from "@/app/actions/pyme/premium";
import { isPremiumPlan } from "@/lib/premium";
import { toast } from "sonner";
import Link from "next/link";

type SavedStudent = {
  id: string;
  student_id: string;
  notes: string | null;
  created_at: string;
  student: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    major: string | null;
    university: string | null;
    location: string | null;
    skills: string[] | null;
  };
};

export function TalentPoolPanel() {
  const [saved, setSaved] = useState<SavedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    getPymePlan().then(setPlan);
    getSavedStudents().then((data) => {
      setSaved(data as SavedStudent[]);
      setLoading(false);
    });
  }, []);

  const isPremium = isPremiumPlan(plan);

  const filtered = saved.filter((s) =>
    !search || s.student.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRemove = async (studentId: string) => {
    const res = await removeSavedStudent(studentId);
    if (res.success) {
      setSaved((prev) => prev.filter((s) => s.student_id !== studentId));
      toast.success("Estudiante eliminado de favoritos");
    }
  };

  if (!isPremium) {
    return (
      <div className="bg-white rounded-2xl border border-[#E8F3FD] p-8 text-center">
        <Crown className="w-12 h-12 text-[#F59E0B] mx-auto mb-4" />
        <h3 className="text-base font-bold text-[#0D3A6E] mb-2">Talent Pool Premium</h3>
        <p className="text-sm text-[#5B8DB8] max-w-md mx-auto mb-4">
            Guardá estudiantes destacados en tu Talent Pool para contactarlos cuando tengas proyectos disponibles.
        </p>
        <Link
          href="/pyme/pricing"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[#0D3A6E] px-5 py-2.5 rounded-xl hover:bg-[#0D5FA6] transition"
        >
          <Crown className="w-4 h-4" />
          Adquirir plan premium
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93B8D4]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar en tu Talent Pool..."
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E8F3FD] rounded-xl focus:outline-none focus:border-[#38A3F1] text-[#0D3A6E] placeholder:text-[#93B8D4]"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-4 border-[#BAD8F7] border-t-[#38A3F1] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E8F3FD] p-8 text-center">
          <Star className="w-10 h-10 text-[#BAD8F7] mx-auto mb-3" />
          <p className="text-sm text-[#5B8DB8]">
            {saved.length === 0
              ? "Aún no has guardado estudiantes. Explorá el directorio de talento y guardá tus favoritos."
              : "No hay estudiantes que coincidan con tu búsqueda"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const s = item.student;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-[#E8F3FD] p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {s.avatar_url ? (
                      <img src={s.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border border-[#BAD8F7]" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#F0F7FF] border border-[#BAD8F7] flex items-center justify-center">
                        <User className="w-4 h-4 text-[#38A3F1]" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0D3A6E] truncate">{s.full_name}</p>
                      <p className="text-[10px] text-[#93B8D4]">{s.major || "Estudiante"}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(s.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition text-[#93B8D4] hover:text-red-500"
                    title="Eliminar de favoritos"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {s.university && (
                  <p className="text-[11px] text-[#5B8DB8] flex items-center gap-1 mb-1">
                    <BookOpen className="w-3 h-3" />
                    {s.university}
                  </p>
                )}
                {s.location && (
                  <p className="text-[11px] text-[#5B8DB8] flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3" />
                    {s.location}
                  </p>
                )}

                {s.skills && s.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {s.skills.slice(0, 3).map((skill, i) => (
                      <span key={i} className="text-[10px] bg-[#F0F7FF] text-[#0D5FA6] px-2 py-0.5 rounded-full font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {item.notes && (
                  <p className="text-[11px] text-[#5B8DB8] italic border-t border-[#E8F3FD] pt-2 mt-2">
                    "{item.notes}"
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
