"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Lock, Users, ChevronRight, LogOut,
  Eye, EyeOff, UserPlus, UserMinus, LucideIcon
} from "lucide-react";
import type { PymeSettings, TeamMember } from "./types";

function SettingsItem({
  icon: Icon, label, desc, isExpanded, onToggle, children
}: {
  icon: LucideIcon; label: string; desc: string; isExpanded: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-[#F8FBFE] rounded-xl border border-[#E8F3FD] overflow-hidden transition-all">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-[#F0F7FF] transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow transition-all">
            <Icon className="w-5 h-5 text-[#38A3F1]" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-[#0D3A6E]">{label}</p>
            <p className="text-xs text-[#93B8D4]">{desc}</p>
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 text-[#93B8D4] transition-all ${
          isExpanded ? "rotate-90" : "group-hover:translate-x-1"
        }`} />
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-[#E8F3FD]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const STRENGTH_LABELS = ["", "Débil", "Débil", "Media", "Fuerte", "Muy fuerte"] as const;
const STRENGTH_COLORS = ["", "bg-red-400", "bg-red-400", "bg-amber-400", "bg-green-400", "bg-emerald-500"] as const;

function PasswordStrengthBar({ password }: { password: string }) {
  const score = password.length >= 8 ? (password.length >= 12 ? 1 : 0) : 0
    + (/[A-Z]/.test(password) ? 1 : 0)
    + (/[0-9]/.test(password) ? 1 : 0)
    + (/[^A-Za-z0-9]/.test(password) ? 1 : 0)
    + (password.length >= 8 ? 1 : 0);
  const level = Math.min(
    (password.length >= 8 ? 1 : 0)
    + (/[A-Z]/.test(password) ? 1 : 0)
    + (/[0-9]/.test(password) ? 1 : 0)
    + (/[^A-Za-z0-9]/.test(password) ? 1 : 0)
    + (password.length >= 12 ? 1 : 0),
    5
  );

  if (!password) return null;

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i <= level ? STRENGTH_COLORS[level] : "bg-gray-200"}`}
          />
        ))}
      </div>
      <p className={`text-[10px] font-medium ${level <= 2 ? "text-red-400" : level === 3 ? "text-amber-500" : "text-green-500"}`}>
        {STRENGTH_LABELS[level]}
      </p>
    </div>
  );
}

type Props = {
  settings: PymeSettings;
  loadingSettings: boolean;
  savingSettings: boolean;
  expandedSetting: string | null;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  showNewPassword: boolean;
  changingPassword: boolean;
  teamMembers: TeamMember[];
  loadingTeam: boolean;
  newMemberEmail: string;
  newMemberName: string;
  addingMember: boolean;
  onToggleSetting: (key: string) => void;
  onSaveSettings: () => void;
  onToggleSettingItem: (key: keyof PymeSettings) => void;
  onCurrentPasswordChange: (v: string) => void;
  onNewPasswordChange: (v: string) => void;
  onConfirmPasswordChange: (v: string) => void;
  onShowNewPasswordChange: () => void;
  onChangePassword: () => void;
  onNewMemberEmailChange: (v: string) => void;
  onNewMemberNameChange: (v: string) => void;
  onAddMember: () => void;
  onRemoveMember: (id: string) => void;
  onSignOut: () => void;
};

