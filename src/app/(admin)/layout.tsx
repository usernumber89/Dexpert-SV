import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin — Dexpert',
  description: 'Panel de administración y dashboard CEO de Dexpert',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-[#F5F8FC]">
        <AdminSidebar />
        <div className="flex-1 ml-64 min-w-0">
          <main className="p-6">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
