"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  MapPin,
  GraduationCap,
  Mail,
  ArrowUpRight,
  Sparkles,
  Users,
  Briefcase,
  Star,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {GithubLogoIcon, LinkedinLogoIcon} from "@phosphor-icons/react"
import { saveStudent, removeSavedStudent, getSavedStudents, getStudents } from "@/app/actions/pyme/premium";

// Ajustado según el esquema de tu base de datos
type Student = {
  id: string;
  full_name: string | null;
  email: string;
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
};

export default function TalentSearchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string>("all");
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadStudents();
    loadSavedAndPlan();
  }, []);

  const loadSavedAndPlan = async () => {
    const saved = await getSavedStudents();
    setSavedIds(new Set(saved.map((s: any) => s.student_id)));
  };

  const handleToggleSave = async (studentId: string) => {
    if (savedIds.has(studentId)) {
      const res = await removeSavedStudent(studentId);
      if (res.success) {
        setSavedIds(prev => { const next = new Set(prev); next.delete(studentId); return next; });
        toast.success("Eliminado de favoritos");
      }
    } else {
      const res = await saveStudent(studentId);
      if (res.success) {
        setSavedIds(prev => new Set(prev).add(studentId));
        toast.success("Guardado en Talent Pool");
      }
    }
  };

  useEffect(() => {
    filterData();
  }, [searchTerm, selectedSkill, students]);

  const loadStudents = async () => {
    try {
      const data = await getStudents();

      if (data) {
        setStudents(data);
        
        // Extraer todas las habilidades únicas para el filtro
        const allSkills = new Set<string>();
        (data as Student[]).forEach((student: Student) => {
    if (student.skills) {
      student.skills.forEach((skill: string) => allSkills.add(skill));
    }
  });
        setAvailableSkills(Array.from(allSkills).sort());
      }
    } catch (error) {
      console.error("Error loading talent:", error);
      toast.error("Error loading the talent directory");
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = [...students];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.full_name?.toLowerCase().includes(term) ||
        s.major?.toLowerCase().includes(term) ||
        s.university?.toLowerCase().includes(term) ||
        s.skills?.some(skill => skill.toLowerCase().includes(term))
      );
    }

    if (selectedSkill !== "all") {
      filtered = filtered.filter(s => 
        s.skills?.includes(selectedSkill)
      );
    }

    setFilteredStudents(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F7FF] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#38A3F1] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#5B8DB8]">Cargando talento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-white to-[#E8F3FD]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <p className="text-[10px] sm:text-xs font-medium uppercase tracking-widest text-[#93B8D4] mb-1 sm:mb-2">
            Directorio de Talento
          </p>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0D3A6E] mb-1 sm:mb-2">
            Encuentra al estudiante ideal
          </h1>
          <p className="text-xs sm:text-sm text-[#5B8DB8]">
            Explora perfiles, filtra por habilidades técnicas y conecta con talento junior para tus proyectos.
          </p>
        </div>

        {/* Search and Filters Banner */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-[#BAD8F7] p-3 sm:p-5 mb-4 sm:mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#93B8D4]" />
              <input
                type="text"
                placeholder="Buscar por nombre, carrera, universidad o habilidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-[#BAD8F7] text-xs sm:text-sm text-[#0D3A6E] focus:outline-none focus:border-[#38A3F1] focus:ring-4 focus:ring-[#38A3F1]/10 transition-all bg-[#F8FBFF] min-h-[44px]"
              />
            </div>
            
            {/* Skills Filter */}
            <div className="md:w-64 relative">
              <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#93B8D4]" />
              </div>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-[#BAD8F7] text-xs sm:text-sm text-[#0D3A6E] focus:outline-none focus:border-[#38A3F1] focus:ring-4 focus:ring-[#38A3F1]/10 appearance-none bg-[#F8FBFF] transition-all cursor-pointer min-h-[44px]"
              >
                <option value="all">Todas las habilidades</option>
                {availableSkills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <p className="text-xs sm:text-sm font-medium text-[#5B8DB8]">
            Mostrando <span className="text-[#0D3A6E] font-bold">{filteredStudents.length}</span> estudiantes
          </p>
        </div>

        {/* Students Grid */}
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl border border-[#BAD8F7] py-12 sm:py-20 text-center">
            <Users className="w-12 h-12 sm:w-16 sm:h-16 text-[#BAD8F7] mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-[#0D3A6E] mb-1 sm:mb-2">No se encontraron estudiantes</h3>
            <p className="text-xs sm:text-sm text-[#5B8DB8]">Intenta ajustar tus términos de búsqueda o filtros.</p>
            <button 
              onClick={() => { setSearchTerm(""); setSelectedSkill("all"); }}
              className="mt-4 sm:mt-6 text-xs sm:text-sm font-medium text-[#38A3F1] hover:text-[#0D5FA6] transition-colors min-h-[44px]"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <AnimatePresence>
              {filteredStudents.map((student) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={student.id}
                  className="bg-white rounded-2xl border border-[#BAD8F7] overflow-hidden hover:shadow-xl hover:shadow-[#38A3F1]/10 transition-all group flex flex-col"
                >
                  {/* Card Header */}
                  <div className="p-6 pb-0 flex gap-4">
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F0F7FF] to-[#E8F3FD] border border-[#BAD8F7] flex-shrink-0 overflow-hidden">
                      {student.avatar_url ? (
                        <Image
                          src={student.avatar_url}
                          alt={student.full_name || "Avatar"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl font-bold text-[#38A3F1]">
                          {student.full_name?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                      {student.verified && (
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </div>
                      )}
                      {/* Save/Favorite button */}
                      <button
                        onClick={() => handleToggleSave(student.id)}
                        className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-white border border-[#E8F3FD] flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                        title={savedIds.has(student.id) ? "Eliminar de favoritos" : "Guardar en Talent Pool"}
                      >
                        {savedIds.has(student.id) ? (
                          <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                        ) : (
                          <Star className="w-3 h-3 text-[#93B8D4]" />
                        )}
                      </button>
                    </div>
                    
                    <div className="flex-1 min-w-0 pt-1">
                      <Link href={`/pyme/talent/${student.id}`}>
                        <h3 className="text-base font-bold text-[#0D3A6E] hover:text-[#38A3F1] transition-colors truncate">
                          {student.full_name}
                        </h3>
                      </Link>
                      <p className="text-xs text-[#5B8DB8] font-medium mt-1 line-clamp-1">
                        {student.major || student.education || "Estudiante"}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-[#93B8D4] mt-1.5">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span className="truncate">{student.university || "Universidad local"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body (Skills & Location) */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-4 text-xs text-[#5B8DB8]">
                      <MapPin className="w-3.5 h-3.5" />
                      {student.location || "El Salvador"}
                    </div>

                    {/* Skills Wrapper */}
                    <div className="flex flex-wrap gap-1.5 mb-6 mt-auto">
                      {student.skills?.slice(0, 4).map((skill, i) => (
                        <span 
                          key={i} 
                          className="text-[11px] font-medium bg-[#F0F7FF] text-[#0D5FA6] px-2.5 py-1 rounded-lg border border-[#BAD8F7]/50"
                        >
                          {skill}
                        </span>
                      ))}
                      {student.skills && student.skills.length > 4 && (
                        <span className="text-[11px] font-medium bg-gray-50 text-gray-500 px-2.5 py-1 rounded-lg border border-gray-200">
                          +{student.skills.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="pt-4 border-t border-[#F0F7FF] flex items-center justify-between gap-3">
                      {/* Social/Links */}
                      <div className="flex gap-1">
                        {student.linkedin && (
                          <a href={student.linkedin} target="_blank" rel="noreferrer" className="p-2 rounded-lg text-[#93B8D4] hover:bg-[#F0F7FF] hover:text-[#0D5FA6] transition-colors">
                            <LinkedinLogoIcon className="w-4 h-4" />
                          </a>
                        )}
                        {student.github && (
                          <a href={student.github} target="_blank" rel="noreferrer" className="p-2 rounded-lg text-[#93B8D4] hover:bg-[#F0F7FF] hover:text-[#0D3A6E] transition-colors">
                            <GithubLogoIcon className="w-4 h-4" />
                          </a>
                        )}
                        {student.portfolio && (
                          <a href={student.portfolio} target="_blank" rel="noreferrer" className="p-2 rounded-lg text-[#93B8D4] hover:bg-[#F0F7FF] hover:text-[#38A3F1] transition-colors">
                            <Briefcase className="w-4 h-4" />
                          </a>
                        )}
                      </div>

                      {/* Primary Contact Action */}
                      <a
                        href={`mailto:${student.email}?subject=Oportunidad%20de%20Proyecto%20-%20Contacto%20desde%20la%20plataforma`}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#0D3A6E] to-[#1D5A9E] text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:shadow-lg hover:shadow-[#38A3F1]/25 transition-all group/btn"
                      >
                        <Mail className="w-4 h-4" />
                        Contactar
                        <ArrowUpRight className="w-3 h-3 opacity-50 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}