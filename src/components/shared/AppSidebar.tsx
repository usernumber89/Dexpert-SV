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
    HelpCircle, Briefcase, Users, LogOut, Banknote, PanelLeft,
  } from 'lucide-react';
  import { DexpertLogo } from "@/components/DexpertLogo";
  import { BriefcaseIcon } from "@phosphor-icons/react";

  const studentRoutes = [
    { title: 'Panel de Control', url: '/student/dashboard', icon: LayoutDashboard },
    { title: 'Proyectos', url: '/student/projects', icon: FolderOpen },
    { title: 'Perfil', url: '/student/profile', icon: User },
    { title: 'Certificados', url: '/student/certificates', icon: Award },
    { title: 'Simulador de IA', url: '/student/ai', icon: Bot },
    { title: 'Soporte', url: '/student/support', icon: HelpCircle },
  ];

  const pymeRoutes = [
    { title: 'Panel de Control', url: '/pyme/dashboard', icon: LayoutDashboard },
    { title: 'Aplicantes / Solicitudes', url: '/pyme/applications', icon: Users },
    { title: 'Precios', url: '/pyme/pricing', icon: Banknote },
    { title: 'Perfil', url: '/pyme/profile', icon: User },
    { title: 'Soporte', url: '/pyme/support', icon: HelpCircle },
  ];

  export function AppSidebar() {
    const { state, setOpenMobile, toggleSidebar } = useSidebar();
    const { role, isLoading: roleLoading } = useUserRole();
    const { user, profile, isLoading: authLoading } = useSupabaseAuth();
    const pathname = usePathname();
    const router = useRouter();
    const isCollapsed = state === 'collapsed';

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

    if (!mounted || authLoading || roleLoading) {
      return (
        <Sidebar collapsible="icon" className="border-r border-[#BAD8F7] bg-white">
          <div className="flex items-center justify-center h-full">
            <div className="w-5 h-5 border-2 border-[#BAD8F7] border-t-[#38A3F1] rounded-full animate-spin" />
          </div>
        </Sidebar>
      );
    }

    const routes = role === 'STUDENT' ? studentRoutes : pymeRoutes;
    const profileHref = role === 'STUDENT' ? '/student/profile' : '/pyme/profile';

    const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

    const initials = displayName
      .split(' ')
      .map((n: string) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const avatarUrl = profile?.avatar_url;

    return (
      <Sidebar collapsible="icon" className="border-r border-[#BAD8F7] bg-white transition-all duration-300">
      
        <SidebarHeader 
          className={`py-5 border-b border-[#BAD8F7] flex ${
            isCollapsed ? 'flex-col items-center gap-4 px-2' : 'flex-row items-center justify-between px-4'
          }`}
        >
          <Link href="/" className="flex items-center justify-center" onClick={handleLinkClick}>
            {isCollapsed ? (
            
              <BriefcaseIcon size={32} className="text-[#0D3A6E] transition-all" />
            ) : (
              <div className="mx-auto transition-all">
                <DexpertLogo />
              </div>
            )}
          </Link>
          
          <button 
            onClick={toggleSidebar} 
            className="p-1 rounded-md hover:bg-[#F0F7FF] text-[#93B8D4] transition-colors" 
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <PanelLeft className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </SidebarHeader>

        {/* Nav */}
        <SidebarContent className="px-2 py-3">
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-[10px] font-medium uppercase tracking-widest text-[#93B8D4] px-2 mb-2">
                {role === 'STUDENT' ? 'Estudiante' : 'PYME'}
              </SidebarGroupLabel>
            )}
            <SidebarMenu className={`gap-1 ${isCollapsed ? 'items-center' : ''}`}>
    {routes.map((item) => {
      const isActive = pathname.startsWith(item.url);
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
            <Link
              href={item.url}
              onClick={handleLinkClick}
              className={`flex items-center rounded-lg transition-all duration-200 text-sm ${
                isCollapsed
                  ? 'justify-center w-10 h-10 mx-auto p-0'  // <-- Cuadrado perfecto y centrado en modo colapsado
                  : 'justify-start gap-3 px-3 py-2 w-full' // <-- Alineación a la izquierda en modo expandido
              } ${
                isActive
                  ? 'bg-[#F0F7FF] text-[#0D5FA6] font-medium'
                  : 'text-[#5B8DB8] hover:bg-[#F0F7FF] hover:text-[#0D3A6E]'
              }`}
            >
              <item.icon
                className={`flex-shrink-0 transition-colors ${
                  isCollapsed ? 'w-5 h-5' : 'w-4 h-4' // Opcional: ícono un poco más grande al colapsar
                } ${
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

        {/* Footer Expanded */}
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
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-[#BAD8F7]"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#F0F7FF] border border-[#BAD8F7] flex items-center justify-center text-xs font-medium text-[#0D5FA6] flex-shrink-0">
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
              <span>Cerrar sesión</span>
            </button>
          </div>
        )}

        {/* Footer Collapsed */}
        {isCollapsed && (
          <div className="p-2 border-t border-[#BAD8F7] mt-auto flex flex-col items-center gap-3">
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
              className="p-2 rounded-lg text-[#93B8D4] hover:bg-red-50 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </Sidebar>
    );
  }