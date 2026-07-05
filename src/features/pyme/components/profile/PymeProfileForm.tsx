"use client";

import type { PymeProfile } from "./types";

type Props = {
  editedProfile: Partial<PymeProfile>;
  onChange: (updates: Partial<PymeProfile>) => void;
};

export function PymeProfileForm({ editedProfile, onChange }: Props) {
  const fields = [
    { key: "company_name" as const, label: "Nombre de la Empresa", type: "text", required: true, colSpan: true },
    { key: "contact_person" as const, label: "Persona de Contacto", type: "text", required: true, colSpan: false },
    { key: "email" as const, label: "Dirección de Email", type: "email", required: true, colSpan: true },
    { key: "phone" as const, label: "Número de Teléfono", type: "tel", required: false, colSpan: false },
    { key: "website" as const, label: "URL del Sitio Web", type: "url", required: false, colSpan: false },
    { key: "industry" as const, label: "Industria", type: "text", required: false, colSpan: false },
    { key: "founded_year" as const, label: "Año de Fundación", type: "text", required: false, colSpan: false },
    { key: "location" as const, label: "Ubicación", type: "text", required: false, colSpan: false },
  ] as const;

  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        {fields.map(f => (
          <div key={f.key} className={f.colSpan ? "md:col-span-2" : ""}>
            <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">
              {f.label} {f.required && <span className="text-red-400">*</span>}
            </label>
            <input
              type={f.type}
              value={(editedProfile as any)[f.key] ?? ""}
              onChange={e => onChange({ ...editedProfile, [f.key]: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-[#BAD8F7] bg-white/50 text-sm focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
              placeholder={`Ingresa tu ${f.label.toLowerCase()}`}
            />
          </div>
        ))}
        <div className="md:col-span-2">
          <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">Cantidad de Empleados</label>
          <select
            value={editedProfile.employee_count ?? ""}
            onChange={e => onChange({ ...editedProfile, employee_count: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-[#BAD8F7] bg-white/50 text-sm focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all cursor-pointer"
          >
            <option value="">Seleccionar cantidad de empleados...</option>
            {["1-10", "11-50", "51-200", "201-500", "500+"].map(v => (
              <option key={v} value={v}>{v} empleados</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">Descripción de la Empresa</label>
          <textarea
            value={editedProfile.description ?? ""}
            onChange={e => onChange({ ...editedProfile, description: e.target.value })}
            rows={5}
            className="w-full px-4 py-3 rounded-xl border border-[#BAD8F7] bg-white/50 text-sm focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all resize-none"
            placeholder="Cuéntanos sobre tu empresa..."
          />
        </div>
      </div>
    </div>
  );
}
