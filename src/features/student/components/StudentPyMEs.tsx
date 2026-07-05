"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Building2, MapPin, Search, X, Briefcase, Users,
  Filter, TrendingUp, Phone,
} from "lucide-react";
import Link from "next/link";
import { ContactPyMEModal } from "./ContactPyMEModal";
import { PymeGalleryModal } from "./PymeGalleryModal";

type Pyme = {
  id: string;
  company_name: string;
  description: string | null;
  industry: string | null;
  location: string | null;
  logo_url: string | null;
  website: string | null;
  employee_count: string | null;
  verified: boolean;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
};

type Props = {
  pymes: Pyme[];
  activeProjectCounts: Record<string, number>;
};

const INDUSTRIES = ["All", ...new Set(["Technology", "Marketing", "Design", "Finance", "Education", "Healthcare", "E-commerce", "Other"])];

export function StudentPyMEs({ pymes, activeProjectCounts }: Props) {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All");
  const [contactPyme, setContactPyme] = useState<typeof pymes[0] | null>(null);
  const [galleryPyme, setGalleryPyme] = useState<typeof pymes[0] | null>(null);

  const filtered = useMemo(() => {
    return pymes
      .filter(p => {
        const matchSearch =
          !search ||
          p.company_name.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase()) ||
          p.industry?.toLowerCase().includes(search.toLowerCase());
        const matchIndustry = industry === "All" || p.industry === industry;
        return matchSearch && matchIndustry;
      })
      .sort((a, b) => {
        const aCount = activeProjectCounts[a.id] || 0;
        const bCount = activeProjectCounts[b.id] || 0;
        return bCount - aCount;
      });
  }, [pymes, search, industry, activeProjectCounts]);

  const hasActiveFilters = search || industry !== "All";

  const clearFilters = () => {
    setSearch("");
    setIndustry("All");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F9FF] via-white to-[#EEF6FF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-8">
        {/* Header */}
        <div>
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-brand-mid mb-1 sm:mb-2">
            Conoce a las empresas
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-ink-primary md:text-3xl">
            PyMEs Colaboradoras
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1 sm:mt-2">
            Explora las empresas que publican proyectos y encuentra la oportunidad ideal para ti
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E8F3FD] shadow-sm p-3 sm:p-5">
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-[#BAD8F7] bg-white/80 focus-within:border-[#38A3F1] focus-within:ring-2 focus-within:ring-[#38A3F1]/20 transition-all">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#93B8D4] flex-shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar PyMEs..."
                className="flex-1 text-xs sm:text-sm text-[#0D3A6E] placeholder:text-[#93B8D4] outline-none bg-transparent min-h-[36px]"
              />
              {search && (
                <button onClick={() => setSearch("")} className="p-1.5 hover:bg-[#F0F7FF] rounded min-h-[36px] min-w-[36px] flex items-center justify-center">
                  <X className="w-4 h-4 text-[#93B8D4]" />
                </button>
              )}
            </div>

            <div className="flex gap-2 sm:gap-3">
              <select
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="flex-1 sm:flex-none text-xs sm:text-sm font-medium text-[#0D3A6E] border border-[#BAD8F7] rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 outline-none bg-white/80 cursor-pointer hover:border-[#38A3F1] transition-all min-h-[44px]"
              >
                {INDUSTRIES.map(c => (
                  <option key={c} value={c}>{c === "All" ? "Industria" : c}</option>
                ))}
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#E8F3FD]">
              <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1 bg-[#F0F7FF] rounded-full">
                <Filter className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#38A3F1]" />
                <span className="text-[10px] sm:text-xs font-medium text-[#0D5FA6]">Filtros activos</span>
              </div>
              <button
                onClick={clearFilters}
                className="text-[11px] sm:text-xs font-semibold text-[#38A3F1] hover:text-[#0D5FA6] transition-colors min-h-[44px]"
              >
                Limpiar todo
              </button>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm text-[#5B8DB8]">
            Mostrando <span className="font-semibold text-[#0D3A6E]">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "PyME" : "PyMEs"}
          </p>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-[#93B8D4]">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
            Ordenado por proyectos activos
          </div>
        </div>

        {/* PyMEs grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 sm:gap-4 py-16 sm:py-24">
            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-[#F0F7FF] rounded-xl sm:rounded-2xl flex items-center justify-center">
              <Building2 className="w-7 h-7 sm:w-10 sm:h-10 text-[#BAD8F7]" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-[#0D3A6E]">No se encontraron PyMEs</h3>
            <p className="text-xs sm:text-sm text-[#5B8DB8] text-center max-w-xs sm:max-w-sm">
              No hay empresas registradas en este momento. Vuelve a consultar más tarde.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs sm:text-sm font-medium text-[#38A3F1] hover:underline min-h-[44px]"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((pyme, i) => (
              <motion.div
                key={pyme.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ y: -4 }}
                className="group relative flex flex-col gap-4 rounded-2xl border border-[#E8F3FD] bg-white p-5 shadow-sm transition-all duration-300 hover:border-[#38A3F1]/40 hover:shadow-xl hover:shadow-[#38A3F1]/5"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#F4F9FF]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-3">
                  {/* Logo + Company */}
                  <div className="flex items-start gap-3">
                    {pyme.logo_url ? (
                      <Image
                        src={pyme.logo_url}
                        alt={pyme.company_name}
                        width={56}
                        height={56}
                        className="w-14 h-14 rounded-xl object-cover border border-[#E8F3FD] flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#F0F7FF] to-[#E8F3FD] border border-[#BAD8F7] flex items-center justify-center text-lg font-bold text-[#0D3A6E] shadow-sm flex-shrink-0">
                        {pyme.company_name?.[0]?.toUpperCase() ?? "P"}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-[#0D3A6E] truncate group-hover:text-[#38A3F1] transition-colors">
                          {pyme.company_name}
                        </h3>
                        {pyme.verified && (
                          <span className="w-4 h-4 bg-[#38A3F1] rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                      </div>

                      {pyme.industry && (
                        <span className="inline-block mt-1 text-[10px] font-medium text-[#38A3F1] bg-[#F0F7FF] px-2 py-0.5 rounded-full">
                          {pyme.industry}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {pyme.description && (
                    <p className="text-xs text-[#5B8DB8] line-clamp-2 leading-relaxed">
                      {pyme.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-[10px] text-[#93B8D4]">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {activeProjectCounts[pyme.id] || 0} proyectos activos
                    </span>
                    {pyme.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {pyme.location}
                      </span>
                    )}
                    {pyme.employee_count && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {pyme.employee_count} empleados
                      </span>
                    )}
                  </div>

                  {/* Links */}
                  <div className="flex items-center gap-2 pt-1 border-t border-[#E8F3FD]">
                    <Link
                      href={`/student/projects?pyme=${pyme.id}`}
                      className="flex-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-[#38A3F1] bg-[#F0F7FF] py-2 rounded-lg hover:bg-[#E8F3FD] transition-colors group/link"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Proyectos</span>
                    </Link>
                    <button
                      onClick={() => setGalleryPyme(pyme)}
                      className="flex items-center justify-center gap-1 text-[11px] font-semibold text-[#0D3A6E] bg-[#F0F7FF] py-2 px-3 rounded-lg hover:bg-[#E8F3FD] transition-colors"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Ver Galería</span>
                    </button>
                    <button
                      onClick={() => setContactPyme(pyme)}
                      className="flex items-center justify-center gap-1 text-[11px] font-semibold text-[#0D3A6E] bg-[#F0F7FF] py-2 px-3 rounded-lg hover:bg-[#E8F3FD] transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Contactar</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {contactPyme && (
        <ContactPyMEModal
          pyme={{
            company_name: contactPyme.company_name,
            contact_person: contactPyme.contact_person,
            email: contactPyme.email,
            phone: contactPyme.phone,
            website: contactPyme.website,
          }}
          onClose={() => setContactPyme(null)}
        />
      )}

      {galleryPyme && (
        <PymeGalleryModal
          pyme={galleryPyme}
          activeProjectCount={activeProjectCounts[galleryPyme.id] || 0}
          onClose={() => setGalleryPyme(null)}
        />
      )}
    </div>
  );
}
