// src/app/(app)/layout.tsx
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { MobileNav } from "@/components/shared/MobileNav";
import { MobileTopBar } from "@/components/shared/MobileTopBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <MobileTopBar />
          <main className="flex-1 overflow-auto pb-16 md:pb-0">
            {children}
          </main>
        </div>
      </div>
      <MobileNav />
    </SidebarProvider>
  );
}