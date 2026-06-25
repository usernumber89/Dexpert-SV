"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Phone, Globe, User, Building2 } from "lucide-react";

type PymeContact = {
  company_name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
};

export function ContactPyMEModal({
  pyme,
  onClose,
}: {
  pyme: PymeContact;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="relative bg-white rounded-2xl shadow-2xl border border-[#E8F3FD] w-full max-w-md overflow-hidden"
        >
          <div className="bg-gradient-to-r from-[#0D3A6E] to-[#1D5A9E] px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/15 backdrop-blur rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#BAD8F7]">
                    Contactar
                  </p>
                  <h3 className="text-base font-bold text-white">{pyme.company_name}</h3>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{ cursor: "pointer" }}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {pyme.contact_person && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F0F7FF] border border-[#E8F3FD]">
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
                  <User className="w-4 h-4 text-[#38A3F1]" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-[#93B8D4] uppercase tracking-wider">
                    Persona de contacto
                  </p>
                  <p className="text-sm font-semibold text-[#0D3A6E]">{pyme.contact_person}</p>
                </div>
              </div>
            )}

            {pyme.email && (
              <a
                href={`mailto:${pyme.email}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#F0F7FF] border border-[#E8F3FD] hover:bg-[#E8F3FD] transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
                  <Mail className="w-4 h-4 text-[#38A3F1]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-[#93B8D4] uppercase tracking-wider">
                    Correo electrónico
                  </p>
                  <p className="text-sm font-semibold text-[#0D3A6E] truncate group-hover:text-[#38A3F1] transition-colors">
                    {pyme.email}
                  </p>
                </div>
              </a>
            )}

            {pyme.phone && (
              <a
                href={`tel:${pyme.phone}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#F0F7FF] border border-[#E8F3FD] hover:bg-[#E8F3FD] transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
                  <Phone className="w-4 h-4 text-[#38A3F1]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-[#93B8D4] uppercase tracking-wider">
                    Teléfono
                  </p>
                  <p className="text-sm font-semibold text-[#0D3A6E] truncate group-hover:text-[#38A3F1] transition-colors">
                    {pyme.phone}
                  </p>
                </div>
              </a>
            )}

            {pyme.website && (
              <a
                href={pyme.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-[#F0F7FF] border border-[#E8F3FD] hover:bg-[#E8F3FD] transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
                  <Globe className="w-4 h-4 text-[#38A3F1]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-[#93B8D4] uppercase tracking-wider">
                    Sitio web
                  </p>
                  <p className="text-sm font-semibold text-[#0D3A6E] truncate group-hover:text-[#38A3F1] transition-colors">
                    {pyme.website.replace(/^https?:\/\//, "")}
                  </p>
                </div>
              </a>
            )}

            {!pyme.email && !pyme.phone && (
              <div className="text-center py-6">
                <p className="text-sm text-[#93B8D4]">Esta empresa no ha compartido información de contacto</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
