"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Mail, MapPin, GraduationCap, CheckCircle2, Star,
  Briefcase, ExternalLink, Loader2, ShieldCheck,
} from "lucide-react";
import { LinkedinLogoIcon, GithubLogoIcon } from "@phosphor-icons/react";
import {
  getStudentById, getSavedStudents, saveStudent, removeSavedStudent,
  hasTalentAccess,
} from "@/app/actions/pyme/premium";
import { TalentPaywall } from "@/features/pyme/components/TalentPaywall";
import { ProfileGallery } from "@/components/ProfileGallery";
import { toast } from "sonner";
import Link from "next/link";

type Student = {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  bio: string | null;
  education: string | null;
  university: string | null;
  major: string | null;
  skills: string[];
  location: string | null;
  avatar_url: string | null;
  verified: boolean;
  github: string | null;
  linkedin: string | null;
  portfolio: string | null;
  resume_url: string | null;
};

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [access, setAccess] = useState<boolean | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const h = await hasTalentAccess();
      setAccess(h);
      if (!h) { setLoading(false); return; }

      const [s, saved] = await Promise.all([
        getStudentById(studentId),
        getSavedStudents(),
      ]);
      setStudent(s as Student | null);
      setIsSaved(saved.some((x: any) => x.student_id === studentId));
      setLoading(false);
    })();
  }, [studentId]);

  const handleToggleSave = async () => {
    if (isSaved) {
      const res = await removeSavedStudent(studentId);
      if (res.success) {
        setIsSaved(false);
        toast.success("Eliminado de favoritos");
      }
    } else {
      const res = await saveStudent(studentId);
      if (res.success) {
        setIsSaved(true);
        toast.success("Guardado en Talent Pool");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-white to-[#E8F3FD] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#38A3F1] animate-spin" />
      </div>
    );
  }

  if (access === false) return <TalentPaywall />;

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-white to-[#E8F3FD] flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-[#5B8DB8]">Estudiante no encontrado</p>
          <Link href="/pyme/talent" className="mt-4 inline-flex items-center gap-1 text-sm text-[#38A3F1] hover:underline">
            <ArrowLeft className="w-4 h-4" /> Volver al directorio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-white to-[#E8F3FD]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-[#5B8DB8] hover:text-[#0D3A6E] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-[#BAD8F7] overflow-hidden shadow-xl shadow-[#38A3F1]/5"
        >
          <div className="bg-gradient-to-r from-[#F0F7FF] to-[#E8F3FD] p-8 pb-0">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-[#F0F7FF] to-[#E8F3FD] border-2 border-[#BAD8F7] flex-shrink-0 overflow-hidden shadow-md">
                {student.avatar_url ? (
                  <img src={student.avatar_url} alt={student.full_name || ""} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[#38A3F1]">
                    {student.full_name?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
                {student.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 pb-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-[#0D3A6E]">
                      {student.full_name}
                    </h1>
                    <p className="text-sm text-[#5B8DB8] mt-1 font-medium">
                      {student.major || student.education || "Estudiante"}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-[#93B8D4]">
                      {student.university && (
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5" />
                          {student.university}
                        </span>
                      )}
                      {student.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {student.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleToggleSave}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0 ${
                      isSaved
                        ? "bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100"
                        : "bg-white text-[#5B8DB8] border border-[#BAD8F7] hover:bg-[#F0F7FF]"
                    }`}
                  >
                    <Star className={`w-4 h-4 ${isSaved ? "fill-amber-400 text-amber-400" : ""}`} />
                    {isSaved ? "Guardado" : "Guardar"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {student.bio && (
              <div>
                <h3 className="text-sm font-semibold text-[#0D3A6E] mb-2">Sobre mí</h3>
                <p className="text-sm text-[#5B8DB8] leading-relaxed">{student.bio}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-[#0D3A6E] mb-3">Habilidades</h3>
              <div className="flex flex-wrap gap-2">
                {student.skills?.length > 0 ? student.skills.map((skill, i) => (
                  <span key={i} className="text-xs font-medium bg-[#F0F7FF] text-[#0D5FA6] px-3 py-1.5 rounded-xl border border-[#BAD8F7]/50">
                    {skill}
                  </span>
                )) : (
                  <span className="text-xs text-[#93B8D4]">Sin habilidades registradas</span>
                )}
              </div>
            </div>

            {student.resume_url && (
              <div>
                <h3 className="text-sm font-semibold text-[#0D3A6E] mb-2">Curriculum</h3>
                <a
                  href={student.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[#38A3F1] hover:underline"
                >
                  <Briefcase className="w-4 h-4" /> Ver CV <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-6 border-t border-[#E8F3FD]">
              <a
                href={`mailto:${student.email}?subject=Oportunidad%20de%20Proyecto%20-%20Contacto%20desde%20la%20plataforma`}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#0D3A6E] to-[#1D5A9E] text-white text-sm font-medium px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-[#38A3F1]/25 transition-all"
              >
                <Mail className="w-4 h-4" />
                Contactar por correo
              </a>

              {student.linkedin && (
                <a href={student.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white text-[#0D3A6E] text-sm font-medium px-5 py-3 rounded-xl border border-[#BAD8F7] hover:bg-[#F0F7FF] transition-all">
                  <LinkedinLogoIcon className="w-4 h-4" />
                  LinkedIn
                </a>
              )}
              {student.github && (
                <a href={student.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white text-[#0D3A6E] text-sm font-medium px-5 py-3 rounded-xl border border-[#BAD8F7] hover:bg-[#F0F7FF] transition-all">
                  <GithubLogoIcon className="w-4 h-4" />
                  GitHub
                </a>
              )}
              {student.portfolio && (
                <a href={student.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white text-[#0D3A6E] text-sm font-medium px-5 py-3 rounded-xl border border-[#BAD8F7] hover:bg-[#F0F7FF] transition-all">
                  <Briefcase className="w-4 h-4" />
                  Portafolio
                </a>
              )}
            </div>

            {/* Student Portfolio Gallery */}
            <div className="pt-4 border-t border-[#E8F3FD]">
              <h3 className="text-base font-semibold text-[#0D3A6E] mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#38A3F1] rounded-full" />
                Portafolio
              </h3>
              <ProfileGallery
                ownerId={student.id}
                type="student"
                isOwner={false}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
