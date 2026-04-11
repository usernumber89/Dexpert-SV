'use client';

import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { useUserRole } from '@/hooks/useUserRole';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  LayoutDashboard, User, FolderOpen, Award, Bot, HelpCircle, Briefcase, Users,
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
  { title: 'My Projects', url: '/pyme/projects', icon: Briefcase },
  { title: 'Applications', url: '/pyme/applications', icon: Users },
  { title: 'Support', url: '/pyme/support', icon: HelpCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { role, isLoading } = useUserRole();
  const { user } = useUser();
  const pathname = usePathname();
  const isCollapsed = state === 'collapsed';

  if (isLoading) {
    return (
      <Sidebar collapsible="icon" className="border-r border-gray-100 bg-white">
        <div className="flex items-center justify-center h-full">
          <div className="w-5 h-5 border-2 border-blue-200 border-t-[#2196F3] rounded-full animate-spin" />
        </div>
      </Sidebar>
    );
  }

  const routes = role === 'STUDENT' ? studentRoutes : pymeRoutes;
  const initials = user?.fullName
    ?.split(' ').map(n => n[0]).slice(0, 2).join('') ?? role?.[0] ?? 'U';

  return (
    <Sidebar collapsible="icon" className="border-r border-gray-100 bg-white">

      <SidebarHeader className="px-4 py-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#0A2243] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">D</span>
          </div>
          {!isCollapsed && (
            <span className="text-sm font-semibold text-[#0A2243]">
              Dexpert<span className="text-[#2196F3]">.</span>
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-3">
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-[10px] font-medium uppercase tracking-widest text-gray-400 px-2 mb-2">
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
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                        isActive
                          ? 'bg-blue-50 text-[#0C447C] font-medium'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#2196F3]' : 'text-gray-400'}`} />
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
        <div className="p-3 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gray-50">
            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-xs font-medium text-[#0C447C] flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">
                {user?.fullName ?? 'Dexpert User'}
              </p>
              <p className="text-[10px] text-gray-400 capitalize">
                {role?.toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
}