'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  DollarSign,
  Users,
  FolderKanban,
  Activity,
  Settings,
  UserCog,
  Shield,
  Bell,
  FileText,
  LogOut,
  PanelLeft,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import Image from 'next/image';

const navItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin',
    exact: true,
  },
  {
    title: 'Finanzas',
    icon: DollarSign,
    href: '/admin/finanzas',
  },
  {
    title: 'Usuarios',
    icon: Users,
    href: '/admin/usuarios',
  },
  {
    title: 'Proyectos',
    icon: FolderKanban,
    href: '/admin/proyectos',
  },
  {
    title: 'Rendimiento',
    icon: Activity,
    href: '/admin/rendimiento',
  },
  {
    title: 'Administración',
    icon: Settings,
    children: [
      { title: 'Gestión de Usuarios', icon: UserCog, href: '/admin/gestion-usuarios' },
      { title: 'Roles', icon: Shield, href: '/admin/roles' },
      { title: 'Auditoría', icon: FileText, href: '/admin/auditoria' },
      { title: 'Alertas', icon: Bell, href: '/admin/alertas' },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAdminAccess();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('Administración');

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-64'
      } min-h-screen bg-[#0D1B2A] text-white flex flex-col transition-all duration-300 fixed left-0 top-0 z-30`}
    >
      {/* Header */}
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-4 h-16 border-b border-white/10`}>
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <Image src="/1.svg" alt="Dexpert" width={28} height={28} />
            <span className="font-semibold text-sm tracking-tight">Dexpert Admin</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        >
          <PanelLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          if (item.children) {
            const isExpanded = expandedSection === item.title;
            return (
              <div key={item.title}>
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : item.title)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    collapsed ? 'justify-center' : ''
                  } text-white/60 hover:text-white hover:bg-white/10`}
                  title={item.title}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.title}</span>
                      {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </>
                  )}
                </button>
                {isExpanded && !collapsed && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive(child.href)
                            ? 'bg-[#38A3F1]/20 text-[#38A3F1]'
                            : 'text-white/50 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <child.icon className="w-4 h-4" />
                        <span>{child.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                collapsed ? 'justify-center' : ''
              } ${
                isActive(item.href!, item.exact)
                  ? 'bg-[#38A3F1]/20 text-[#38A3F1]'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              title={item.title}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`border-t border-white/10 p-3 ${collapsed ? 'text-center' : ''}`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-full bg-[#38A3F1]/30 flex items-center justify-center text-xs font-medium text-[#38A3F1] flex-shrink-0">
            {user?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate text-white/80">{user?.email || 'Admin'}</p>
              <p className="text-[10px] text-white/40">Administrador</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
