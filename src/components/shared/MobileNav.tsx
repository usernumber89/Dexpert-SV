'use client';

import { useUserRole } from '@/hooks/useUserRole';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, User, FolderOpen, Rocket, Bot,
  Users, GraduationCap, Building2,
} from 'lucide-react';

const studentTabs = [
  { title: 'Panel', url: '/student/dashboard', icon: LayoutDashboard },
  { title: 'En Marcha', url: '/student/in-progress', icon: Rocket },
  { title: 'Proyectos', url: '/student/projects', icon: FolderOpen },
  { title: 'PyMEs', url: '/student/pymes', icon: Building2 },
  { title: 'Simular', url: '/student/simulation', icon: Bot },
  { title: 'Perfil', url: '/student/profile', icon: User },
];

const pymeTabs = [
  { title: 'Panel', url: '/pyme/dashboard', icon: LayoutDashboard },
  { title: 'En Marcha', url: '/pyme/in-progress', icon: Rocket },
  { title: 'Solicitudes', url: '/pyme/applications', icon: Users },
  { title: 'Talento', url: '/pyme/talent', icon: GraduationCap },
  { title: 'Perfil', url: '/pyme/profile', icon: User },
];

export function MobileNav() {
  const { role, isLoading } = useUserRole();
  const pathname = usePathname();

  if (isLoading) return null;

  const tabs = role === 'STUDENT' ? studentTabs : pymeTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-white border-t border-[#BAD8F7] shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:hidden safe-area-bottom">
      {tabs.map((item) => {
        const isActive = pathname.startsWith(item.url);
        const Icon = item.icon;
        return (
          <Link
            key={item.url}
            href={item.url}
            className={`flex flex-col items-center justify-center gap-0.5 py-2 px-2 min-w-0 flex-1 transition-colors relative ${
              isActive ? 'text-[#0D5FA6]' : 'text-[#93B8D4]'
            }`}
          >
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#0D5FA6] rounded-full" />
            )}
            <Icon className={`w-5 h-5 ${isActive ? 'text-[#0D5FA6]' : 'text-[#93B8D4]'}`} />
            <span className={`text-[10px] font-medium leading-tight ${isActive ? 'text-[#0D5FA6]' : 'text-[#93B8D4]'}`}>
              {item.title}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
