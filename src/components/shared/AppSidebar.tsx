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
  HelpCircle, Users, LogOut, Banknote, PanelLeft, GraduationCap, Rocket, Receipt,
  BrainCircuit, BookOpen, Trophy, Star, BarChart3
} from 'lucide-react';
import { DexpertLogo } from "@/components/DexpertLogo";
import { BriefcaseIcon } from "@phosphor-icons/react";

const studentRoutes = [
  { title: 'Panel de Control', url: '/student/dashboard', icon: LayoutDashboard },
  { title: 'Proyectos en Marcha', url: '/student/in-progress', icon: Rocket },
  { title: 'Proyectos', url: '/student/projects', icon: FolderOpen },
  { title: 'Simulación Profesional', url: '/student/simulation', icon: BrainCircuit },
  { title: 'Portafolio', url: '/student/portfolio', icon: BookOpen },
  { title: 'Mi Progreso', url: '/student/experience', icon: Trophy },
  { title: 'Perfil', url: '/student/profile', icon: User },
  { title: 'Certificados', url: '/student/certificates', icon: Award },
  
  { title: 'Soporte', url: '/student/support', icon: HelpCircle },
];

const pymeRoutes = [
  { title: 'Panel de Control', url: '/pyme/dashboard', icon: LayoutDashboard },
  { title: 'Proyectos en Marcha', url: '/pyme/in-progress', icon: Rocket },
  { title: 'Aplicantes / Solicitudes', url: '/pyme/applications', icon: Users },
  { title: "Talento", url: '/pyme/talent', icon: GraduationCap, requiresPremiumPlan: true },
  { title: 'Mi Talent Pool', url: '/pyme/talent-pool', icon: Star, requiresPremiumPlan: true },
  { title: 'Destacados', url: '/pyme/featured-projects', icon: Star, requiresPremiumPlan: true },
  { title: 'Analítica', url: '/pyme/analytics', icon: BarChart3, requiresPremiumPlan: true },
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

  console.log("=== DEXPERT SIDEBAR DEBUG ===");
  console.log("Rol actual:", role);
  console.log("User ID de la sesión:", user?.id);
  console.log("Plan detectado en el estado:", currentPlan);
  console.log("=============================");

  useEffect(() => {
    setMounted(true);

    async function fetchLatestPlan() {
      const params = new URLSearchParams(window.location.search);
      const planFromUrl = params.get('plan');
      if (planFromUrl) {
        console.log("🎯 Plan encontrado en la URL:", planFromUrl);
        setCurrentPlan(planFromUrl.toUpperCase());
      }

      if (!user?.id) return;

      try {
        const supabase = createClient();
        console.log("🔍 Buscando compras en la base de datos para el usuario:", user.id);
        
        const { data, error } = await supabase
          .from('purchases')
          .select('plan')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error("❌ Error de Supabase al leer plan:", error.message);
          return;
        }

        if (data && data.length > 0) {
          console.log("✅ Plan recuperado con éxito de la DB:", data[0].plan);
          setCurrentPlan(data[0].plan);
        } else {
          console.log("⚠️ No se encontraron filas en la tabla 'purchases' para este usuario.");
        }
      } catch (err) {
        console.error("❌ Error crítico en la petición de plan:", err);
      }
    }

    // CORRECCIÓN AQUÍ: Si hay sesión de usuario, buscamos su plan directamente 
    // sin importar si 'role' se quedó colgado en null.
    if (user?.id) {
      fetchLatestPlan();
    }
  }, [user?.id]); // Escuchamos únicamente al cambio del ID de usuario

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  // Render defensivo básico
  if (!mounted || authLoading) {
    return (
      <Sidebar collapsible="icon" className="border-r border-[#BAD8F7] bg-white">
        <div className="flex items-center justify-center h-full">
          <div className="w-5 h-5 border-2 border-[#BAD8F7] border-t-[#38A3F1] rounded-full animate-spin" />
        </div>
      </Sidebar>
    );
  }

  // Validación de acceso premium basada en tu estado de plan actual
  const hasPremiumAccess = currentPlan === 'GROWTH' || currentPlan === 'PRO';
  console.log("¿Tiene acceso Premium?:", hasPremiumAccess);

  const filteredPymeRoutes = pymeRoutes.filter(route => {
    if (route.requiresPremiumPlan && !hasPremiumAccess) {
      return false; 
    }
    return true;
  });

  // Si el rol es STUDENT renderiza studentRoutes, para cualquier otro caso (o null provicional) renderiza las de PYME filtradas
  const routes = role === 'STUDENT' ? studentRoutes : filteredPymeRoutes;
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
            <img src="/1.svg" className=" w-50 transition-all" />
          ) : (
            <div className="mx-auto transition-all">
              <img src="/dex.png" className="w-50"/>
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
                          ? 'justify-center w-10 h-10 mx-auto p-0'
                          : 'justify-start gap-3 px-3 py-2 w-full'
                      } ${
                        isActive
                          ? 'bg-[#F0F7FF] text-[#0D5FA6] font-medium'
                          : 'text-[#5B8DB8] hover:bg-[#F0F7FF] hover:text-[#0D3A6E]'
                      }`}
                    >
                      <item.icon
                        className={`flex-shrink-0 transition-colors ${
                          isCollapsed ? 'w-5 h-5' : 'w-4 h-4'
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
              <p className="text-[10px] text-[#93B8D4] capitalize">
                {role?.toLowerCase() || 'pyme'} {currentPlan && `(${currentPlan.toLowerCase()})`}
              </p>
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

      {isCollapsed && (
        <div className="p-2 border-t border-[#BAD8F7] mt-auto flex flex-col items-center gap-3">
          <Link href={profileHref} title={`${displayName} (${currentPlan || 'Sin Plan'})`}>
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