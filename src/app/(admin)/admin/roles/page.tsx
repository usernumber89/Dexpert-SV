'use client';

import { Shield, ShieldCheck, Users, Building2, Crown, Info } from 'lucide-react';

const roles = [
  {
    name: 'ADMIN',
    label: 'Administrador',
    icon: Crown,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    permissions: [
      'Acceso total al sistema',
      'Gestión de usuarios y roles',
      'Ver métricas y KPIs globales',
      'Configurar alertas del sistema',
      'Acceso a logs de auditoría',
      'Exportar datos del sistema',
    ],
  },
  {
    name: 'PYME',
    label: 'PyME (Empresa)',
    icon: Building2,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    permissions: [
      'Publicar y gestionar proyectos',
      'Ver y contactar talento',
      'Gestionar créditos y facturación',
      'Panel de analítica propia',
      'Acceso a talent pool (Premium)',
      'Gestión de equipo',
    ],
  },
  {
    name: 'STUDENT',
    label: 'Estudiante',
    icon: Users,
    color: 'text-[#38A3F1]',
    bg: 'bg-[#F0F7FF]',
    border: 'border-[#BAD8F7]',
    permissions: [
      'Ver y aplicar a proyectos',
      'Participar en simulaciones',
      'Crear portafolio profesional',
      'Obtener certificados',
      'Seguimiento de experiencia',
      'Contactar PyMEs',
    ],
  },
];

export default function RolesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-[#0D3A6E]">Roles y Permisos</h1>
        <p className="text-sm text-[#5B8DB8] mt-0.5">Configuración de roles y control de acceso granular</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div
            key={role.name}
            className={`bg-white rounded-xl border ${role.border} overflow-hidden`}
          >
            <div className={`${role.bg} ${role.color} p-5 flex items-center gap-3`}>
              <div className={`w-10 h-10 rounded-xl ${role.bg} flex items-center justify-center ${role.color} border ${role.border}`}>
                <role.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{role.label}</h3>
                <p className="text-xs opacity-70 font-mono">{role.name}</p>
              </div>
            </div>
            <div className="p-5">
              <ul className="space-y-2">
                {role.permissions.map((perm, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-[#5B8DB8]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#1D9E75] mt-0.5 flex-shrink-0" />
                    <span>{perm}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Gestión de Permisos</p>
          <p className="text-xs text-amber-700 mt-1">
            Los roles se asignan desde la sección "Gestión de Usuarios". Los permisos detallados
            se controlan mediante políticas RLS en Supabase. Para modificar permisos específicos,
            actualiza las políticas en la base de datos.
          </p>
        </div>
      </div>
    </div>
  );
}
