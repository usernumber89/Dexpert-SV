'use client';

import { useState, useEffect } from 'react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import Image from 'next/image';
import Link from 'next/link';
import { useUserRole } from '@/hooks/useUserRole';
import { usePathname } from 'next/navigation';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useTalentAccess } from '@/hooks/useTalentAccess';
import {
  LayoutDashboard, User, FolderOpen,
  HelpCircle, Users, LogOut, Banknote, PanelLeft, GraduationCap, Rocket, Receipt,
  BrainCircuit, BookOpen, Star, BarChart3, BriefcaseBusiness, Building2, Crown, Lock,
  Loader2,
} from 'lucide-react';

const studentRoutes = [
  { title: 'Panel de Control', url: '/student/dashboard', icon: LayoutDashboard },
  { title: 'Proyectos en Marcha', url: '/student/in-progress', icon: Rocket },
  { title: 'Proyectos', url: '/student/projects', icon: FolderOpen },
  { title: 'PyMEs', url: '/student/pymes', icon: Building2 },
  { title: 'Simulación Profesional', url: '/student/simulation', icon: BrainCircuit },
  { title: 'Portafolio', url: '/student/portfolio', icon: BookOpen },
  { title: 'Perfil', url: '/student/profile', icon: User },
  { title: 'Soporte', url: '/student/support', icon: HelpCircle },
];

const pymeRoutes = [
  { title: 'Panel de Control', url: '/pyme/dashboard', icon: LayoutDashboard },
  { title: 'Proyectos en Marcha', url: '/pyme/in-progress', icon: Rocket },
  { title: 'Aplicantes / Solicitudes', url: '/pyme/applications', icon: Users },
  { title: 'Talento', url: '/pyme/talent', icon: GraduationCap, premium: true },
  { title: 'Mi Talent Pool', url: '/pyme/talent-pool', icon: Star, premium: true },
  { title: 'Destacados', url: '/pyme/featured-projects', icon: BriefcaseBusiness },
  { title: 'Analítica', url: '/pyme/analytics', icon: BarChart3 },
  { title: 'Créditos', url: '/pyme/pricing', icon: Banknote },
  { title: 'Facturas', url: '/pyme/invoices', icon: Receipt },
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
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);

  const { hasAccess: talentUnlocked, loading: accessLoading } = useTalentAccess();

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const planFromUrl = params.get('plan');
    if (planFromUrl) setCurrentPlan(planFromUrl.toUpperCase());
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

  if (!mounted || authLoading) {
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
            <Image src="/1.svg" alt="Dexpert" width={50} height={50} className="transition-all" />
          ) : (
            <div className="mx-auto transition-all">
              <Image src="/dex.png" alt="Dexpert" width={200} height={50} />
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

      <SidebarContent className="px-2 py-3">
        {/* Banner de verificación post-pago */}
        {accessLoading && !isCollapsed && (
          <div className="mx-2 mb-3 px-3 py-2 rounded-lg bg-[#F0F7FF] border border-[#BAD8F7] flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 text-[#38A3F1] animate-spin flex-shrink-0" />
            <p className="text-[11px] text-[#5B8DB8]">Verificando tu pago...</p>
          </div>
        )}

        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-[10px] font-medium uppercase tracking-widest text-[#93B8D4] px-2 mb-2">
              {role === 'STUDENT' ? 'Estudiante' : 'PYME'}
            </SidebarGroupLabel>
          )}
          <SidebarMenu className={`gap-1 ${isCollapsed ? 'items-center' : ''}`}>
            {routes.map((item) => {
              const isActive = pathname.startsWith(item.url);
              const isPremium = (item as any).premium === true;
              const isLocked = isPremium && !talentUnlocked;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                    <Link
                      href={item.url}
                      onClick={handleLinkClick}
                      className={`flex items-center rounded-lg transition-all duration-200 text-sm ${
                        isCollapsed
                          ? 'justify-center w-10 h-10 mx-auto p-0'
                          : 'justify-start gap-3 px-3 py-2 w-full'
                      } ${
                        isActive
                          ? 'bg-[#F0F7FF] text-[#0D5FA6] font-medium'
                          : isLocked
                          ? 'text-[#93B8D4] hover:bg-[#F0F7FF] hover:text-[#0D3A6E]'
                          : 'text-[#5B8DB8] hover:bg-[#F0F7FF] hover:text-[#0D3A6E]'
                      }`}
                    >
                      <item.icon
                        className={`flex-shrink-0 transition-colors ${
                          isCollapsed ? 'w-5 h-5' : 'w-4 h-4'
                        } ${
                          isActive ? 'text-[#38A3F1]' : isLocked ? 'text-[#BAD8F7]' : 'text-[#93B8D4]'
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="flex-1 truncate">{item.title}</span>
                      )}
                      {!isCollapsed && isPremium && (
                        <span className={`flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          accessLoading
                            ? 'bg-blue-50 text-blue-500 border border-blue-200'
                            : isLocked
                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                            : 'bg-green-50 text-green-600 border border-green-200'
                        }`}>
                          {accessLoading ? (
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          ) : isLocked ? (
                            <Lock className="w-2.5 h-2.5" />
                          ) : (
                            <Crown className="w-2.5 h-2.5" />
                          )}
                          {accessLoading ? 'Verificando' : isLocked ? 'Premium' : 'Desbloqueado'}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {!isCollapsed && (
        <div className="p-3 border-t border-[#BAD8F7] mt-auto space-y-1">
          <div className="flex items-center justify-between px-1">
            <Link
              href={profileHref}
              onClick={handleLinkClick}
              className="flex items-center gap-2.5 py-2 rounded-lg hover:bg-[#F0F7FF] transition-colors group flex-1 min-w-0"
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-[#BAD8F7]"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#F0F7FF] border border-[#BAD8F7] flex items-center justify-center text-xs font-medium text-[#0D5FA6] flex-shrink-0">
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-[#0D3A6E] truncate">{displayName}</p>
                <p className="text-[10px] text-[#93B8D4] capitalize">
                  {role?.toLowerCase() || 'pyme'} {currentPlan && `(${currentPlan.toLowerCase()})`}
                </p>
              </div>
            </Link>
            </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#93B8D4] hover:bg-red-50 hover:text-red-400 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      )}

      {isCollapsed && (
        <div className="p-2 border-t border-[#BAD8F7] mt-auto flex flex-col items-center gap-3">
          <Link href={profileHref} title={`${displayName} (${currentPlan || 'Sin Plan'})`}>
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                width={32}
                height={32}
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