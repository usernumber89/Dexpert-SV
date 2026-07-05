"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import {
  Mail, Phone, Globe, MapPin, Save, X,
  Camera, Edit, Briefcase, TrendingUp, CheckCircle, Users
} from "lucide-react";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import type { PymeProfile, ProjectStats } from "./types";

function StatItem({ icon: Icon, value, label, color, bg }: {
  icon: LucideIcon; value: number; label: string; color: string; bg: string;
}) {
  return (
    <div className="bg-white rounded-xl p-3 text-center shadow-sm">
      <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mx-auto mb-2`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-[#93B8D4] uppercase tracking-wider">{label}</p>
    </div>
  );
}

function ContactItem({ icon: Icon, value }: { icon: LucideIcon; value: string }) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F0F7FF] transition-colors group">
      <div className="w-8 h-8 bg-[#F0F7FF] rounded-lg flex items-center justify-center group-hover:bg-white transition-colors">
        <Icon className="w-4 h-4 text-[#38A3F1]" />
      </div>
      <span className="text-sm text-[#5B8DB8] truncate">{value}</span>
    </div>
  );
}

type Props = {
  profile: PymeProfile;
  stats: ProjectStats;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onLogoUpload: (file: File) => void;
  saving: boolean;
  uploadingLogo: boolean;
};

export function PymeProfileCard({
  profile, stats, isEditing, onStartEdit, onCancelEdit, onSave,
  onLogoUpload, saving, uploadingLogo,
}: Props) {
  const logoInputRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl border border-[#E8F3FD] shadow-xl overflow-hidden"
    >
      <div className="relative pt-8 pb-4 px-6">
        <div className="relative w-28 h-28 mx-auto">
          {profile.logo_url ? (
            <Image
              src={profile.logo_url}
              alt={profile.company_name}
              fill
              className="rounded-2xl object-cover border-4 border-white shadow-xl"
            />
          ) : (
            <div className="w-full h-full rounded-2xl bg-[#F0F7FF] border-4 border-white shadow-xl flex items-center justify-center">
              <span className="text-3xl font-bold text-[#1D5A9E]">
                {profile.company_name?.charAt(0)?.toUpperCase() || profile.contact_person?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
          )}
          {isEditing && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => logoInputRef.current?.click()}
              disabled={uploadingLogo}
              className="absolute -bottom-3 -right-3 bg-white p-2.5 rounded-full shadow-lg border-2 border-[#BAD8F7] hover:border-[#38A3F1] hover:scale-110 transition-all duration-200"
            >
              {uploadingLogo
                ? <div className="w-4 h-4 border-2 border-[#38A3F1] border-t-transparent rounded-full animate-spin" />
                : <Camera className="w-4 h-4 text-[#38A3F1]" />}
            </motion.button>
          )}
        </div>
        <input ref={logoInputRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) onLogoUpload(f); }} />
      </div>

      <div className="text-center px-6 pb-4">
        <h2 className="text-xl font-bold text-[#0D3A6E] mb-1">{profile.company_name}</h2>
        {profile.industry && (
          <span className="inline-block px-3 py-1 bg-[#F0F7FF] text-[#38A3F1] text-xs font-medium rounded-full">
            {profile.industry}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 p-4 bg-[#F8FBFE] border-y border-[#E8F3FD]">
        <StatItem icon={Briefcase} value={stats.total} label="Proyectos" color="text-[#38A3F1]" bg="bg-[#F0F7FF]" />
        <StatItem icon={Users} value={stats.totalApplications} label="Aplicantes" color="text-[#1D5A9E]" bg="bg-[#F0F7FF]" />
        <StatItem icon={TrendingUp} value={stats.active} label="Activos" color="text-[#38A3F1]" bg="bg-[#F0F7FF]" />
        <StatItem icon={CheckCircle} value={stats.completed} label="Completados" color="text-[#1D5A9E]" bg="bg-[#F0F7FF]" />
      </div>

      <div className="p-6 space-y-3">
        <h3 className="text-xs font-semibold text-[#0D3A6E] uppercase tracking-wider mb-3">Información de Contacto</h3>
        {profile.email && <ContactItem icon={Mail} value={profile.email} />}
        {profile.phone && <ContactItem icon={Phone} value={profile.phone} />}
        {profile.website && (
          <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F0F7FF] transition-colors group">
            <div className="w-8 h-8 bg-[#F0F7FF] rounded-lg flex items-center justify-center group-hover:bg-white transition-colors">
              <Globe className="w-4 h-4 text-[#38A3F1]" />
            </div>
            <a href={profile.website} target="_blank" rel="noopener noreferrer"
              className="text-sm text-[#38A3F1] hover:underline truncate">
              {profile.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
        {profile.location && <ContactItem icon={MapPin} value={profile.location} />}
      </div>

      <div className="p-6 pt-0">
        {!isEditing ? (
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={onStartEdit}
            className="w-full flex items-center justify-center gap-2 bg-[#38A3F1] text-white text-sm font-semibold py-3 rounded-xl hover:shadow-lg transition-all"
          >
            <Edit className="w-4 h-4" /> Editar Perfil
          </motion.button>
        ) : (
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={onSave} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-[#1D9E75] text-white text-sm font-semibold py-3 rounded-xl hover:bg-[#158A5F] hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? "Guardando..." : "Guardar"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={onCancelEdit}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-[#5B8DB8] text-sm font-semibold py-3 rounded-xl hover:bg-gray-200 transition-all"
            >
              <X className="w-4 h-4" /> Cancelar
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
