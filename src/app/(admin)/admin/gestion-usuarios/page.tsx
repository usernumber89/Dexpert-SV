'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Shield, ShieldCheck } from 'lucide-react';
import { fetchAdminUsers, updateUserRole } from '@/lib/admin/api';
import { SectionHeader } from '@/components/admin/SectionHeader';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { toast } from 'sonner';
import type { AdminUser } from '@/lib/admin/types';

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRoleChange = async (userId: string, newRole: 'STUDENT' | 'PYME' | 'ADMIN') => {
    try {
      await updateUserRole(userId, newRole);
      toast.success(`Rol actualizado a ${newRole}`);
      loadData();
    } catch (err) {
      toast.error('Error al actualizar rol');
    }
  };

  const columns: Column<AdminUser>[] = [
    {
      key: 'fullName',
      header: 'Nombre',
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
            u.role === 'STUDENT' ? 'bg-[#F0F7FF] text-[#38A3F1]' : u.role === 'PYME' ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-600'
          }`}>
            {u.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-[#0D3A6E]">{u.fullName}</p>
            <p className="text-[10px] text-[#93B8D4]">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Rol',
      render: (u) => <StatusBadge status={u.role} />,
    },
    {
      key: 'createdAt',
      header: 'Registro',
      sortable: true,
      render: (u) => (
        <span className="text-xs text-[#5B8DB8]">
          {new Date(u.createdAt).toLocaleDateString('es-SV', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Estado',
      render: (u) => (
        <StatusBadge status={u.isActive ? 'active' : 'inactive'} />
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      render: (u) => (
        <div className="flex items-center gap-1 justify-end">
          {['STUDENT', 'PYME', 'ADMIN'].map((role) => (
            <button
              key={role}
              onClick={(e) => {
                e.stopPropagation();
                handleRoleChange(u.id, role as any);
              }}
              className={`px-2 py-1 text-[10px] font-medium rounded-md transition-colors ${
                u.role === role
                  ? 'bg-[#F0F7FF] text-[#38A3F1] border border-[#38A3F1]/30'
                  : 'text-[#93B8D4] hover:text-[#0D3A6E] hover:bg-[#F0F7FF] border border-transparent'
              }`}
            >
              {role === 'ADMIN' ? <ShieldCheck className="w-3 h-3 inline mr-1" /> : <Shield className="w-3 h-3 inline mr-1" />}
              {role}
            </button>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div>
      <SectionHeader
        title="Gestión de Usuarios"
        description="Administrar perfiles, roles y estado de cuentas"
        actions={
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-[#E8F3FD] rounded-lg text-[#0D3A6E] hover:bg-[#F0F7FF] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        searchable
        searchPlaceholder="Buscar por nombre o email..."
        keyExtractor={(u) => u.id}
      />
    </div>
  );
}