export function PymeSettingsPanel({
  settings, loadingSettings, savingSettings, expandedSetting,
  currentPassword, newPassword, confirmPassword, showNewPassword, changingPassword,
  teamMembers, loadingTeam, newMemberEmail, newMemberName, addingMember,
  onToggleSetting, onSaveSettings, onToggleSettingItem,
  onCurrentPasswordChange, onNewPasswordChange, onConfirmPasswordChange, onShowNewPasswordChange, onChangePassword,
  onNewMemberEmailChange, onNewMemberNameChange, onAddMember, onRemoveMember,
  onSignOut,
}: Props) {
  return (
    <motion.div
      key="configuración"
      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.2 }}
      className="space-y-3"
    >
      <h3 className="text-base font-semibold text-[#0D3A6E] mb-4">Configuración de la Cuenta</h3>

      <SettingsItem
        icon={Bell}
        label="Notificaciones"
        desc="Gestiona cómo recibes alertas y actualizaciones"
        isExpanded={expandedSetting === "notificaciones"}
        onToggle={() => onToggleSetting("notificaciones")}
      >
        <div className="space-y-4">
          {loadingSettings ? (
            <p className="text-sm text-[#93B8D4]">Cargando preferencias...</p>
          ) : (
            <>
              {([
                { key: "notify_new_applicants" as const, label: "Nuevos solicitantes", desc: "Notificar cuando un estudiante se postule a un proyecto" },
                { key: "notify_project_updates" as const, label: "Actualizaciones de proyectos", desc: "Notificar cuando un proyecto cambie de estado" },
                { key: "notify_weekly_summary" as const, label: "Resumen semanal", desc: "Recibir un resumen semanal de actividad" },
              ]).map(item => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-[#0D3A6E]">{item.label}</p>
                    <p className="text-xs text-[#93B8D4]">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => onToggleSettingItem(item.key)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      settings[item.key] ? "bg-[#38A3F1]" : "bg-gray-200"
                    }`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      settings[item.key] ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>
              ))}
              <button
                onClick={onSaveSettings}
                disabled={savingSettings}
                className="w-full py-2.5 bg-[#38A3F1] text-white text-sm font-semibold rounded-xl hover:bg-[#0D5FA6] transition disabled:opacity-50"
              >
                {savingSettings ? "Guardando..." : "Guardar preferencias"}
              </button>
            </>
          )}
        </div>
      </SettingsItem>

      <SettingsItem
        icon={Lock}
        label="Seguridad"
        desc="Actualiza tu contraseña y preferencias de seguridad"
        isExpanded={expandedSetting === "seguridad"}
        onToggle={() => onToggleSetting("seguridad")}
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">Contraseña actual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => onCurrentPasswordChange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#BAD8F7] bg-white/50 text-sm focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
              placeholder="Ingresa tu contraseña actual"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">Nueva contraseña</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={e => onNewPasswordChange(e.target.value)}
                className="w-full px-4 py-3 pr-10 rounded-xl border border-[#BAD8F7] bg-white/50 text-sm focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
                placeholder="Mínimo 8 caracteres, mayúscula y número"
              />
              <button
                onClick={onShowNewPasswordChange}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#93B8D4] hover:text-[#0D3A6E]"
                type="button"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <PasswordStrengthBar password={newPassword} />
          </div>
          {newPassword && (
            <div>
              <label className="text-xs font-semibold text-[#0D3A6E] mb-1.5 block">Confirmar nueva contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => onConfirmPasswordChange(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border bg-white/50 text-sm focus:outline-none focus:ring-2 transition-all ${
                  confirmPassword && confirmPassword !== newPassword
                    ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                    : "border-[#BAD8F7] focus:border-[#38A3F1] focus:ring-[#38A3F1]/20"
                }`}
                placeholder="Repite la nueva contraseña"
              />
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-[10px] text-red-400 mt-1">Las contraseñas no coinciden</p>
              )}
            </div>
          )}
          <button
            onClick={onChangePassword}
            disabled={changingPassword || !currentPassword || !newPassword || confirmPassword !== newPassword}
            className="w-full py-2.5 bg-[#38A3F1] text-white text-sm font-semibold rounded-xl hover:bg-[#0D5FA6] transition disabled:opacity-50"
          >
            {changingPassword ? "Actualizando..." : "Cambiar contraseña"}
          </button>
        </div>
      </SettingsItem>

      <SettingsItem
        icon={Users}
        label="Equipo"
        desc="Añade o elimina miembros del equipo"
        isExpanded={expandedSetting === "equipo"}
        onToggle={() => onToggleSetting("equipo")}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              value={newMemberName}
              onChange={e => onNewMemberNameChange(e.target.value)}
              placeholder="Nombre (opcional)"
              className="px-4 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-sm focus:outline-none focus:border-[#38A3F1]"
            />
            <input
              value={newMemberEmail}
              onChange={e => onNewMemberEmailChange(e.target.value)}
              placeholder="Email del miembro"
              className="px-4 py-2.5 rounded-xl border border-[#BAD8F7] bg-white/50 text-sm focus:outline-none focus:border-[#38A3F1]"
            />
            <button
              onClick={onAddMember}
              disabled={addingMember || !newMemberEmail.trim()}
              className="flex items-center justify-center gap-2 py-2.5 bg-[#38A3F1] text-white text-sm font-semibold rounded-xl hover:bg-[#0D5FA6] transition disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              {addingMember ? "Añadiendo..." : "Añadir"}
            </button>
          </div>

          {loadingTeam ? (
            <p className="text-sm text-[#93B8D4]">Cargando miembros...</p>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-8 bg-[#F8FBFE] rounded-xl">
              <Users className="w-8 h-8 text-[#BAD8F7] mx-auto mb-2" />
              <p className="text-sm text-[#5B8DB8]">Aún no hay miembros en el equipo</p>
              <p className="text-xs text-[#93B8D4]">Añade miembros para gestionar tu empresa juntos</p>
            </div>
          ) : (
            <div className="space-y-2">
              {teamMembers.map(member => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-[#F8FBFE] rounded-xl border border-[#E8F3FD]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#F0F7FF] rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-[#1D5A9E]">
                        {(member.name || member.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0D3A6E]">
                        {member.name || member.email}
                      </p>
                      {member.name && (
                        <p className="text-xs text-[#93B8D4]">{member.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 bg-[#F0F7FF] text-[#38A3F1] rounded-full capitalize">
                      {member.role}
                    </span>
                    <button
                      onClick={() => onRemoveMember(member.id)}
                      className="p-1.5 text-[#93B8D4] hover:text-red-400 hover:bg-red-50 rounded-lg transition"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SettingsItem>

      <div className="pt-4 mt-4 border-t border-[#E8F3FD]">
        <motion.button
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          onClick={onSignOut}
          className="w-full flex items-center justify-between p-4 bg-red-50 rounded-xl hover:bg-red-100 border border-red-100 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <LogOut className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-red-600">Cerrar sesión</p>
              <p className="text-xs text-red-400">Salir de tu cuenta</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </motion.div>
  );
}
