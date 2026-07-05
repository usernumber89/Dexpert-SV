"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Briefcase, MapPin, Users, Phone, Globe, Mail } from "lucide-react";
import { ProfileGallery } from "@/components/ProfileGallery";

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
  pyme: Pyme;
  activeProjectCount: number;
  onClose: () => void;
};

export function PymeGalleryModal({ pyme, activeProjectCount, onClose }: Props) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 sm:pt-16 overflow-y-auto">
        <div className="fixed inset-0 bg-black/40" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl border border-[#E8F3FD] shadow-2xl w-full max-w-2xl overflow-hidden z-10 my-4"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#F0F7FF] to-[#E8F3FD] p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {pyme.logo_url ? (
                  <Image
                    src={pyme.logo_url}
                    alt={pyme.company_name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-xl object-cover border border-[#E8F3FD]"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#F0F7FF] to-[#E8F3FD] border border-[#BAD8F7] flex items-center justify-center text-xl font-bold text-[#0D3A6E]">
                    {pyme.company_name?.[0]?.toUpperCase() ?? "P"}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-[#0D3A6E]">{pyme.company_name}</h2>
                    {pyme.verified && (
                      <span className="w-4 h-4 bg-[#38A3F1] rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </div>
                  {pyme.industry && (
                    <span className="inline-block mt-1 text-[11px] font-medium text-[#38A3F1] bg-white px-2 py-0.5 rounded-full">
                      {pyme.industry}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/50 transition-colors">
                <X className="w-5 h-5 text-[#5B8DB8]" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Description */}
            {pyme.description && (
              <div>
                <h3 className="text-sm font-semibold text-[#0D3A6E] mb-2">Descripción</h3>
                <p className="text-sm text-[#5B8DB8] leading-relaxed">{pyme.description}</p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#F8FBFE] rounded-xl p-3 text-center">
                <Briefcase className="w-4 h-4 text-[#38A3F1] mx-auto mb-1" />
                <p className="text-sm font-bold text-[#0D3A6E]">{activeProjectCount}</p>
                <p className="text-[10px] text-[#93B8D4]">Proyectos</p>
              </div>
              {pyme.location && (
                <div className="bg-[#F8FBFE] rounded-xl p-3 text-center">
                  <MapPin className="w-4 h-4 text-[#38A3F1] mx-auto mb-1" />
                  <p className="text-xs font-medium text-[#0D3A6E] truncate">{pyme.location}</p>
                  <p className="text-[10px] text-[#93B8D4]">Ubicación</p>
                </div>
              )}
              {pyme.employee_count && (
                <div className="bg-[#F8FBFE] rounded-xl p-3 text-center">
                  <Users className="w-4 h-4 text-[#38A3F1] mx-auto mb-1" />
                  <p className="text-sm font-bold text-[#0D3A6E]">{pyme.employee_count}</p>
                  <p className="text-[10px] text-[#93B8D4]">Empleados</p>
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div className="flex flex-wrap gap-2">
              {pyme.email && (
                <a href={`mailto:${pyme.email}`} className="flex items-center gap-1.5 text-xs text-[#38A3F1] bg-[#F0F7FF] px-3 py-1.5 rounded-lg hover:bg-[#E8F3FD] transition">
                  <Mail className="w-3.5 h-3.5" /> {pyme.email}
                </a>
              )}
              {pyme.phone && (
                <a href={`tel:${pyme.phone}`} className="flex items-center gap-1.5 text-xs text-[#38A3F1] bg-[#F0F7FF] px-3 py-1.5 rounded-lg hover:bg-[#E8F3FD] transition">
                  <Phone className="w-3.5 h-3.5" /> {pyme.phone}
                </a>
              )}
              {pyme.website && (
                <a href={pyme.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[#38A3F1] bg-[#F0F7FF] px-3 py-1.5 rounded-lg hover:bg-[#E8F3FD] transition">
                  <Globe className="w-3.5 h-3.5" /> Sitio web
                </a>
              )}
            </div>

            {/* Gallery */}
            <div>
              <h3 className="text-sm font-semibold text-[#0D3A6E] mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-[#38A3F1] rounded-full" />
                Galería
              </h3>
              <ProfileGallery
                ownerId={pyme.id}
                type="pyme"
                isOwner={false}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
