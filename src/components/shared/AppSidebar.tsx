'use client';

import { useState, useEffect } from 'react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { useUserRole } from '@/hooks/useUserRole';
import { usePathname } from 'next/navigation';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, User, FolderOpen, Award, Bot,
  HelpCircle, Briefcase, Users, LogOut,
} from 'lucide-react';

const studentRoutes = [
  { title: 'Dashboard', url: '/student/dashboard', icon: LayoutDashboard },
  { title: 'Projects', url: '/student/projects', icon: FolderOpen },
  { title: 'Profile', url: '/student/profile', icon: User },
  { title: 'Certificates', url: '/student/certificates', icon: Award },
  { title: 'AI Simulator', url: '/student/ai', icon: Bot },
  { title: 'Support', url: '/student/support', icon: HelpCircle },
];

const pymeRoutes = [
  { title: 'Dashboard', url: '/pyme/dashboard', icon: LayoutDashboard },
  { title: 'Applications', url: '/pyme/applications', icon: Users },
  { title: 'Profile', url: '/pyme/profile', icon: User },
  { title: 'Support', url: '/pyme/support', icon: HelpCircle },
];

export function AppSidebar() {
  const { state, setOpenMobile } = useSidebar();
  const { role, isLoading: roleLoading } = useUserRole();
  const { user, profile, isLoading: authLoading } = useSupabaseAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isCollapsed = state === 'collapsed';

  // Estado para hidratación segura
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  // Mientras no esté montado (SSR) o esté cargando, mostrar spinner
  if (!mounted || authLoading || roleLoading) {
    return (
      <Sidebar collapsible="icon" className="border-r border-[#BAD8F7] bg-white">
        <div className="flex items-center justify-center h-full">
          <div className="w-5 h-5 border-2 border-[#BAD8F7] border-t-[#38A3F1] rounded-full animate-spin" />
        </div>
      </Sidebar>
    );
  }

  // Si no hay usuario o no hay rol, podríamos mostrar algo, pero con el spinner ya se evita.
  // Continuamos con el contenido normal.

  const routes = role === 'STUDENT' ? studentRoutes : pymeRoutes;
  const profileHref = role === 'STUDENT' ? '/student/profile' : '/pyme/profile';

  const displayName =
    profile?.full_name ||
    user?.email?.split('@')[0] ||
    'User';

  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const avatarUrl = profile?.avatar_url;

  return (
    <Sidebar collapsible="icon" className="border-r border-[#BAD8F7] bg-white">
      {/* Header */}
      <SidebarHeader className="px-4 py-5 border-b border-[#BAD8F7]">
        <Link href="/" className="flex items-center gap-2.5" onClick={handleLinkClick}>
          <div className="w-7 h-7 bg-[#0D3A6E] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">D</span>
          </div>
          {!isCollapsed && (
            <span className="text-sm font-semibold text-[#0D3A6E]">
              Dexpert<span className="text-[#38A3F1]">.</span>
            </span>
          )}
        </Link>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="px-3 py-3">
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-[10px] font-medium uppercase tracking-widest text-[#93B8D4] px-2 mb-2">
              {role === 'STUDENT' ? 'Student' : 'Business'}
            </SidebarGroupLabel>
          )}
          <SidebarMenu className="gap-0.5">
            {routes.map((item) => {
              const isActive = pathname.startsWith(item.url);
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                    <Link
                      href={item.url}
                      onClick={handleLinkClick}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                        isActive
                          ? 'bg-[#F0F7FF] text-[#0D5FA6] font-medium'
                          : 'text-[#5B8DB8] hover:bg-[#F0F7FF] hover:text-[#0D3A6E]'
                      }`}
                    >
                      <item.icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive ? 'text-[#38A3F1]' : 'text-[#93B8D4]'
                        }`}
                      />
                      {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-[#BAD8F7] mt-auto space-y-1">
          <Link
            href={profileHref}
            onClick={handleLinkClick}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#F0F7FF] transition-colors group"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-[#BAD8F7]"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#F0F7FF] border border-[#BAD8F7] flex items-center justify-center text-xs font-medium text-[#0D5FA6] flex-shrink-0">
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#0D3A6E] truncate">{displayName}</p>
              <p className="text-[10px] text-[#93B8D4] capitalize">{role?.toLowerCase()}</p>
            </div>
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#93B8D4] hover:bg-red-50 hover:text-red-400 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      )}

      {/* Collapsed footer */}
      {isCollapsed && (
        <div className="p-2 border-t border-[#BAD8F7] mt-auto flex flex-col items-center gap-2">
          <Link href={profileHref} title={displayName}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover border border-[#BAD8F7]"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#F0F7FF] border border-[#BAD8F7] flex items-center justify-center text-xs font-medium text-[#0D5FA6]">
                {initials}
              </div>
            )}
          </Link>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="p-1.5 rounded-lg text-[#93B8D4] hover:bg-red-50 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </Sidebar>
  );
}