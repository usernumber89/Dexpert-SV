import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useEffect, useState } from "react";

type UserRole = "STUDENT" | "PYME" | "ADMIN" | null;

export function useUserRole() {
  const { profile, isLoading: authLoading } = useSupabaseAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    const customProfile = profile as { role?: UserRole } | null;
    setRole(customProfile?.role ?? null);
    setIsLoading(false);
  }, [profile, authLoading]);

  return { role, isLoading };
}
