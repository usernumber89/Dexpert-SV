// src/app/(app)/layout.tsx
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/AppSidebar";
// ❌ NO importes globals.css aquí
// ❌ NO importes ClerkProvider aquí (ya está en el RootLayout)
// ❌ NO importes TooltipProvider aquí (ya está en el RootLayout)

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}