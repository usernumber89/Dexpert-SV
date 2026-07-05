"use client";

import { Calendar, Users, MapPin, MessageSquareCheck } from "lucide-react";
import { ProfileGallery } from "@/components/ProfileGallery";
import type { PymeProfile } from "./types";

type Props = {
  profile: PymeProfile;
};

export function PymeProfileInfo({ profile }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-[#0D3A6E] mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-[#1D5A9E] rounded-full" />
          Descripción de la Empresa
        </h3>
        <p className="text-sm text-[#5B8DB8] leading-relaxed">
          {profile.description || "Sin descripción. Agregá una descripción para que los estudiantes conozcan tu empresa."}
        </p>
      </div>

      <div>
        <h3 className="text-base font-semibold text-[#0D3A6E] mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-[#1D5A9E] rounded-full" />
          Detalles de la Empresa
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-[#F0F7FF] to-white rounded-xl p-4 border border-[#E8F3FD]">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-[#38A3F1]" />
              <p className="text-xs text-[#93B8D4] uppercase tracking-wider">Año de Fundación</p>
            </div>
            <p className="text-lg font-semibold text-[#0D3A6E]">
              {profile.founded_year || "—"}
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#F0F7FF] to-white rounded-xl p-4 border border-[#E8F3FD]">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-[#38A3F1]" />
              <p className="text-xs text-[#93B8D4] uppercase tracking-wider">Empleados</p>
            </div>
            <p className="text-lg font-semibold text-[#0D3A6E]">
              {profile.employee_count || "—"}
            </p>
          </div>
          <div className="col-span-2 bg-gradient-to-br from-[#F0F7FF] to-white rounded-xl p-4 border border-[#E8F3FD]">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-[#38A3F1]" />
              <p className="text-xs text-[#93B8D4] uppercase tracking-wider">Ubicación</p>
            </div>
            <p className="text-base font-medium text-[#0D3A6E]">
              {profile.location || "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-r from-[#0D3A6E] to-[#1D5A9E] rounded-xl p-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full opacity-5 blur-2xl" />
        <div className="relative flex items-start gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
            <MessageSquareCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold mb-1">Completa tu perfil</p>
            <p className="text-[#BAD8F7] text-xs">
              Las empresas con perfiles completos reciben 3x más solicitudes de calidad
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <h3 className="text-base font-semibold text-[#0D3A6E] mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-[#1D5A9E] rounded-full" />
          Galería
        </h3>
        <ProfileGallery
          ownerId={profile.id}
          type="pyme"
          isOwner={true}
        />
      </div>
    </div>
  );
}
