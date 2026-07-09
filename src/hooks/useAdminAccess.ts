'use client';

import { useUserRole } from '@/hooks/useUserRole';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export function useAdminAccess() {
  const { role, isLoading: roleLoading } = useUserRole();
  const { user } = useSupabaseAuth();

  return {
    isAdmin: role === 'ADMIN',
    isLoading: roleLoading,
    user,
  };
}
